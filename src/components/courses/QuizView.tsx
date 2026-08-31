import React, { useState } from 'react';
import type { Course } from '../../types/courses';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';

interface QuizViewProps {
  course: Course;
  onBack: () => void;
  onPassed: (scorePct: number) => void;
  onFailed: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  course,
  onBack,
  onPassed,
  onFailed,
}) => {
  const [index, setIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState<boolean>(false);

  const total = course.quiz.length;
  const currentQ = course.quiz[index];

  const handleSelect = (optionIdx: number) => {
    if (selected !== null) return;
    setSelected(optionIdx);
    const isCorrect = optionIdx === currentQ.answer;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, optionIdx]);
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (finished) {
    const finalScore = Math.round((score / total) * 100);
    const passed = finalScore >= 70;

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in-up">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to course
        </button>

        <div className="glass-card rounded-2xl p-8 text-center space-y-6">
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
                stroke={passed ? '#10B981' : '#F59E0B'}
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
            <h2 className="text-xl font-extrabold text-primary">
              {passed ? 'Quiz Passed! 🎉' : 'Assessment Incomplete'}
            </h2>
            <p className="text-xs text-secondary leading-relaxed">
              {passed
                ? 'Outstanding performance! You have mastered this course module and unlocked your verified certificate.'
                : 'You need at least 70% to pass and earn your certificate. Review the lessons and try again.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {passed ? (
              <button
                onClick={() => onPassed(finalScore)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Trophy className="w-4 h-4" /> Claim Certificate
              </button>
            ) : (
              <button
                onClick={() => {
                  setIndex(0);
                  setAnswers([]);
                  setScore(0);
                  setSelected(null);
                  setFinished(false);
                }}
                className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Retry Quiz
              </button>
            )}

            <button
              onClick={onFailed}
              className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-secondary border border-white/10 flex items-center justify-center gap-2 transition-all"
            >
              Return to Course
            </button>
          </div>

          {/* Answer Review Accordion */}
          <details className="text-left border-t border-white/5 pt-4 group">
            <summary className="cursor-pointer text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2 select-none">
              <HelpCircle className="w-4 h-4" /> Review Question Breakdown
            </summary>
            <div className="mt-4 space-y-3">
              {course.quiz.map((qItem, i) => {
                const chosen = answers[i];
                const isCorrect = chosen === qItem.answer;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      Q{i + 1}: {qItem.q}
                    </div>
                    {!isCorrect && (
                      <div className="text-[11px] text-muted pl-5">
                        Your answer: {chosen !== undefined ? qItem.options[chosen] : 'None'} |
                        Correct: {qItem.options[qItem.answer]}
                      </div>
                    )}
                    {qItem.explanation && (
                      <div className="text-[11px] text-secondary pl-5 italic">
                        📖 {qItem.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in-up">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Exit Quiz
      </button>

      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        {/* Quiz Progress Segments */}
        <div className="flex items-center gap-1.5">
          {course.quiz.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < index
                  ? 'bg-emerald-500'
                  : i === index
                  ? 'bg-purple-500 shadow-sm shadow-purple-500/50'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Question Header */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
            Question {index + 1} of {total} · {course.title}
          </div>
          <h2 className="text-lg font-bold text-primary leading-snug">{currentQ.q}</h2>
        </div>

        {/* Options Grid */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, i) => {
            const isCorrect = i === currentQ.answer;
            let btnStyle = 'bg-white/5 border-white/10 hover:bg-white/10 text-secondary';

            if (selected !== null) {
              if (i === currentQ.answer) {
                btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
              } else if (i === selected && !isCorrect) {
                btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';
              }
            } else if (selected === i) {
              btnStyle = 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex items-center gap-3 ${btnStyle}`}
              >
                <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-bold shrink-0 text-white">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 leading-relaxed">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time Explanation Box */}
        {selected !== null && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-1 ${
              selected === currentQ.answer
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="font-bold flex items-center gap-2">
              {selected === currentQ.answer ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Correct! Excellent work.
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" /> Incorrect
                </>
              )}
            </div>
            {selected !== currentQ.answer && (
              <div className="text-[11px] text-muted">
                Correct answer: {currentQ.options[currentQ.answer]}
              </div>
            )}
            {currentQ.explanation && (
              <div className="text-[11px] text-secondary mt-1">📖 {currentQ.explanation}</div>
            )}
          </div>
        )}

        {/* Footer Next Button */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary transition-colors"
          >
            Exit
          </button>

          <button
            disabled={selected === null}
            onClick={handleNext}
            className="py-2.5 px-6 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all"
          >
            {index + 1 === total ? (
              <>
                <Award className="w-4 h-4" /> View Results
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
  );
};
