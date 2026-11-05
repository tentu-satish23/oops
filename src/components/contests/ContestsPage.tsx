import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Play, Award, CheckCircle2, AlertCircle, ChevronRight, Send, ArrowLeft, Shield, Users } from 'lucide-react';
import { api } from '../../services/api';
import { Contest, ContestProblem } from '../../types';

interface ContestsPageProps {
  initialContestSlug?: string | null;
  onBackToDashboard: () => void;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({
  initialContestSlug,
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes countdown in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null);

  useEffect(() => {
    async function loadContests() {
      try {
        setLoading(true);
        const data = await api.getContests();
        setContests(data.contests || []);

        if (initialContestSlug) {
          const matched = (data.contests || []).find((c: Contest) => c.slug === initialContestSlug);
          if (matched) {
            handleOpenContest(matched.slug);
          }
        }
      } catch (err) {
        console.error('Failed to load contests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContests();
  }, [initialContestSlug]);

  const handleOpenContest = async (slug: string) => {
    try {
      setLoading(true);
      const contestData = await api.getContest(slug);
      setSelectedContest(contestData);
      setIsWorkspaceOpen(true);
      setTimeLeft(contestData.durationMinutes * 60);
      if (contestData.problems && contestData.problems.length > 0) {
        setActiveQuestionIdx(0);
        setCode(contestData.problems[0].starterCode || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (!isWorkspaceOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkspaceOpen, timeLeft]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectQuestion = (idx: number) => {
    if (!selectedContest?.problems) return;
    setActiveQuestionIdx(idx);
    setCode(selectedContest.problems[idx].starterCode || '');
    setSubmissionFeedback(null);
  };

  const handleContestSubmit = async () => {
    if (!selectedContest?.problems) return;
    const currentQ = selectedContest.problems[activeQuestionIdx];
    try {
      setSubmitting(true);
      const res = await api.submitContest(selectedContest.slug, {
        problemId: currentQ.problemId,
        code
      });
      setSubmissionFeedback(res);

      if (res.status === 'Accepted') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      setSubmissionFeedback({ status: 'Error', error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // 1. CONTEST WORKSPACE VIEW (When participating in a live contest)
  if (isWorkspaceOpen && selectedContest) {
    const currentQuestion = selectedContest.problems[activeQuestionIdx] || selectedContest.problems[0];

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#0B1120]">

        {/* Live Contest Bar */}
        <div className="h-12 bg-[#151F32] border-b border-white/5 px-4 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsWorkspaceOpen(false)}
              className="flex items-center space-x-1 text-xs font-mono text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leave Arena</span>
            </button>
            <span className="text-gray-600">|</span>
            <span className="text-xs font-mono font-bold text-white truncate max-w-xs sm:max-w-md">
              {selectedContest.title}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Countdown Clock */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={handleContestSubmit}
              disabled={submitting || timeLeft <= 0}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-mono text-xs font-bold shadow-glow-orange hover:opacity-95 transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Submit Solution</span>
            </button>
          </div>
        </div>

        {/* Question Selector Tabs (Q1, Q2, Q3...) */}
        <div className="bg-[#111A2C] px-4 py-2 border-b border-white/5 flex items-center space-x-2 overflow-x-auto text-xs font-mono">
          {selectedContest.problems.map((prob, idx) => (
            <button
              key={prob.id}
              onClick={() => handleSelectQuestion(idx)}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-2 ${
                activeQuestionIdx === idx
                  ? 'bg-[#F89820] text-black font-bold'
                  : 'bg-[#151F32] text-gray-400 hover:text-white'
              }`}
            >
              <span>Q{idx + 1}: {prob.title}</span>
              <span className="text-[10px] opacity-80">({prob.points} pts)</span>
            </button>
          ))}
        </div>

        {/* Workspace Dual Panes */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

          {/* Left Pane: Question Statement */}
          <div className="lg:col-span-5 p-5 overflow-y-auto border-r border-white/5 space-y-4 text-sm text-gray-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {currentQuestion.title}
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#F89820]/15 text-[#F89820]">
                {currentQuestion.points} Points
              </span>
            </div>

            <div className="whitespace-pre-line text-xs font-mono leading-relaxed text-gray-200">
              {currentQuestion.description || 'Contest problem description loaded.'}
            </div>

            {/* Submission Feedback Banner */}
            {submissionFeedback && (
              <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                submissionFeedback.status === 'Accepted'
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
                  : 'bg-red-500/15 border-red-500/40 text-red-400'
              }`}>
                <div className="font-bold flex items-center space-x-1.5">
                  {submissionFeedback.status === 'Accepted' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>Status: {submissionFeedback.status}</span>
                </div>
                {submissionFeedback.status === 'Accepted' && (
                  <div>Score +{currentQuestion.points} points awarded to leaderboard!</div>
                )}
                {submissionFeedback.errorMessage && (
                  <div className="text-[11px] text-red-300">{submissionFeedback.errorMessage}</div>
                )}
              </div>
            )}
          </div>

          {/* Right Pane: Monaco Editor */}
          <div className="lg:col-span-7 flex flex-col bg-[#0B1120]">
            <div className="px-4 py-2 bg-[#151F32] border-b border-white/5 text-xs font-mono text-gray-400">
              Contest Editor — Java 17 LTS (Strict Time Limit: 2000ms)
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="java"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', Consolas, monospace",
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  tabSize: 4
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CONTESTS HOME VIEW (Browse Daily, Weekly, Monthly)
  const currentTabContests = contests.filter((c) => c.type === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Trophy className="w-6 h-6 text-[#F89820]" />
            <span>OOP'S ORACLE Coding Contests</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Test your algorithmic prowess under timed competitive pressure with automated scoring & leaderboards.
          </p>
        </div>
      </div>

      {/* Main 3 Tabs: Daily, Weekly, Monthly */}
      <div className="flex rounded-xl bg-[#151F32] p-1 border border-white/5">
        {(['Daily', 'Weekly', 'Monthly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-mono font-semibold rounded-lg transition ${
              activeTab === tab
                ? 'bg-[#F89820] text-black shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {tab.toUpperCase()} CONTEST
          </button>
        ))}
      </div>

      {/* Contests Cards List */}
      <div className="space-y-4">
        {currentTabContests.map((contest) => (
          <div
            key={contest.id}
            className="glass-card rounded-2xl border border-white/5 p-6 hover:border-[#F89820]/40 transition space-y-5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F89820]/15 text-[#F89820] border border-[#F89820]/30">
                    {contest.type} ARENA
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {contest.durationMinutes} Minutes • {contest.problems?.length || 2} Problems
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-sans">
                  {contest.title}
                </h3>
                <p className="text-xs text-gray-400 max-w-2xl font-mono">
                  {contest.description}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleOpenContest(contest.slug)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-xs font-mono shadow-glow-orange hover:opacity-95 transition flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Enter Contest Workspace</span>
                </button>
              </div>
            </div>

            {/* Questions included in this contest */}
            <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {contest.problems?.map((prob, i) => (
                <div key={prob.id} className="p-3 rounded-lg bg-[#0B1120] border border-white/5 text-xs font-mono space-y-1">
                  <div className="text-gray-500 text-[10px]">Question {i + 1}</div>
                  <div className="text-white font-medium truncate">{prob.title}</div>
                  <div className="text-[#F89820] font-bold">{prob.points} Points</div>
                </div>
              ))}
            </div>

            {/* Contest Rules Accordion */}
            <div className="p-3 rounded-xl bg-[#0B1120]/60 border border-white/5 space-y-1.5 text-xs font-mono text-gray-400">
              <div className="text-white font-semibold flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-[#F89820]" />
                <span>Contest Rules:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {contest.rules?.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Live Leaderboard */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-white uppercase flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Live Leaderboard</span>
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  {contest.participantsCount} Developers Registered
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0B1120] text-gray-400">
                    <tr>
                      <th className="py-2.5 px-3 w-16">Rank</th>
                      <th className="py-2.5 px-3">Developer</th>
                      <th className="py-2.5 px-3">Solved</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Finish Time</th>
                      <th className="py-2.5 px-3">Penalty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {contest.leaderboard?.map((entry) => (
                      <tr key={entry.rank} className="hover:bg-white/5">
                        <td className="py-2 px-3 font-bold text-white">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </td>
                        <td className="py-2 px-3 font-medium text-white flex items-center space-x-2">
                          <span>{entry.avatar}</span>
                          <span>{entry.username}</span>
                        </td>
                        <td className="py-2 px-3 text-[#22C55E]">{entry.solvedCount} / {contest.problems?.length}</td>
                        <td className="py-2 px-3 font-bold text-[#F89820]">{entry.totalScore}</td>
                        <td className="py-2 px-3 text-gray-400">{entry.finishTime}</td>
                        <td className="py-2 px-3 text-gray-500">+{entry.penalty}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
