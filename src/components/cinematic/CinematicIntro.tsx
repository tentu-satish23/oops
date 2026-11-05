import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward, Maximize2, Minimize2, Sparkles, Coffee, ArrowRight } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(7.6);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Attempt auto-play with audio on mount; fallback to muted if browser blocks
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Browser blocked unmuted autoplay: start muted and prompt user
      setIsMuted(true);
      video.muted = true;
      video.play().catch((err) => console.log('Autoplay deferred:', err));
    });
  }, []);

  // Sync time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
  };

  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHasInteracted(true);
    if (!videoRef.current) return;

    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play();
      setIsPlaying(true);
      setIsEnded(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHasInteracted(true);
    if (!videoRef.current) return;

    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHasInteracted(true);
    if (!videoRef.current) return;

    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    setIsEnded(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleToggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#050811] text-[#F8FAFC] flex flex-col justify-between overflow-hidden select-none"
      onClick={() => {
        if (isMuted && !hasInteracted) {
          handleToggleMute();
        }
      }}
    >
      {/* Background Ambient Glow derived from video */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#F89820]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-[160px]" />
      </div>

      {/* TOP HEADER: Brand Pill & Action Buttons */}
      <header className="relative z-30 flex items-center justify-between p-4 sm:p-6 md:p-8 backdrop-blur-sm bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Brand Logo & Tag */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F89820] to-[#E65100] flex items-center justify-center shadow-glow-orange">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base font-extrabold tracking-wider font-['Cinzel',serif] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#F89820]">
                OOP'S ORACLE
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F89820]/15 text-[#F89820] border border-[#F89820]/30">
                OFFICIAL EXPERIENCE
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#94A3B8] hidden md:block">
              Master Java. Master Logic. Build Your Future.
            </p>
          </div>
        </div>

        {/* Right Controls: Sound, Fullscreen, Enter/Skip */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border text-xs font-mono transition ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                : 'bg-[#F89820]/15 border-[#F89820]/40 text-[#F89820] hover:bg-[#F89820]/25 shadow-glow-orange'
            }`}
            title={isMuted ? 'Click to Unmute' : 'Mute Sound'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#F89820] animate-pulse" />
                <span className="hidden sm:inline font-bold">SOUND ON</span>
              </>
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Skip / Enter Platform Button */}
          <button
            onClick={onComplete}
            className="flex items-center space-x-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fba93e] hover:to-[#f56a00] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-glow-orange transition duration-200 group"
          >
            <span>Enter Platform</span>
            <FastForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </header>

      {/* CENTER: Widescreen Cinematic Video Player Container */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-6xl w-full mx-auto">
        <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_rgba(248,152,32,0.15)] group">
          {/* THE VIDEO (Served exactly as it is without alterations) */}
          <video
            ref={videoRef}
            src="/intro-video.mp4"
            playsInline
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onClick={handleTogglePlay}
            className="w-full h-full object-contain bg-black cursor-pointer"
          />

          {/* Unmute Prompt Banner if muted on autoplay */}
          {isMuted && (
            <div
              onClick={handleToggleMute}
              className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-30 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-[#F89820]/40 text-[#F89820] text-xs font-mono flex items-center space-x-2 shadow-lg cursor-pointer hover:bg-[#F89820]/20 transition animate-bounce"
            >
              <VolumeX className="w-4 h-4 text-[#F89820]" />
              <span>Click to enable sound</span>
            </div>
          )}

          {/* Play/Pause Overlay indicator on click */}
          {!isPlaying && !isEnded && (
            <div
              onClick={handleTogglePlay}
              className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center cursor-pointer transition backdrop-blur-[2px]"
            >
              <div className="w-16 h-16 rounded-full bg-[#F89820]/90 text-black flex items-center justify-center shadow-glow-orange hover:scale-110 transition">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Video End Overlay Card */}
          {isEnded && (
            <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F89820] to-[#E65100] flex items-center justify-center shadow-glow-orange mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold font-['Cinzel',serif] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#F89820]">
                OOP'S ORACLE
              </h3>
              <p className="text-xs sm:text-sm font-mono text-[#94A3B8] max-w-md mt-1 mb-5">
                Master Java. Master Logic. Build Your Future.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onComplete}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fba93e] hover:to-[#f56a00] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-glow-orange transition flex items-center space-x-2"
                >
                  <span>Enter Platform Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReplay}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-mono text-xs transition flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Video</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Floating Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-95 transition-opacity">
            {/* Scrubbable Progress Slider */}
            <div className="relative mb-2 flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 7.6}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F89820] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-gray-300">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleTogglePlay}
                  className="hover:text-[#F89820] transition"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={handleReplay}
                  className="hover:text-[#F89820] transition"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleToggleMute}
                  className="hover:text-[#F89820] transition"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#F89820]" />}
                </button>
                <span className="text-[11px] text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                <span className="inline-block w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="hidden sm:inline">1080p HD CINEMATIC</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER: Brand Tagline & Quick Stats Bar */}
      <footer className="relative z-30 p-4 sm:p-6 md:p-8 backdrop-blur-sm bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center space-x-2 text-center sm:text-left">
          <Sparkles className="w-4 h-4 text-[#F89820]" />
          <span className="text-gray-200 font-semibold">OOP'S ORACLE</span>
          <span>—</span>
          <span>Master Java. Master Logic. Build Your Future.</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <span>500+ Java Problems</span>
          <span>•</span>
          <span>Live Java 17 Sandbox</span>
          <span>•</span>
          <span>Contests & Courses</span>
        </div>
      </footer>
    </div>
  );
};
