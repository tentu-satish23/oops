import React, { useState } from 'react';
import { Coffee, Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Sparkles, Terminal, Code2 } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onReplayIntro?: () => void;
  onBackToLanding?: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onReplayIntro, onBackToLanding, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: 'None', color: 'bg-gray-700' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, text: 'Good', color: 'bg-blue-500' };
    return { score: 4, text: 'Strong', color: 'bg-[#22C55E]' };
  };

  const pwdStrength = getPasswordStrength(signupPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail || !loginPassword) {
      setError('Please provide your email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(loginEmail, loginPassword);
      localStorage.setItem('oracle_user', JSON.stringify(res.user));
      localStorage.setItem('oracle_token', res.token);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !username || !signupEmail || !signupPassword) {
      setError('All fields are required');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedTerms) {
      setError('Please accept the Terms & Conditions to proceed');
      return;
    }

    try {
      setLoading(true);
      const res = await api.signup({
        fullName,
        username,
        email: signupEmail,
        password: signupPassword
      });
      localStorage.setItem('oracle_user', JSON.stringify(res.user));
      localStorage.setItem('oracle_token', res.token);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.demoLogin();
      localStorage.setItem('oracle_user', JSON.stringify(res.user));
      localStorage.setItem('oracle_token', res.token);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] flex flex-col justify-center relative overflow-hidden py-8">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F89820]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Landing Page Header */}
      {onBackToLanding && (
        <div className="max-w-6xl w-full mx-auto px-4 md:px-8 mb-4 z-20">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center space-x-2 text-xs font-mono text-[#94A3B8] hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Landing Page</span>
          </button>
        </div>
      )}

      {/* Main Split Screen Container */}
      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">

        {/* LEFT PANEL: Brand Narrative & Live Java Terminal Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center space-x-3.5">
            <img
              src="/logo.png"
              alt="OOP'S ORACLE"
              className="w-14 h-14 rounded-2xl object-cover shadow-glow-orange border border-[#F89820]/40"
            />
            <div>
              <h2 className="text-2xl font-bold tracking-wider font-['Cinzel',serif] text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#F89820]">
                OOP'S ORACLE
              </h2>
              <p className="text-xs font-mono text-[#94A3B8]">
                Master Java. Master Logic. Build Your Future.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              The Premier Java Technical Interview & Coding Platform.
            </h1>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Crack top-tier software engineering interviews at Google, Amazon, Microsoft, TCS, and Infosys with over 500+ curated Java problems, live isolated code execution, and ₹5 structured courses.
            </p>
          </div>

          {/* Interactive Java Terminal Mockup */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#151F32]/90 shadow-2xl">
            <div className="bg-[#0B1120] px-4 py-2.5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="text-xs font-mono text-gray-400 ml-2">Solution.java — Java 17 LTS</span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-mono text-[#F89820]">
                <Sparkles className="w-3 h-3" />
                <span>Compiler Active</span>
              </div>
            </div>

            <div className="p-4 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto space-y-1">
              <div><span className="text-[#3B82F6]">public class</span> <span className="text-[#F89820]">Solution</span> &#123;</div>
              <div className="pl-4 text-gray-400">// Time: O(n) | Space: O(1) optimal Kadane</div>
              <div className="pl-4">
                <span className="text-[#3B82F6]">public int</span> <span className="text-emerald-400">maxSubArray</span>(<span className="text-[#3B82F6]">int</span>[] nums) &#123;
              </div>
              <div className="pl-8">
                <span className="text-[#3B82F6]">int</span> maxSoFar = nums[0], currMax = nums[0];
              </div>
              <div className="pl-8">
                <span className="text-[#3B82F6]">for</span> (<span className="text-[#3B82F6]">int</span> i = 1; i &lt; nums.length; i++) &#123;
              </div>
              <div className="pl-12">
                currMax = Math.max(nums[i], currMax + nums[i]);
              </div>
              <div className="pl-12">
                maxSoFar = Math.max(maxSoFar, currMax);
              </div>
              <div className="pl-8">&#125;</div>
              <div className="pl-8 text-emerald-400"><span className="text-[#3B82F6]">return</span> maxSoFar;</div>
              <div className="pl-4">&#125;</div>
              <div>&#125;</div>
            </div>

            <div className="bg-[#111A2C] px-4 py-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#22C55E] flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All 15 Test Cases Passed (Runtime: 1ms)</span>
              </span>
              <span className="text-gray-500">Judge0 Isolated Sandbox</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-[#1B263B]/50 border border-white/5">
              <div className="text-xl font-bold text-[#F89820]">500+</div>
              <div className="text-[11px] text-[#94A3B8]">Java Problems</div>
            </div>
            <div className="p-3 rounded-lg bg-[#1B263B]/50 border border-white/5">
              <div className="text-xl font-bold text-[#3B82F6]">20</div>
              <div className="text-[11px] text-[#94A3B8]">Courses (@ ₹5)</div>
            </div>
            <div className="p-3 rounded-lg bg-[#1B263B]/50 border border-white/5">
              <div className="text-xl font-bold text-[#22C55E]">100%</div>
              <div className="text-[11px] text-[#94A3B8]">Real JDK 17</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Auth Card (Login / Signup) */}
        <div className="lg:col-span-6">
          <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl relative border border-white/10">

            {/* Mode Switch Tabs */}
            <div className="flex rounded-lg bg-[#0B1120]/80 p-1 mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2 text-xs font-mono font-medium rounded-md transition ${
                  mode === 'login'
                    ? 'bg-[#F89820] text-black font-semibold shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-2 text-xs font-mono font-medium rounded-md transition ${
                  mode === 'signup'
                    ? 'bg-[#F89820] text-black font-semibold shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo 1-Click Login Banner */}
            <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-[#F89820]/15 to-[#3B82F6]/15 border border-[#F89820]/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F89820]" />
                  <span>Instant Recruiter / Demo Access</span>
                </div>
                <div className="text-[11px] text-[#94A3B8]">Explore full platform with 1 click</div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-[#F89820] hover:bg-[#F89820]/90 text-black font-mono font-semibold text-xs shadow-md transition"
              >
                Demo Login
              </button>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="developer@oopsoracle.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer text-[#94A3B8] hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#0B1120] border-gray-700 text-[#F89820] focus:ring-0"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Forgot password instructions have been sent to your email (Demo Mode).")}
                    className="text-[#F89820] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-sm hover:opacity-95 transition shadow-glow-orange flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to OOP'S ORACLE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ada Lovelace"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <Code2 className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="java_ninja"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="ada@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                      Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                      Confirm
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F89820]"
                    />
                  </div>
                </div>

                {/* Password strength indicator */}
                {signupPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-400">Strength:</span>
                      <span className="font-semibold text-white">{pwdStrength.text}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full ${pwdStrength.color} transition-all duration-300`}
                        style={{ width: `${(pwdStrength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs text-[#94A3B8]">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="rounded bg-[#0B1120] border-gray-700 text-[#F89820] focus:ring-0"
                    />
                    <span>I agree to the OOP'S ORACLE Terms & Honor Code</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-sm hover:opacity-95 transition shadow-glow-orange flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Replay Cinematic Intro button */}
            {onReplayIntro && (
              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={onReplayIntro}
                  className="text-xs font-mono text-[#94A3B8] hover:text-[#F89820] transition flex items-center justify-center space-x-1.5 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F89820]" />
                  <span>Watch Cinematic Landing Page Video</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
