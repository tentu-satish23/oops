import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen, CheckCircle, Lock, Play, ShieldCheck, ArrowRight, ArrowLeft,
  Check, Sparkles, HelpCircle, Code, Award, IndianRupee, XCircle, AlertCircle,
  RefreshCw, Clock, CreditCard, Wifi, Zap, TrendingUp, Trophy
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, Lesson } from '../../types';
import { CertificateModal } from '../certificate/CertificateModal';

interface CoursesPageProps {
  initialCourseSlug?: string | null;
  onBackToDashboard: () => void;
}

type PaymentStatus = 'idle' | 'creating' | 'checkout' | 'verifying' | 'success' | 'failed' | 'pending' | 'already_owned';

export const CoursesPage: React.FC<CoursesPageProps> = ({ initialCourseSlug, onBackToDashboard }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Certificate
  const [certCourse, setCertCourse] = useState<Course | null>(null);

  // Payment flow state
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentResult, setPaymentResult] = useState<{
    paymentId?: string;
    orderId?: string;
    errorMsg?: string;
  }>({});
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Quiz
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // My Courses tab
  const [viewTab, setViewTab] = useState<'catalog' | 'my-courses'>('catalog');

  const fetchCoursesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCourses();
      setCourses(res.courses || []);
      if (initialCourseSlug) {
        const found = (res.courses || []).find((c: Course) => c.slug === initialCourseSlug);
        if (found) handleOpenCourse(found.slug);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initialCourseSlug]);

  useEffect(() => { fetchCoursesList(); }, [fetchCoursesList]);

  const handleOpenCourse = async (slug: string) => {
    try {
      setLoading(true);
      const fullCourse = await api.getCourse(slug);
      setSelectedCourse(fullCourse);
      if (fullCourse.isPurchased) {
        setIsClassroomOpen(true);
        if (fullCourse.lessons?.length > 0) setActiveLesson(fullCourse.lessons[0]);
      } else {
        setCheckoutCourse(fullCourse);
        setPaymentStatus('idle');
        setPaymentResult({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Real Razorpay Payment Flow ──────────────────────────────────────────
  const handleInitiatePayment = async (course: Course) => {
    try {
      setPaymentStatus('creating');
      setPaymentResult({});

      // 1. Create order on backend (amount ALWAYS set server-side)
      const orderRes = await api.createPaymentOrder(course.id);

      // Handle "already purchased" response from server
      if (orderRes.alreadyPurchased) {
        setPaymentStatus('already_owned');
        return;
      }

      setLastOrderId(orderRes.orderId);

      // 2. Load Razorpay SDK if not already on page
      if (typeof (window as any).Razorpay === 'undefined') {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.head.appendChild(script);
        });
      }

      setPaymentStatus('checkout');

      const userStr = localStorage.getItem('oracle_user') || '{}';
      const user = JSON.parse(userStr);

      if (!orderRes.isSimulation) {
        // ── REAL Razorpay Checkout ──────────────────────────────────────
        const options = {
          key: orderRes.keyId,
          amount: orderRes.amount,       // 500 paise = ₹5
          currency: orderRes.currency,
          name: "OOP'S ORACLE",
          description: `${course.title} — Lifetime Access`,
          image: '/logo.png',
          order_id: orderRes.orderId,
          prefill: {
            name:  user.fullName  || user.username || '',
            email: user.email     || '',
          },
          theme: { color: '#F89820' },
          modal: {
            ondismiss: () => {
              setPaymentStatus('failed');
              setPaymentResult({ errorMsg: 'Payment was cancelled by user.', orderId: orderRes.orderId });
            }
          },
          handler: async (response: any) => {
            setPaymentStatus('verifying');
            try {
              const verifyRes = await api.verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                courseId: course.id,
                isSimulation: false
              });

              if (verifyRes.success) {
                setPaymentStatus('success');
                setPaymentResult({ paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id });
                confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors: ['#F89820', '#22C55E', '#3B82F6', '#fff'] });
                await fetchCoursesList();
              } else {
                setPaymentStatus('failed');
                setPaymentResult({ errorMsg: verifyRes.error || 'Signature verification failed.', orderId: response.razorpay_order_id });
              }
            } catch (err: any) {
              setPaymentStatus('failed');
              setPaymentResult({ errorMsg: err.message, orderId: response.razorpay_order_id });
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setPaymentStatus('failed');
          setPaymentResult({
            errorMsg: resp.error?.description || 'Payment failed.',
            orderId: resp.error?.metadata?.order_id
          });
        });
        rzp.open();

      } else {
        // ── SIMULATION Flow (no real Razorpay keys) ───────────────────
        setTimeout(async () => {
          setPaymentStatus('verifying');
          try {
            const verifyRes = await api.verifyPayment({
              razorpay_order_id:   orderRes.orderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              courseId: course.id,
              isSimulation: true
            });
            if (verifyRes.success) {
              setPaymentStatus('success');
              setPaymentResult({ paymentId: `pay_sim_${Date.now()}`, orderId: orderRes.orderId });
              confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors: ['#F89820', '#22C55E', '#3B82F6', '#fff'] });
              await fetchCoursesList();
            } else {
              setPaymentStatus('failed');
              setPaymentResult({ errorMsg: verifyRes.error || 'Verification failed.' });
            }
          } catch (err: any) {
            setPaymentStatus('failed');
            setPaymentResult({ errorMsg: err.message });
          }
        }, 1800);
      }

    } catch (err: any) {
      if (err.message?.includes('already_purchased') || err.message?.includes('already own')) {
        setPaymentStatus('already_owned');
      } else {
        setPaymentStatus('failed');
        setPaymentResult({ errorMsg: err.message || 'Payment initialization failed.' });
      }
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!lastOrderId) return;
    try {
      const res = await api.getPaymentStatus(lastOrderId);
      if (res.isPurchased || res.status === 'captured') {
        setPaymentStatus('success');
        setPaymentResult({ orderId: lastOrderId });
        await fetchCoursesList();
      } else {
        setPaymentResult({ ...paymentResult, errorMsg: `Status: ${res.status}` });
      }
    } catch (err: any) {
      setPaymentResult({ ...paymentResult, errorMsg: err.message });
    }
  };

  const handleCompleteLesson = async () => {
    if (!selectedCourse || !activeLesson) return;
    try {
      const res = await api.completeLesson(selectedCourse.id, activeLesson.id);
      setActiveLesson({ ...activeLesson, isCompleted: true });
      // Refresh full course so progressPercent updates
      const updated = await api.getCourse(selectedCourse.slug);
      setSelectedCourse(updated);
      await fetchCoursesList();
    } catch (err) {
      console.error(err);
    }
  };

  const purchasedCourses = courses.filter(c => c.isPurchased);

  // ─── CLASSROOM VIEW ───────────────────────────────────────────────────────
  if (isClassroomOpen && selectedCourse) {
    const prog = selectedCourse.progressPercent ?? 0;
    const canGetCert = prog === 100;

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#0B1120]">

        {/* Top Bar */}
        <div className="h-12 bg-[#151F32] border-b border-white/5 px-4 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsClassroomOpen(false)}
              className="flex items-center space-x-1 text-xs font-mono text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Courses</span>
            </button>
            <span className="text-gray-600">|</span>
            <span className="text-xs font-mono font-bold text-white truncate max-w-xs sm:max-w-md">
              {selectedCourse.title}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F89820] to-[#22C55E] rounded-full transition-all"
                  style={{ width: `${prog}%` }}
                />
              </div>
              <span className={prog === 100 ? 'text-[#22C55E] font-bold' : 'text-gray-400'}>
                {prog}%
              </span>
            </div>

            {/* Certificate button — locked until 100% */}
            {canGetCert ? (
              <button
                onClick={() => setCertCourse(selectedCourse)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fba93e] hover:to-[#f56a00] text-black font-mono font-bold text-xs shadow-glow-orange transition animate-pulse"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Get Certificate 🎉</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 font-mono text-xs cursor-not-allowed" title="Complete all lessons to earn your certificate">
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Complete all lessons to earn certificate ({prog}%)</span>
                <span className="sm:hidden">🔒 {prog}%</span>
              </div>
            )}

            <span className="text-xs font-mono text-[#22C55E] items-center space-x-1 hidden sm:flex">
              <ShieldCheck className="w-4 h-4" />
              <span>Unlocked (₹5 Paid)</span>
            </span>
          </div>
        </div>

        {/* Classroom Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

          {/* Sidebar */}
          <div className="lg:col-span-4 border-r border-white/5 bg-[#111A2C] overflow-y-auto p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-semibold text-gray-400 uppercase">Curriculum</h3>
              <p className="text-[11px] text-gray-500 font-mono">
                {selectedCourse.completedLessons || 0} / {selectedCourse.totalLessons} lessons completed
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                selectedCourse.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => { setActiveLesson(lesson); setSelectedQuizAnswer(null); setQuizSubmitted(false); }}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs font-mono ${
                      activeLesson?.id === lesson.id
                        ? 'bg-[#F89820] text-black font-semibold border-[#F89820]'
                        : 'bg-[#151F32] text-gray-300 hover:text-white border-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] flex-shrink-0">
                        {lesson.lessonNumber}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    {lesson.isCompleted && (
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${activeLesson?.id === lesson.id ? 'text-black' : 'text-[#22C55E]'}`} />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs font-mono text-gray-400 p-4 text-center">
                  Structured lessons are active for this track.
                </div>
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-8 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#0B1120]">
            {activeLesson ? (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <span className="text-xs font-mono text-[#F89820] font-semibold">Lesson {activeLesson.lessonNumber}</span>
                  <h1 className="text-2xl font-bold text-white mt-1">{activeLesson.title}</h1>
                </div>

                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed space-y-3 font-sans">
                  {activeLesson.content}
                </div>

                {activeLesson.codeExample && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Code className="w-4 h-4 text-[#F89820]" />
                      <span>Java 17 Code Demonstration</span>
                    </h3>
                    <div className="p-4 rounded-xl bg-[#151F32] border border-white/5 font-mono text-xs text-gray-200 overflow-x-auto">
                      <pre>{activeLesson.codeExample}</pre>
                    </div>
                    {activeLesson.expectedOutput && (
                      <div className="p-3 rounded-lg bg-[#0B1120] border border-white/5 font-mono text-xs">
                        <span className="text-gray-500">Console Output:</span>
                        <div className="text-[#22C55E] mt-1 whitespace-pre-line">{activeLesson.expectedOutput}</div>
                      </div>
                    )}
                  </div>
                )}

                {activeLesson.quizQuestion && (
                  <div className="p-5 rounded-2xl bg-[#151F32] border border-white/5 space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-[#F89820]">
                      <HelpCircle className="w-4 h-4" />
                      <span>Conceptual Checkpoint Quiz</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{activeLesson.quizQuestion}</p>
                    <div className="space-y-2">
                      {activeLesson.quizOptions?.map((opt, idx) => {
                        let btnStyle = 'bg-[#0B1120] border-white/10 text-gray-300 hover:border-white/30';
                        if (quizSubmitted) {
                          if (idx === activeLesson.quizCorrectIndex) btnStyle = 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E] font-bold';
                          else if (selectedQuizAnswer === idx) btnStyle = 'bg-red-500/20 border-red-500 text-red-400';
                        } else if (selectedQuizAnswer === idx) {
                          btnStyle = 'bg-[#F89820]/20 border-[#F89820] text-white font-medium';
                        }
                        return (
                          <div
                            key={idx}
                            onClick={() => !quizSubmitted && setSelectedQuizAnswer(idx)}
                            className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && idx === activeLesson.quizCorrectIndex && <Check className="w-4 h-4 text-[#22C55E]" />}
                          </div>
                        );
                      })}
                    </div>
                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={selectedQuizAnswer === null}
                        className="px-4 py-2 rounded-lg bg-[#F89820] text-black font-mono text-xs font-bold disabled:opacity-40 transition"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <div className="text-xs font-mono">
                        {selectedQuizAnswer === activeLesson.quizCorrectIndex
                          ? <span className="text-[#22C55E] font-bold">✓ Correct! Excellent mastery.</span>
                          : <span className="text-red-400 font-bold">✗ Incorrect. Review the lesson above!</span>
                        }
                      </div>
                    )}
                  </div>
                )}

                {/* Mark Complete */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={handleCompleteLesson}
                    disabled={activeLesson.isCompleted}
                    className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center space-x-2 transition ${
                      activeLesson.isCompleted
                        ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 cursor-default'
                        : 'bg-gradient-to-r from-[#22C55E] to-emerald-600 text-white shadow-glow-green hover:opacity-95'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{activeLesson.isCompleted ? 'Lesson Completed ✓' : 'Mark Lesson as Complete'}</span>
                  </button>

                  {/* Show certificate unlock progress */}
                  {!canGetCert && (
                    <span className="text-xs font-mono text-gray-500">
                      {selectedCourse.totalLessons - (selectedCourse.completedLessons || 0)} lesson(s) remaining to unlock certificate
                    </span>
                  )}
                  {canGetCert && (
                    <span className="text-xs font-mono text-[#F89820] font-bold animate-pulse">
                      🏆 All done! Click "Get Certificate" above.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-gray-400 py-12 text-center">
                Select a lesson from the left to begin.
              </div>
            )}
          </div>
        </div>

        {/* Certificate Modal — only renderable when course is completed */}
        {certCourse && (
          <CertificateModal
            isOpen={!!certCourse}
            onClose={() => setCertCourse(null)}
            courseTitle={certCourse.title}
            courseId={certCourse.id}
            userName={JSON.parse(localStorage.getItem('oracle_user') || '{}').fullName || 'Developer'}
            isEarned={canGetCert}
          />
        )}
      </div>
    );
  }

  // ─── COURSES CATALOG + MY COURSES VIEW ───────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <BookOpen className="w-6 h-6 text-[#F89820]" />
            <span>Java Programming Courses</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            20 expert Java tracks — 50+ concepts each — Unlock with real Razorpay for just ₹5
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#F89820]/15 border border-[#F89820]/40 text-xs font-mono text-[#F89820] font-bold">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Every Course Exactly ₹5 INR</span>
        </div>
      </div>

      {/* Tabs: Catalog | My Courses */}
      <div className="flex rounded-xl bg-[#151F32] p-1 border border-white/5 text-xs font-mono w-fit">
        <button
          onClick={() => setViewTab('catalog')}
          className={`px-5 py-2 rounded-lg font-semibold transition ${viewTab === 'catalog' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          ALL COURSES (20)
        </button>
        <button
          onClick={() => setViewTab('my-courses')}
          className={`px-5 py-2 rounded-lg font-semibold transition flex items-center space-x-1.5 ${viewTab === 'my-courses' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>MY COURSES {purchasedCourses.length > 0 ? `(${purchasedCourses.length})` : ''}</span>
        </button>
      </div>

      {/* ─── MY COURSES TAB ─── */}
      {viewTab === 'my-courses' && (
        <div>
          {purchasedCourses.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-gray-400 font-mono text-sm">You haven't purchased any courses yet.</p>
              <button onClick={() => setViewTab('catalog')} className="px-5 py-2 rounded-xl bg-[#F89820] text-black font-mono font-bold text-xs">
                Browse Courses →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasedCourses.map((course) => (
                <div key={course.id} className="glass-card rounded-2xl border border-white/5 p-5 space-y-4 hover:border-[#22C55E]/30 transition">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                      LIFETIME ACCESS
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      Purchased {course.purchasedAt ? new Date(course.purchasedAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{course.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-gray-400">{course.completedLessons || 0} / {course.totalLessons} lessons</span>
                      <span className={course.progressPercent === 100 ? 'text-[#22C55E] font-bold' : 'text-[#F89820]'}>
                        {course.progressPercent || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${course.progressPercent === 100 ? 'bg-gradient-to-r from-[#22C55E] to-emerald-400' : 'bg-gradient-to-r from-[#F89820] to-orange-400'}`}
                        style={{ width: `${course.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Payment ID */}
                  {course.razorpayPaymentId && (
                    <div className="text-[10px] font-mono text-gray-600 truncate">
                      Payment: {course.razorpayPaymentId}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenCourse(course.slug)}
                      className="flex-1 py-2 rounded-lg bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-mono text-xs font-semibold hover:bg-[#22C55E] hover:text-black transition flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{course.progressPercent === 0 ? 'Start Learning' : 'Continue Learning'}</span>
                    </button>

                    {course.isCompleted ? (
                      <button
                        onClick={() => { setSelectedCourse(course); setCertCourse(course); }}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black hover:opacity-90 transition shadow-glow-orange animate-pulse"
                        title="Download Your Certificate!"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="p-2 rounded-lg bg-white/5 text-gray-600 cursor-not-allowed" title={`Complete all lessons to earn certificate (${course.progressPercent || 0}%)`}>
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

      {/* ─── CATALOG TAB ─── */}
      {viewTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="glass-card rounded-2xl border border-white/5 p-5 hover:border-[#F89820]/40 transition flex flex-col justify-between space-y-4 group relative"
            >
              {/* Already purchased badge */}
              {course.isPurchased && (
                <div className="absolute -top-2 -right-2 bg-[#22C55E] text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-md">
                  OWNED
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    course.difficulty === 'Beginner' ? 'bg-[#22C55E]/15 text-[#22C55E]'
                    : course.difficulty === 'Intermediate' ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                    : 'bg-[#F89820]/15 text-[#F89820]'
                  }`}>
                    {course.difficulty}
                  </span>
                  <div className="flex items-center text-sm font-mono font-extrabold text-[#F89820] bg-[#F89820]/10 px-2 py-0.5 rounded border border-[#F89820]/20">
                    <span>₹5 INR</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#F89820] transition line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{course.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>{course.totalLessons} Lessons</span>
                  <span>{course.estimatedDuration}</span>
                </div>

                {/* Progress bar for purchased courses */}
                {course.isPurchased && (
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#F89820] to-[#22C55E] rounded-full"
                        style={{ width: `${course.progressPercent || 0}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">{course.progressPercent || 0}% complete</div>
                  </div>
                )}

                {course.isPurchased ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenCourse(course.slug)}
                      className="flex-1 py-2 rounded-lg bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-mono text-xs font-semibold hover:bg-[#22C55E] hover:text-black transition flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Open Course</span>
                    </button>
                    {course.isCompleted ? (
                      <button
                        onClick={() => { setSelectedCourse(course); setCertCourse(course); }}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black hover:opacity-90 transition shadow-glow-orange"
                        title="Download Certificate"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    ) : (
                      <div
                        className="p-2 rounded-lg bg-white/5 text-gray-600 cursor-not-allowed"
                        title={`Complete all lessons first (${course.progressPercent || 0}%)`}
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => { setCheckoutCourse(course); setPaymentStatus('idle'); setPaymentResult({}); }}
                    className="w-full py-2 rounded-lg bg-[#1B263B] group-hover:bg-[#F89820] group-hover:text-black text-white font-mono text-xs font-semibold border border-white/10 transition flex items-center justify-center space-x-1.5 shadow-md"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Buy Track (₹5 • 50+ Concepts)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          RAZORPAY CHECKOUT MODAL
         ═══════════════════════════════════════════════════════════════════ */}
      {checkoutCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0F1A2E] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#F89820]/20 to-[#E65100]/10 border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
                <span className="font-mono font-bold text-white text-sm">Secure Razorpay Checkout</span>
              </div>
              {paymentStatus === 'idle' && (
                <button onClick={() => setCheckoutCourse(null)} className="text-gray-400 hover:text-white text-sm font-mono transition">✕</button>
              )}
            </div>

            <div className="p-6 space-y-5">

              {/* ── IDLE STATE: Show checkout form ── */}
              {paymentStatus === 'idle' && (
                <>
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-gray-400">Selected Course:</div>
                    <h4 className="text-lg font-bold text-white">{checkoutCourse.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{checkoutCourse.description}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#151F32] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-gray-400">Total Amount (Server-locked)</div>
                      <div className="text-3xl font-extrabold text-[#F89820] font-mono">₹5.00</div>
                      <div className="text-[11px] font-mono text-gray-500">Indian Rupees · 500 paise</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-xs font-mono font-bold block">Lifetime Access</span>
                      <span className="text-[10px] font-mono text-gray-500">{checkoutCourse.totalLessons} lessons · 50+ concepts</span>
                    </div>
                  </div>

                  {/* Payment method icons */}
                  <div className="flex items-center space-x-3 text-[11px] font-mono text-gray-500">
                    <CreditCard className="w-4 h-4" />
                    <span>UPI · Cards · Net Banking · Wallets</span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-500 leading-relaxed bg-[#151F32]/60 p-3 rounded-lg border border-white/5">
                    🔒 Server-side HMAC-SHA256 signature verification. Course unlocks only after confirmed capture. Amount fixed at ₹5 server-side — cannot be manipulated by browser.
                  </div>

                  <button
                    onClick={() => handleInitiatePayment(checkoutCourse)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-sm font-mono shadow-glow-orange hover:opacity-95 transition flex items-center justify-center space-x-2"
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span>Pay ₹5 & Unlock Course</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* ── CREATING ORDER ── */}
              {paymentStatus === 'creating' && (
                <div className="py-8 flex flex-col items-center space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#F89820] border-t-transparent animate-spin" />
                  <div className="font-mono text-white font-bold">Creating Secure Order…</div>
                  <div className="text-xs font-mono text-gray-400">Connecting to Razorpay servers</div>
                </div>
              )}

              {/* ── CHECKOUT OPEN (waiting for Razorpay modal) ── */}
              {paymentStatus === 'checkout' && (
                <div className="py-8 flex flex-col items-center space-y-4 text-center">
                  <Wifi className="w-12 h-12 text-[#F89820] animate-pulse" />
                  <div className="font-mono text-white font-bold">Razorpay Checkout Open</div>
                  <div className="text-xs font-mono text-gray-400">Complete payment in the Razorpay window</div>
                </div>
              )}

              {/* ── VERIFYING ── */}
              {paymentStatus === 'verifying' && (
                <div className="py-8 flex flex-col items-center space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
                  <div className="font-mono text-white font-bold">Verifying Payment…</div>
                  <div className="text-xs font-mono text-gray-400">Cryptographic signature check in progress</div>
                </div>
              )}

              {/* ── SUCCESS ── */}
              {paymentStatus === 'success' && (
                <div className="py-6 flex flex-col items-center space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#22C55E]/20 border-2 border-[#22C55E] flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-white font-mono">Payment Verified! 🎉</div>
                    <div className="text-xs font-mono text-[#22C55E] mt-1">Course successfully unlocked</div>
                  </div>
                  <div className="w-full p-4 rounded-xl bg-[#151F32] border border-white/5 space-y-2 text-xs font-mono text-left">
                    <div className="flex justify-between"><span className="text-gray-400">Course:</span><span className="text-white font-bold truncate max-w-[200px]">{checkoutCourse.title}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Amount:</span><span className="text-[#22C55E] font-bold">₹5.00 INR</span></div>
                    {paymentResult.paymentId && <div className="flex justify-between"><span className="text-gray-400">Payment ID:</span><span className="text-gray-300 truncate max-w-[200px]">{paymentResult.paymentId}</span></div>}
                  </div>
                  <button
                    onClick={() => { setCheckoutCourse(null); setPaymentStatus('idle'); handleOpenCourse(checkoutCourse.slug); }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22C55E] to-emerald-600 text-white font-mono font-bold text-sm flex items-center justify-center space-x-2 hover:opacity-95 transition"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Learning Now</span>
                  </button>
                </div>
              )}

              {/* ── FAILED ── */}
              {paymentStatus === 'failed' && (
                <div className="py-6 flex flex-col items-center space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-white font-mono">Payment Failed</div>
                    <div className="text-xs font-mono text-red-400 mt-1 max-w-xs">{paymentResult.errorMsg || 'Something went wrong.'}</div>
                  </div>
                  <div className="flex flex-col w-full space-y-2">
                    <button
                      onClick={() => { setPaymentStatus('idle'); setPaymentResult({}); }}
                      className="w-full py-3 rounded-xl bg-[#F89820] text-black font-mono font-bold text-sm flex items-center justify-center space-x-2 hover:opacity-90 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retry Payment</span>
                    </button>
                    <button
                      onClick={() => { setCheckoutCourse(null); setPaymentStatus('idle'); }}
                      className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-mono text-xs hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* ── PENDING ── */}
              {paymentStatus === 'pending' && (
                <div className="py-6 flex flex-col items-center space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-white font-mono">Payment Pending</div>
                    <div className="text-xs font-mono text-yellow-400 mt-1">Your payment is being processed</div>
                  </div>
                  <button
                    onClick={handleCheckPaymentStatus}
                    className="w-full py-3 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-mono font-bold text-sm flex items-center justify-center space-x-2 hover:bg-yellow-500/30 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh Payment Status</span>
                  </button>
                  {paymentResult.errorMsg && <div className="text-xs font-mono text-gray-400">{paymentResult.errorMsg}</div>}
                </div>
              )}

              {/* ── ALREADY OWNED ── */}
              {paymentStatus === 'already_owned' && (
                <div className="py-6 flex flex-col items-center space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#22C55E]/20 border-2 border-[#22C55E] flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-white font-mono">Already Purchased!</div>
                    <div className="text-xs font-mono text-[#22C55E] mt-1">You already own this course — no duplicate payment needed.</div>
                  </div>
                  <button
                    onClick={() => { setCheckoutCourse(null); setPaymentStatus('idle'); handleOpenCourse(checkoutCourse.slug); }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22C55E] to-emerald-600 text-white font-mono font-bold text-sm flex items-center justify-center space-x-2 hover:opacity-95 transition"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Open Course</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal — only allowed when isEarned is true */}
      {certCourse && (
        <CertificateModal
          isOpen={!!certCourse}
          onClose={() => setCertCourse(null)}
          courseTitle={certCourse.title}
          courseId={certCourse.id}
          userName={JSON.parse(localStorage.getItem('oracle_user') || '{}').fullName || 'Developer'}
          isEarned={certCourse.isCompleted || false}
        />
      )}
    </div>
  );
};
