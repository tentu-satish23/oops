import React, { useState, useEffect } from 'react';
import { User as UserIcon, Flame, CheckCircle, TrendingUp, Calendar, Trophy, BookOpen, Settings, Edit3, Film, CreditCard, Shield, LogOut, Award, Lock } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';
import { CertificateModal } from '../certificate/CertificateModal';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onReplayIntro: () => void;
  onOpenProblem: (slug: string) => void;
  onOpenCourse: (slug: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onReplayIntro,
  onOpenProblem,
  onOpenCourse
}) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'submissions' | 'contests' | 'courses' | 'certificates' | 'settings'>('submissions');
  const [loading, setLoading] = useState(true);

  // Certificate Modal State
  const [certCourse, setCertCourse] = useState<{ id: number; title: string } | null>(null);

  // Edit Profile modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.fullName);
  const [editBio, setEditBio] = useState(user.bio || '');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.getProfile(user.id);
        setProfileData(res);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile(user.id, {
        fullName: editName,
        bio: editBio
      });
      if (res.user) {
        onUpdateUser(res.user);
        setIsEditing(false);
      }
    } catch (err) {
      alert('Failed to update profile: ' + (err as Error).message);
    }
  };

  const stats = profileData?.stats || {
    totalSolved: 4,
    easySolved: 2,
    mediumSolved: 1,
    hardSolved: 1,
    totalSubmissions: 5,
    acceptanceRate: 80.0
  };

  const heatmap = profileData?.heatmap || {};
  const submissions = profileData?.submissionHistory || [];
  const contestHistory = profileData?.contestHistory || [];
  const enrolledCourses = profileData?.enrolledCourses || [];

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

      {/* 1. USER PROFILE HEADER CARD */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="flex items-center space-x-5">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.username}
              className="w-20 h-20 rounded-2xl border-2 border-[#F89820] shadow-glow-orange object-cover"
            />

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl font-bold text-white font-sans">
                  {user.fullName || user.username}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F89820]/15 text-[#F89820] border border-[#F89820]/30">
                  Java Master
                </span>
              </div>

              <div className="text-xs font-mono text-gray-400">
                @{user.username} • {user.email}
              </div>

              <p className="text-xs text-gray-300 font-mono pt-1 max-w-xl">
                {user.bio || 'Java Developer preparing for software interviews on OOP\'S ORACLE.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-[#151F32] hover:bg-[#1B263B] text-white border border-white/10 text-xs font-mono transition flex items-center space-x-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onReplayIntro}
              className="px-4 py-2 rounded-xl bg-[#F89820]/10 hover:bg-[#F89820]/20 text-[#F89820] border border-[#F89820]/30 text-xs font-mono transition flex items-center space-x-1.5"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Replay Intro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-1">
          <div className="text-xs font-mono text-[#94A3B8]">TOTAL SOLVED</div>
          <div className="text-2xl font-extrabold text-white">{stats.totalSolved}</div>
          <div className="flex space-x-2 text-[10px] font-mono pt-1">
            <span className="text-[#22C55E]">E: {stats.easySolved}</span>
            <span className="text-[#F89820]">M: {stats.mediumSolved}</span>
            <span className="text-red-400">H: {stats.hardSolved}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-1">
          <div className="text-xs font-mono text-[#94A3B8]">ACTIVE STREAK</div>
          <div className="text-2xl font-extrabold text-[#F89820] flex items-center space-x-1">
            <Flame className="w-5 h-5 fill-[#F89820]" />
            <span>{user.currentStreak} Days</span>
          </div>
          <div className="text-[10px] font-mono text-gray-500">
            Best: {user.longestStreak || 28} Days
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-1">
          <div className="text-xs font-mono text-[#94A3B8]">ACCEPTANCE</div>
          <div className="text-2xl font-extrabold text-white">{stats.acceptanceRate}%</div>
          <div className="text-[10px] font-mono text-gray-500">
            {stats.totalSubmissions} Total Submissions
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-1">
          <div className="text-xs font-mono text-[#94A3B8]">RANKING TIER</div>
          <div className="text-2xl font-extrabold text-[#3B82F6]">Top 5%</div>
          <div className="text-[10px] font-mono text-gray-500">
            Global Oracle Arena
          </div>
        </div>
      </div>

      {/* 3. HEATMAP */}
      <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-white uppercase">
            <Calendar className="w-4 h-4 text-[#F89820]" />
            <span>Submission History Heatmap (Past 365 Days)</span>
          </div>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[700px]">
            {renderHeatmapGrid()}
          </div>
        </div>
      </div>

      {/* 4. TABS: Submissions, Contests, Courses, Settings */}
      <div className="space-y-4">
        <div className="flex rounded-xl bg-[#151F32] p-1 border border-white/5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              activeTab === 'submissions' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            SUBMISSION HISTORY
          </button>
          <button
            onClick={() => setActiveTab('contests')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              activeTab === 'contests' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            CONTEST HISTORY
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              activeTab === 'courses' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            ENROLLED COURSES
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center space-x-1 ${
              activeTab === 'certificates' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>CERTIFICATES</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              activeTab === 'settings' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            ACCOUNT SETTINGS
          </button>
        </div>

        {/* Tab 1: Submissions */}
        {activeTab === 'submissions' && (
          <div className="rounded-xl overflow-hidden border border-white/5 bg-[#151F32]/80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0B1120] text-gray-400">
                <tr>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Runtime</th>
                  <th className="py-3 px-4">Memory</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-white/5">
                    <td className="py-2.5 px-4 font-medium text-white">{sub.problemTitle}</td>
                    <td className="py-2.5 px-4 text-[#F89820]">{sub.language || 'Java'}</td>
                    <td className="py-2.5 px-4 font-bold text-[#22C55E]">{sub.status}</td>
                    <td className="py-2.5 px-4 text-gray-400">{sub.runtime} ms</td>
                    <td className="py-2.5 px-4 text-gray-400">{sub.memory} MB</td>
                    <td className="py-2.5 px-4 text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Contests */}
        {activeTab === 'contests' && (
          <div className="space-y-3">
            {contestHistory.map((c: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-[#151F32] border border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-bold text-white text-sm">{c.contestName}</div>
                  <div className="text-gray-400">{c.contestType} Arena • {c.participationDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#F89820]">Rank #{c.rank}</div>
                  <div className="text-gray-400">{c.score} Points</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Enrolled Courses (My Courses) */}
        {activeTab === 'courses' && (
          <div>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-gray-400 font-mono text-sm">No purchased courses yet.</p>
                <p className="text-gray-600 font-mono text-xs">Purchase any Java course for ₹5 to unlock lifetime access.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledCourses.map((crs: any) => (
                  <div key={crs.id} className="p-5 rounded-xl bg-[#151F32] border border-white/5 space-y-4 hover:border-[#22C55E]/30 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#22C55E] flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Lifetime Access · ₹5</span>
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        {crs.purchasedAt ? new Date(crs.purchasedAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{crs.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{crs.description}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-gray-400">{crs.completedLessons || 0} / {crs.totalLessons} lessons</span>
                        <span className={crs.progressPercent === 100 ? 'text-[#22C55E] font-bold' : 'text-[#F89820]'}>
                          {crs.progressPercent || 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            crs.progressPercent === 100
                              ? 'bg-gradient-to-r from-[#22C55E] to-emerald-400'
                              : 'bg-gradient-to-r from-[#F89820] to-orange-400'
                          }`}
                          style={{ width: `${crs.progressPercent || 0}%` }}
                        />
                      </div>
                    </div>

                    {crs.razorpayPaymentId && (
                      <div className="text-[10px] font-mono text-gray-600 truncate">
                        Pay ID: {crs.razorpayPaymentId}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOpenCourse(crs.slug)}
                        className="flex-1 py-2 rounded-lg bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-mono text-xs font-semibold hover:bg-[#22C55E] hover:text-black transition"
                      >
                        {crs.progressPercent === 0 ? 'Start Learning' : 'Continue Course'}
                      </button>

                      {crs.isCompleted ? (
                        <button
                          onClick={() => setCertCourse({ id: crs.id, title: crs.title, isCompleted: true })}
                          className="p-2 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black hover:opacity-90 transition shadow-glow-orange"
                          title="Download Certificate"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      ) : (
                        <div
                          className="p-2 rounded-lg bg-white/5 text-gray-600 cursor-not-allowed"
                          title={`Finish all lessons to earn certificate (${crs.progressPercent || 0}%)`}
                        >
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Certificates — only earned ones (100% complete courses) */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#F89820]/15 via-black/40 to-black/20 border border-[#F89820]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F89820] to-[#E65100] flex items-center justify-center shadow-glow-orange">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Official OOP'S ORACLE Certificates</h3>
                  <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                    Certificates are issued only after completing <span className="text-[#F89820] font-bold">100%</span> of all lessons in a course.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-xs font-mono font-bold border border-[#22C55E]/30">
                {enrolledCourses.filter((c: any) => c.isCompleted).length} Earned
              </span>
            </div>

            {/* No completed courses yet */}
            {enrolledCourses.filter((c: any) => c.isCompleted).length === 0 && (
              <div className="text-center py-16 space-y-4">
                <Lock className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-gray-400 font-mono text-sm">No certificates earned yet.</p>
                <p className="text-gray-600 font-mono text-xs max-w-sm mx-auto">
                  Purchase a course (₹5) and complete all its lessons to earn your official certificate.
                </p>
              </div>
            )}

            {/* In-progress (purchased but not completed) */}
            {enrolledCourses.filter((c: any) => !c.isCompleted).length > 0 && (
              <div>
                <h4 className="text-xs font-mono text-gray-500 uppercase mb-3">In Progress — Complete to Unlock Certificate</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enrolledCourses.filter((c: any) => !c.isCompleted).map((crs: any) => (
                    <div key={crs.id} className="p-4 rounded-xl bg-[#151F32]/60 border border-white/5 flex items-center justify-between space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-bold text-white truncate">{crs.title}</p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#F89820] to-orange-400 rounded-full"
                              style={{ width: `${crs.progressPercent || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">{crs.progressPercent || 0}%</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 text-gray-600 flex-shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Earned certificates */}
            {enrolledCourses.filter((c: any) => c.isCompleted).length > 0 && (
              <div>
                <h4 className="text-xs font-mono text-gray-500 uppercase mb-3">Earned Certificates — Ready to Download</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.filter((c: any) => c.isCompleted).map((crs: any) => (
                    <div key={crs.id} className="p-5 rounded-xl bg-gradient-to-br from-[#151F32] to-[#0F1A2E] border border-[#F89820]/30 hover:border-[#F89820]/60 transition space-y-3 flex flex-col justify-between shadow-[0_0_30px_rgba(248,152,32,0.1)]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F89820]/15 text-[#F89820] font-bold">CERTIFIED</span>
                          <span className="text-[10px] font-mono text-[#22C55E] flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>100% Complete</span>
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white font-mono">{crs.title}</h4>
                        <p className="text-[11px] text-gray-400 font-mono">
                          Issued: {crs.purchasedAt ? new Date(crs.purchasedAt).toLocaleDateString('en-IN') : 'Today'}
                        </p>
                      </div>
                      <button
                        onClick={() => setCertCourse({ id: crs.id, title: crs.title, isCompleted: true })}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fba93e] hover:to-[#f56a00] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-glow-orange transition flex items-center justify-center space-x-2"
                      >
                        <Award className="w-4 h-4" />
                        <span>Download Certificate (PNG)</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-5 max-w-xl text-xs font-mono">
            <h3 className="text-sm font-bold text-white uppercase">User Configuration</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B1120]">
                <div>
                  <div className="font-semibold text-white">Replay Opening Animation</div>
                  <div className="text-gray-500 text-[11px]">Experience the 3D coffee kettle intro anytime</div>
                </div>
                <button
                  onClick={onReplayIntro}
                  className="px-3 py-1.5 rounded-lg bg-[#F89820] text-black font-semibold"
                >
                  Replay
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B1120]">
                <div>
                  <div className="font-semibold text-white">Account Security</div>
                  <div className="text-gray-500 text-[11px]">Password and 2FA authentication</div>
                </div>
                <button
                  onClick={() => alert("Password reset token generated.")}
                  className="px-3 py-1.5 rounded-lg bg-[#151F32] text-white hover:bg-[#1B263B]"
                >
                  Change Password
                </button>
              </div>

              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of OOP'S ORACLE</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveProfile} className="w-full max-w-md bg-[#151F32] rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl text-xs font-mono">
            <h3 className="text-sm font-bold text-white uppercase">Edit Developer Profile</h3>

            <div className="space-y-1">
              <label className="text-gray-400">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0B1120] border border-white/10 text-white focus:outline-none focus:border-[#F89820]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Bio</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0B1120] border border-white/10 text-white focus:outline-none focus:border-[#F89820]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-[#0B1120] text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#F89820] text-black font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
      {/* CERTIFICATE MODAL — only shown when isEarned is true */}
      {certCourse && (
        <CertificateModal
          isOpen={!!certCourse}
          onClose={() => setCertCourse(null)}
          courseTitle={certCourse.title}
          courseId={certCourse.id}
          userName={user.fullName || user.username || 'Developer'}
          isEarned={(certCourse as any).isCompleted === true}
        />
      )}
    </div>
  );
};
