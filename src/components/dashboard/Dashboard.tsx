import React, { useEffect, useState } from 'react';
import { Flame, CheckCircle2, Trophy, BookOpen, ArrowRight, Play, Sparkles, TrendingUp, Calendar, Code, Clock } from 'lucide-react';
import { User, Problem, Course, Contest } from '../../types';
import { api } from '../../services/api';

interface DashboardProps {
  user: User;
  onOpenProblem: (slug: string) => void;
  onOpenCourse: (slug: string) => void;
  onOpenContest: (slug: string) => void;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onOpenProblem,
  onOpenCourse,
  onOpenContest,
  onNavigate
}) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [profRes, contRes, crsRes] = await Promise.all([
          api.getProfile(user.id),
          api.getContests(),
          api.getCourses()
        ]);
        setProfileData(profRes);
        setContests(contRes.contests || []);
        setCourses(crsRes.courses || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user.id]);

  const stats = profileData?.stats || {
    totalSolved: 4,
    easySolved: 2,
    mediumSolved: 1,
    hardSolved: 1,
    totalSubmissions: 5,
    acceptanceRate: 80.0
  };

  const heatmap = profileData?.heatmap || {};
  const recentSubmissions = profileData?.submissionHistory || [];

  // Generate 52 weeks (364 days) grid for activity heatmap
  const renderHeatmapGrid = () => {
    const today = new Date();
    const cells = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = heatmap[dateStr] || 0;

      let color = 'bg-[#151F32]';
      if (count === 1) color = 'bg-[#F89820]/30';
      else if (count === 2) color = 'bg-[#F89820]/60';
      else if (count >= 3) color = 'bg-[#F89820] shadow-[0_0_6px_rgba(248,152,32,0.6)]';

      cells.push(
        <div
          key={dateStr}
          title={`${dateStr}: ${count} submissions`}
          className={`w-3 h-3 rounded-[2px] ${color} transition hover:ring-1 hover:ring-white cursor-pointer`}
        />
      );
    }
    return cells;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* 1. HERO BANNER: Welcome & Motivation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#151F32] via-[#1B263B] to-[#151F32] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#F89820]/15 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F89820]/20 border border-[#F89820]/40 text-[#F89820] text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OOP'S ORACLE DEVELOPER ARENA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-[#F89820]">{user.fullName || user.username}</span>!
            </h1>
            <p className="text-sm text-[#94A3B8] max-w-xl font-mono">
              "Consistency beats talent when talent stops coding." Ready to crack your next Java interview problem?
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenProblem('two-sum')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-xs font-mono uppercase tracking-wider shadow-glow-orange hover:opacity-95 transition flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Solve Daily Challenge</span>
            </button>
            <button
              onClick={() => onNavigate('library')}
              className="px-4 py-2.5 rounded-xl bg-[#151F32] hover:bg-[#1B263B] text-white border border-white/10 text-xs font-mono transition"
            >
              Browse 500+ Problems
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW: Solved breakdown, streaks, acceptance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Solved */}
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>SOLVED PROBLEMS</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalSolved}</span>
            <span className="text-xs text-[#94A3B8] font-mono">/ 520 Total</span>
          </div>
          {/* Difficulty progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-[#0B1120] rounded-full h-2 flex overflow-hidden">
              <div
                className="bg-[#22C55E]"
                style={{ width: `${(stats.easySolved / Math.max(1, stats.totalSolved)) * 100}%` }}
                title="Easy"
              />
              <div
                className="bg-[#F89820]"
                style={{ width: `${(stats.mediumSolved / Math.max(1, stats.totalSolved)) * 100}%` }}
                title="Medium"
              />
              <div
                className="bg-red-400"
                style={{ width: `${(stats.hardSolved / Math.max(1, stats.totalSolved)) * 100}%` }}
                title="Hard"
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono pt-1">
              <span className="text-[#22C55E]">Easy: {stats.easySolved}</span>
              <span className="text-[#F89820]">Med: {stats.mediumSolved}</span>
              <span className="text-red-400">Hard: {stats.hardSolved}</span>
            </div>
          </div>
        </div>

        {/* Current Coding Streak */}
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>CURRENT STREAK</span>
            <Flame className="w-4 h-4 text-[#F89820] fill-[#F89820]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#F89820]">{user.currentStreak}</span>
            <span className="text-xs text-[#94A3B8] font-mono">Consecutive Days</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            Personal Best: <strong className="text-white">{user.longestStreak || 28} days</strong>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>ACCEPTANCE RATE</span>
            <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{stats.acceptanceRate}%</span>
            <span className="text-xs text-[#94A3B8] font-mono">Accuracy</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            Total Submissions: <strong className="text-white">{stats.totalSubmissions}</strong>
          </div>
        </div>

        {/* Java Courses Progress */}
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>ACTIVE COURSES</span>
            <BookOpen className="w-4 h-4 text-[#F89820]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">1</span>
            <span className="text-xs text-[#94A3B8] font-mono">/ 20 Courses</span>
          </div>
          <div className="text-[11px] font-mono text-[#F89820]">
            Unlocked for ₹5 INR • Continue
          </div>
        </div>
      </div>

      {/* 3. HEATMAP: Full 365 Days Coding Activity */}
      <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#F89820]" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Annual Coding Activity Heatmap
            </h3>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-400">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#151F32]" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#F89820]/30" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#F89820]/60" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#F89820]" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[700px]">
            {renderHeatmapGrid()}
          </div>
        </div>
      </div>

      {/* 4. SPLIT SECTION: Upcoming Contests & Recently Solved */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT (7 cols): Upcoming Contests */}
        <div className="lg:col-span-7 glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-[#F89820]" />
              <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                Contest Schedule & Championships
              </h3>
            </div>
            <button
              onClick={() => onNavigate('contests')}
              className="text-xs font-mono text-[#F89820] hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {contests.slice(0, 3).map((contest) => (
              <div
                key={contest.id}
                onClick={() => onOpenContest(contest.slug)}
                className="p-4 rounded-xl bg-[#0B1120] border border-white/5 hover:border-[#F89820]/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F89820]/20 text-[#F89820]">
                      {contest.type}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {contest.durationMinutes} mins • {contest.totalPoints} pts
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#F89820] transition">
                    {contest.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {contest.description}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right font-mono text-xs text-emerald-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{contest.status === 'ACTIVE' ? 'LIVE NOW' : 'Starts Soon'}</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[#1B263B] group-hover:bg-[#F89820] group-hover:text-black text-white text-xs font-mono font-semibold transition">
                    Enter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT (5 cols): Recently Solved Submissions */}
        <div className="lg:col-span-5 glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-[#3B82F6]" />
              <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                Recently Solved
              </h3>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-mono text-[#3B82F6] hover:underline"
            >
              Solve More
            </button>
          </div>

          <div className="space-y-2.5">
            {recentSubmissions.slice(0, 4).map((sub: any) => {
              const diffColor =
                sub.problemDifficulty === 'Easy'
                  ? 'text-[#22C55E]'
                  : sub.problemDifficulty === 'Medium'
                  ? 'text-[#F89820]'
                  : 'text-red-400';

              return (
                <div
                  key={sub.id}
                  onClick={() => onOpenProblem('two-sum')}
                  className="p-3 rounded-lg bg-[#0B1120] border border-white/5 hover:border-white/20 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-white truncate max-w-[180px]">
                      {sub.problemTitle}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">
                      Runtime: {sub.runtime}ms • Memory: {sub.memory}MB
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[11px] font-mono font-bold ${diffColor}`}>
                      {sub.problemDifficulty}
                    </span>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. CONTINUE LEARNING: Featured Java Courses */}
      <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Java Engineering Curriculum (@ ₹5 INR)
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Targeted conceptual mastery for technical interviews and production design patterns.
            </p>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs font-mono text-[#F89820] hover:underline flex items-center space-x-1"
          >
            <span>All 20 Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {courses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              onClick={() => onOpenCourse(course.slug)}
              className="p-4 rounded-xl bg-[#0B1120] border border-white/5 hover:border-[#F89820]/40 transition cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#3B82F6]/15 text-[#3B82F6]">
                    {course.difficulty}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F89820]">
                    ₹5 INR
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#F89820] transition">
                  {course.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
                <span>{course.totalLessons} Lessons</span>
                <span className="text-[#F89820] group-hover:translate-x-1 transition flex items-center">
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
