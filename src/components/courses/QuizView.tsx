import React, { useState, useEffect, useRef } from 'react';
import type { Course } from '../../types/courses';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  RotateCcw,
  Trophy,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Maximize2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface QuizViewProps {
  course: Course;
  onBack: () => void;
  onPassed: (scorePct: number, integrityMetrics?: any) => void;
  onFailed: () => void;
  onQuestionChange?: (current: number, total: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  course,
  onBack,
  onPassed,
  onFailed,
  onQuestionChange,
}) => {
  const total = course.quiz.length;
  const [index, setIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(() =>
    new Array(total).fill(null)
  );
  const [finished, setFinished] = useState<boolean>(false);

  // ── Proctored Assessment State (Unstop-Style Anti-Cheat) ───────────────────
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [strikes, setStrikes] = useState<number>(0);
  const [violationModal, setViolationModal] = useState<{
    open: boolean;
    reason: string;
  }>({ open: false, reason: '' });
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);

  // 12-Minute Countdown Timer (720 seconds)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(720);
  const quizContainerRef = useRef<HTMLDivElement>(null);

  const currentQ = course.quiz[index];

  // Notify parent of current question index and total
  useEffect(() => {
    onQuestionChange?.(index, total);
  }, [index, total, onQuestionChange]);

  // Request Fullscreen
  const enterFullscreen = () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } catch (e) {
      // Browser policy fallback
    }
  };

  // Exit Fullscreen safely when test finishes or user exits
  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  // Record Violation Strike
  const recordViolation = (reason: string) => {
    if (finished || isDisqualified) return;

    setStrikes((prev) => {
      const newStrikes = prev + 1;
      if (newStrikes >= 3) {
        setIsDisqualified(true);
        setFinished(true);
        exitFullscreen();
        toast.error('❌ Assessment Disqualified: You exceeded the 3-strike proctoring limit!', {
          duration: 6000,
        });
      } else {
        setViolationModal({
          open: true,
          reason: `${reason} (Warning ${newStrikes} of 3 strikes)`,
        });
        toast.error(`⚠️ Proctoring Strike ${newStrikes}/3: ${reason}`, { duration: 4000 });
      }
      return newStrikes;
    });
  };

  // Setup Proctored Listeners on Mount
  useEffect(() => {
    enterFullscreen();

    // 1. Fullscreen Change Detector
    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (!inFullscreen && !finished && !isDisqualified) {
        recordViolation('Fullscreen lockdown exited');
      }
    };

    // 2. Tab-Switch / Window Blur Detector (Page Visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden && !finished && !isDisqualified) {
        recordViolation('Browser tab switched or app minimized');
      }
    };

    const handleWindowBlur = () => {
      if (!finished && !isDisqualified) {
        recordViolation('Window focus lost (switched to another window)');
      }
    };

    // 3. Prevent Copy, Cut, Paste & Right-Click
    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('Attempted to copy assessment questions');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('Attempted to paste external content');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 4. Keyboard Shortcut Blocker (Ctrl+C, Ctrl+V, Ctrl+U, F12, Ctrl+Shift+I)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'v', 'u', 'a', 'p', 's'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        recordViolation(`Attempted keyboard shortcut (${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key.toUpperCase()})`);
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
        e.preventDefault();
        recordViolation('Attempted to open Developer Tools');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopyCut);
    document.addEventListener('cut', handleCopyCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopyCut);
      document.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      exitFullscreen();
    };
  }, [finished, isDisqualified]);

  // Countdown Timer
  useEffect(() => {
    if (finished || isDisqualified || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinished(true);
          exitFullscreen();
          toast('⏰ Assessment Time Limit Reached. Submitting answers automatically!', {
            icon: '⌛',
            duration: 5000,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finished, isDisqualified, timeLeftSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (optionIdx: number) => {
    setSelectedAnswers((prev) => {
      const copy = [...prev];
      copy[index] = optionIdx;
      return copy;
    });
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      setFinished(true);
      exitFullscreen();
    } else {
      setIndex((i) => i + 1);
    }
  };

  // ── Finished / Results View ────────────────────────────────────────────────
  if (finished) {
    const score = selectedAnswers.reduce<number>((acc, ans, i) => {
      return ans === course.quiz[i]?.answer ? acc + 1 : acc;
    }, 0);
    const finalScore = isDisqualified ? 0 : Math.round((score / total) * 100);
    const passed = !isDisqualified && finalScore >= 70;

    const integrityMetrics = {
      strikes,
      timeSpentSeconds: 720 - timeLeftSeconds,
      disqualified: isDisqualified,
      proctorRating: isDisqualified
        ? 'DISQUALIFIED'
        : strikes === 0
        ? 'CLEAN_VERIFIED'
        : 'FLAGGED_WARNINGS',
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to course
        </button>

        <div className="glass-card rounded-2xl p-8 sm:p-10 text-center space-y-6 shadow-2xl border border-white/10">
          {/* Proctor Integrity Stamp */}
          <div className="flex items-center justify-center gap-2">
            <span
              className={`text-[11px] px-3.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                isDisqualified
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : strikes === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {isDisqualified
                ? '⛔ PROCTOR INTEGRITY: DISQUALIFIED'
                : strikes === 0
                ? '🛡️ PROCTOR INTEGRITY: 100% CLEAN VERIFIED'
                : `⚠️ PROCTOR INTEGRITY: REVIEW FLAG (${strikes} STRIKES)`}
            </span>
          </div>

          {/* Result Gauge */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={isDisqualified ? '#EF4444' : passed ? '#10B981' : '#F59E0B'}
                strokeWidth="8"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * finalScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-primary">{finalScore}%</span>
              <span className="text-[11px] text-muted">
                {score} / {total} Correct
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-primary">
              {isDisqualified
                ? 'Assessment Disqualified ❌'
                : passed
                ? 'Quiz Passed! 🎉'
                : 'Assessment Incomplete'}
            </h2>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-md mx-auto">
              {isDisqualified
                ? 'Your submission was disqualified due to multiple proctoring violations (tab switches or exiting fullscreen mode).'
                : passed
                ? 'Outstanding performance! You have mastered this course module under verified proctoring and unlocked your certificate.'
                : 'You need at least 70% to pass and earn your certificate. Review the lessons and try again in proctored mode.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {passed ? (
              <button
                onClick={() => onPassed(finalScore, integrityMetrics)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4" /> Claim Verified Certificate
              </button>
            ) : (
              <button
                onClick={() => {
                  setIndex(0);
                  setSelectedAnswers(new Array(total).fill(null));
                  setFinished(false);
                  setIsDisqualified(false);
                  setStrikes(0);
                  setTimeLeftSeconds(720);
                }}
                className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retry Assessment
              </button>
            )}

            <button
              onClick={onFailed}
              className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 hover:bg-white/10 text-secondary border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Return to Course
            </button>
          </div>

          {/* Answer Review Accordion */}
          {!isDisqualified && (
            <details className="text-left border-t border-white/5 pt-4 group">
              <summary className="cursor-pointer text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2 select-none">
                <HelpCircle className="w-4 h-4" /> Review Question Breakdown
              </summary>
              <div className="mt-4 space-y-3">
                {course.quiz.map((qItem, i) => {
                  const chosen = selectedAnswers[i];
                  const isCorrect = chosen === qItem.answer;
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                        isCorrect
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>Q{i + 1}: {qItem.q || (qItem as any).question}</span>
                      </div>
                      <div className="text-xs text-muted pl-6">
                        Your answer: <span className={isCorrect ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>{chosen !== null && chosen !== undefined ? qItem.options[chosen] : 'Unanswered'}</span> | Correct: <span className="text-emerald-300 font-semibold">{qItem.options[qItem.answer]}</span>
                      </div>
                      {qItem.explanation && (
                        <div className="text-xs text-secondary pl-6 italic">
                          📖 {qItem.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // ── Active Proctored Assessment View ───────────────────────────────────────
  return (
    <div
      ref={quizContainerRef}
      className="w-full max-w-5xl mx-auto space-y-6 select-none animate-fade-in-up relative"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Background Watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] select-none z-0">
        <span className="text-4xl font-black text-white transform -rotate-12 uppercase tracking-widest text-center">
          ACADEMIC INTEGRITY PROCTORED EXAM · DO NOT COPY OR SCREENSHOT
        </span>
      </div>

      {/* Top Proctoring Status Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Lock className="w-4 h-4 text-cyan-400" /> Unstop Proctoring Active
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Strike Counter */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Warnings:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-md ${
                strikes === 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : strikes === 1
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}
            >
              {strikes} / 3 Strikes
            </span>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          {/* Fullscreen status / restore */}
          {!isFullscreen && (
            <button
              onClick={enterFullscreen}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Re-enter Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* Main Big Frame Question Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 lg:p-12 space-y-8 relative z-10 shadow-2xl border border-white/10">
        {/* Progress Track & Question Palette Navigator */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300">
                Question {index + 1} of {total}
              </span>
              <span className="text-secondary">·</span>
              <span className="text-secondary font-medium">{course.title}</span>
            </div>

            {/* Interactive Question Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {course.quiz.map((_, i) => {
                const isCurrent = i === index;
                const isAnswered = selectedAnswers[i] !== null;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-2 ring-purple-400 scale-105'
                        : isAnswered
                        ? 'bg-purple-950/70 border border-purple-500/50 text-purple-300 hover:bg-purple-900/60'
                        : 'bg-white/5 border border-white/10 text-muted hover:text-white hover:bg-white/10'
                    }`}
                    title={`Question ${i + 1}${isAnswered ? ' (Answered)' : ' (Not Answered)'}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Header */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted flex items-center justify-between">
            <span>Multiple Choice Question</span>
            <span className="text-[11px] text-slate-400 font-mono">Anti-Cheat: Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary leading-relaxed">
            {currentQ?.q || (currentQ as any)?.question}
          </h2>
        </div>

        {/* Options List with Radio Bubbles (No Right/Wrong Leaks) */}
        <div className="space-y-3.5 pt-2">
          {currentQ.options.map((option, i) => {
            const isSelected = selectedAnswers[index] === i;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                className={`w-full p-4 sm:p-5 lg:p-6 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer group ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500/80 shadow-lg shadow-purple-500/10 text-primary ring-2 ring-purple-500/30'
                    : 'bg-white/5 dark:bg-white/[0.03] border-white/10 hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-purple-500/40 text-secondary'
                }`}
              >
                {/* Radio Bubble */}
                <div
                  className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/20 scale-110 shadow-sm shadow-purple-500/50'
                      : 'border-slate-500/60 dark:border-slate-600 group-hover:border-purple-400'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-scale-in" />
                  )}
                </div>

                {/* Letter Identifier (A, B, C, D) */}
                <span
                  className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-sm transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-black/25 dark:bg-white/5 border border-white/10 text-slate-300 group-hover:text-white'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>

                {/* Option Text */}
                <span className="flex-1 text-sm sm:text-base font-medium leading-relaxed select-none">
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer Navigation (Abandon, Previous Question, Next Question / Submit) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to abandon the proctored assessment? Your progress will be reset.')) {
                exitFullscreen();
                onBack();
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            Abandon Exam
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Previous Question Navigation */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={index === 0}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                index === 0
                  ? 'opacity-30 cursor-not-allowed bg-white/5 border-white/5 text-muted'
                  : 'bg-white/10 hover:bg-white/15 border-white/15 text-primary hover:border-white/25 active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous Question
            </button>

            {/* Next Question / Submit Button */}
            <button
              type="button"
              disabled={selectedAnswers[index] === null}
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
            >
              {index + 1 === total ? (
                <>
                  <Award className="w-4 h-4" /> Submit Assessment
                </>
              ) : (
                <>
                  Next Question <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Proctoring Violation Modal Alert */}
      {violationModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-md w-full p-6 rounded-2xl glass-card border border-rose-500/50 bg-slate-900 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                ⚠️ Academic Integrity Alert
              </h3>
              <p className="text-xs text-rose-300 leading-relaxed font-semibold">
                {violationModal.reason}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Unstop proctoring requires you to remain in fullscreen without switching tabs or windows. Reaching 3 strikes results in immediate disqualification.
              </p>
            </div>

            <button
              onClick={() => {
                setViolationModal({ open: false, reason: '' });
                enterFullscreen();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              I Understand & Re-enter Lockdown Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
