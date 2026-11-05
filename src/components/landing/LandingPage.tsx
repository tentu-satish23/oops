import React, { useRef, useState } from 'react';
import {
  Coffee,
  Code2,
  Terminal,
  Trophy,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Cpu,
  Layers,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Check,
  Flame,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface LandingPageProps {
  onEnterAuth: (mode?: 'login' | 'signup') => void;
  onExploreProblems: () => void;
  isLoggedIn?: boolean;
  onGoToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterAuth,
  onExploreProblems,
  isLoggedIn,
  onGoToDashboard
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleToggleSound = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const curatedTopics = [
    { name: 'Arrays & Two Pointers', count: '48 problems', diff: 'Fundamental' },
    { name: 'Sliding Window & Hashing', count: '42 problems', diff: 'Intermediate' },
    { name: 'Linked Lists & Stacks', count: '38 problems', diff: 'Core' },
    { name: 'Trees & Binary Search Trees', count: '56 problems', diff: 'Frequent' },
    { name: 'Graphs & BFS/DFS', count: '44 problems', diff: 'Advanced' },
    { name: 'Dynamic Programming', count: '62 problems', diff: 'Tier-1 Interview' }
  ];

  const featuredCourses = [
    {
      title: 'JVM Internals & HotSpot Execution Engine',
      duration: '3.5 Hours',
      lessons: '5 Lessons',
      price: '₹5',
      tag: 'Architecture'
    },
    {
      title: 'Java Concurrency & Virtual Threads (Project Loom)',
      duration: '3.5 Hours',
      lessons: '5 Lessons',
      price: '₹5',
      tag: 'Multi-threading'
    },
    {
      title: 'Java Collections Framework Deep Dive',
      duration: '3.5 Hours',
      lessons: '5 Lessons',
      price: '₹5',
      tag: 'Core Java'
    },
    {
      title: 'Low Latency Java & Garbage Collection Tuning',
      duration: '3.5 Hours',
      lessons: '5 Lessons',
      price: '₹5',
      tag: 'Performance'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-[#F8FAFC] selection:bg-[#F89820]/30 selection:text-white flex flex-col font-sans">

      {/* =========================================================================
          1. STICKY TOP NAVIGATION BAR
         ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050811]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo with Official Photo */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="OOP'S ORACLE"
              className="w-10 h-10 rounded-xl object-cover shadow-glow-orange border border-[#F89820]/40"
            />
            <div>
              <span className="text-base font-extrabold tracking-wider font-['Cinzel',serif] text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#F89820]">
                OOP'S ORACLE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono text-[#94A3B8]">
            <a href="#problems" className="hover:text-white transition">Problems</a>
            <a href="#workspace" className="hover:text-white transition">Java Workspace</a>
            <a href="#courses" className="hover:text-white transition">₹5 Courses</a>
            <a href="#contests" className="hover:text-white transition">Contests</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <button
                onClick={onGoToDashboard}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#F89820] hover:bg-[#fca83a] text-black font-mono font-bold text-xs uppercase tracking-wider transition shadow-glow-orange"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onEnterAuth('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onEnterAuth('signup')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fba93e] hover:to-[#f56a00] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-glow-orange transition"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION WITH SEAMLESS CINEMATIC VIDEO SHOWCASE
         ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Atmospheric Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#F89820]/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#3B82F6]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* LEFT: Hero Copy & Value Proposition */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#151F32] border border-[#F89820]/30 text-[#F89820] text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#F89820]" />
                <span>Next-Gen Java Technical Interview Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Master Java. <br />
                Master Logic. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F89820] via-amber-200 to-[#F89820]">
                  Build Your Future.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-xl mx-auto lg:mx-0">
                The premier coding arena built specifically for Java engineers. Prepare for technical interviews at Google, Amazon, Microsoft, TCS, and Infosys with 520+ curated problems, Java 17 isolated execution, and ₹5 structured courses.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onEnterAuth('signup')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fba93e] hover:to-[#f56a00] text-black font-mono font-bold text-sm uppercase tracking-wider shadow-glow-orange transition flex items-center justify-center space-x-2 group"
                >
                  <span>Start Practicing Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={onExploreProblems}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#151F32] hover:bg-[#1B263B] text-white font-mono text-sm font-semibold border border-white/10 transition flex items-center justify-center space-x-2"
                >
                  <Code2 className="w-4 h-4 text-[#F89820]" />
                  <span>Browse 520+ Problems</span>
                </button>
              </div>

              {/* Trust Micro-Metrics */}
              <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6 text-xs font-mono text-[#94A3B8]">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span>Java 17 LTS Sandbox</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Seamless Product Video Motion Showcase (No video player clutter) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_50px_rgba(248,152,32,0.18)] group">

                {/* THE VIDEO (Loops naturally as an ambient living showcase) */}
                <div className="aspect-video relative overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src="/intro-video.mp4"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Top Floating Glass Badge */}
                  <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="text-gray-300">OOP'S ORACLE AESTHETIC</span>
                  </div>

                  {/* Discreet Audio Control Toggle */}
                  <button
                    onClick={handleToggleSound}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white transition"
                    title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-gray-400 hover:text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#F89820] animate-pulse" />
                    )}
                  </button>

                  {/* Bottom Video Caption Pill */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 px-4 py-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#F89820]" />
                      <span className="text-gray-200 font-semibold">The Java Coffee Tradition</span>
                    </div>
                    <span className="text-[#94A3B8] text-[11px]">Engineered for Focus</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. STATS & KEY METRICS RIBBON
         ========================================================================= */}
      <section className="border-y border-white/5 bg-[#0B1120]/80 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-extrabold font-mono text-white">520+</div>
              <div className="text-xs font-mono text-[#94A3B8]">Curated Java Problems</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold font-mono text-[#F89820]">17</div>
              <div className="text-xs font-mono text-[#94A3B8]">DSA Topic Categories</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold font-mono text-[#22C55E]">₹5</div>
              <div className="text-xs font-mono text-[#94A3B8]">Flat Course Pricing</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold font-mono text-blue-400">Java 17</div>
              <div className="text-xs font-mono text-[#94A3B8]">Isolated Compiler Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURE SECTION: MONACO WORKSPACE PREVIEW
         ========================================================================= */}
      <section id="workspace" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#151F32] border border-white/10 text-xs font-mono text-[#F89820]">
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer-Grade Execution</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            A Serious Coding Workspace for Serious Java Developers.
          </h2>
          <p className="text-sm text-[#94A3B8]">
            Split-screen layout with Monaco Editor, custom test cases, real execution benchmarks, and Big-O complexity analysis.
          </p>
        </div>

        {/* Workspace Mockup Card */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0E1726] shadow-2xl">
          {/* Mock Header */}
          <div className="h-10 bg-[#0A0F1D] px-4 flex items-center justify-between border-b border-white/5 font-mono text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-white font-semibold">TwoSum.java</span>
            </div>
            <div className="flex items-center space-x-2 text-[#22C55E]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>OpenJDK 17.0.2 Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
            {/* Left Problem Spec */}
            <div className="lg:col-span-5 p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[#22C55E] font-bold">#1 EASY</span>
                <span className="text-white font-bold text-sm">Two Sum</span>
              </div>
              <p className="text-gray-300 leading-relaxed font-sans text-xs">
                Given an array of integers <code className="text-[#F89820] bg-white/5 px-1 rounded">nums</code> and an integer <code className="text-[#F89820] bg-white/5 px-1 rounded">target</code>, return indices of the two numbers such that they add up to target.
              </p>
              <div className="p-3 rounded-lg bg-[#050811] border border-white/5 space-y-1">
                <div className="text-gray-400">Example 1:</div>
                <div><span className="text-blue-400">Input:</span> nums = [2,7,11,15], target = 9</div>
                <div><span className="text-[#22C55E]">Output:</span> [0,1]</div>
              </div>
            </div>

            {/* Right Editor Preview */}
            <div className="lg:col-span-7 p-6 font-mono text-xs text-gray-300 space-y-1.5 overflow-x-auto bg-[#070C18]">
              <div><span className="text-blue-400">class</span> <span className="text-[#F89820]">Solution</span> &#123;</div>
              <div className="pl-4 text-gray-500">// One-Pass HashMap: O(n) Time, O(n) Space</div>
              <div className="pl-4">
                <span className="text-blue-400">public int</span>[] <span className="text-emerald-400">twoSum</span>(<span className="text-blue-400">int</span>[] nums, <span className="text-blue-400">int</span> target) &#123;
              </div>
              <div className="pl-8">
                Map&lt;Integer, Integer&gt; map = <span className="text-blue-400">new</span> HashMap&lt;&gt;();
              </div>
              <div className="pl-8">
                <span className="text-blue-400">for</span> (<span className="text-blue-400">int</span> i = 0; i &lt; nums.length; i++) &#123;
              </div>
              <div className="pl-12">
                <span className="text-blue-400">int</span> complement = target - nums[i];
              </div>
              <div className="pl-12">
                <span className="text-blue-400">if</span> (map.containsKey(complement)) &#123;
              </div>
              <div className="pl-16">
                <span className="text-blue-400">return new int</span>[]&#123; map.get(complement), i &#125;;
              </div>
              <div className="pl-12">&#125;</div>
              <div className="pl-12">map.put(nums[i], i);</div>
              <div className="pl-8">&#125;</div>
              <div className="pl-8"><span className="text-blue-400">return new int</span>[]&#123;&#125;;</div>
              <div className="pl-4">&#125;</div>
              <div>&#125;</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. PROBLEM LIBRARY CATEGORIES
         ========================================================================= */}
      <section id="problems" className="py-20 border-t border-white/5 bg-[#080D1A]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-xs font-mono font-bold text-[#F89820] uppercase tracking-wider mb-2">
                520+ Interview-Tested Problems
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Master Essential Algorithms & Data Structures.
              </h2>
            </div>
            <button
              onClick={onExploreProblems}
              className="self-start md:self-auto flex items-center space-x-1.5 text-xs font-mono text-[#F89820] hover:underline"
            >
              <span>Explore all categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {curatedTopics.map((item, idx) => (
              <div
                key={idx}
                onClick={onExploreProblems}
                className="p-5 rounded-xl bg-[#0F172A]/70 hover:bg-[#1E293B] border border-white/5 hover:border-[#F89820]/40 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#94A3B8] border border-white/10">
                    {item.diff}
                  </span>
                  <span className="text-xs font-mono text-[#F89820]">{item.count}</span>
                </div>
                <div className="text-sm font-bold text-white group-hover:text-[#F89820] transition">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. ₹5 STRUCTURED JAVA COURSES SHOWCASE
         ========================================================================= */}
      <section id="courses" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#151F32] border border-white/10 text-xs font-mono text-[#22C55E]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>₹5 INR Per Course • 101+ Deep-Dive Topics</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Architecture & Engineering Courses at Accessible Pricing.
          </h2>
          <p className="text-sm text-[#94A3B8]">
            Every concept contains at least 3 hours of rigorous technical material, JVM memory diagrams, and interactive quizzes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCourses.map((c, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0E1726] border border-white/5 hover:border-[#22C55E]/40 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] font-bold">
                    {c.price} INR
                  </span>
                  <span className="text-gray-400">{c.duration}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {c.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
                <span>{c.lessons}</span>
                <span className="text-[#F89820] font-semibold">{c.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. BOTTOM CALL TO ACTION
         ========================================================================= */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-[#0B1120] to-[#050811] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <img
            src="/logo.png"
            alt="OOP'S ORACLE"
            className="w-16 h-16 rounded-2xl object-cover shadow-glow-orange mx-auto border border-[#F89820]/40"
          />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Master Java Technical Interviews?
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            Join developers building solid algorithmic foundations, solving interview problems, and cracking software engineering roles.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onEnterAuth('signup')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fba93e] hover:to-[#f56a00] text-black font-mono font-bold text-sm uppercase tracking-wider shadow-glow-orange transition"
            >
              Get Started with OOP'S ORACLE Now
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
         ========================================================================= */}
      <footer className="border-t border-white/5 bg-[#03060D] py-10 text-xs font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="OOP'S ORACLE"
              className="w-6 h-6 rounded-md object-cover border border-[#F89820]/30"
            />
            <span className="text-white font-semibold">OOP'S ORACLE</span>
            <span>—</span>
            <span>Master Java. Master Logic. Build Your Future.</span>
          </div>

          <div>
            <span>© {new Date().getFullYear()} OOP'S ORACLE. Production Ready.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
