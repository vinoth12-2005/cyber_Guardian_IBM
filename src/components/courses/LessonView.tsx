import React from 'react';
import type { Course, CourseProgressMap } from '../../types/courses';
import {
  flatLessons,
  allNonQuizDone,
  doneNonQuizCount,
  nonQuizLessonCount,
} from '../../utils/coursesState';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Play,
  Award,
} from 'lucide-react';
import { InteractiveFlipCard } from './InteractiveFlipCard';

interface LessonViewProps {
  course: Course;
  lessonPos: { mi: number; li: number };
  progress: CourseProgressMap;
  onBack: () => void;
  onMarkComplete: (moduleIndex: number, lessonIndex: number) => void;
  onNavigate: (moduleIndex: number, lessonIndex: number) => void;
  onStartQuiz: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  course,
  lessonPos,
  progress,
  onBack,
  onMarkComplete,
  onNavigate,
  onStartQuiz,
}) => {
  const { mi, li } = lessonPos;
  const module = course.modules[mi];
  const lesson = module?.lessons[li];

  if (!module || !lesson) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-secondary">Lesson not found.</p>
        <button onClick={onBack} className="btn-ghost mt-4 text-xs">
          Return to Course
        </button>
      </div>
    );
  }

  const lessonKey = module.title + '__' + lesson.title;
  const isDone = progress[course.id]?.done.has(lessonKey);

  const flatList = flatLessons(course);
  const currentIdx = flatList.findIndex((x) => x.mi === mi && x.li === li);
  const prevLesson = currentIdx > 0 ? flatList[currentIdx - 1] : null;
  const nextLesson = currentIdx < flatList.length - 1 ? flatList[currentIdx + 1] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to course overview
      </button>

      {/* Main Lesson Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        {/* Breadcrumb */}
        <div className="text-xs text-muted font-medium flex items-center gap-2">
          <span>{course.title}</span>
          <span>›</span>
          <span className="text-purple-400 font-semibold">{module.title}</span>
        </div>

        {/* Lesson Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl font-bold text-primary">{lesson.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-300">
                {lesson.type}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted" />
                {lesson.dur}
              </span>
            </div>
          </div>

          {isDone && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          )}
        </div>

        {/* Lesson Body Content */}
        <div className="space-y-5">
          {lesson.type === 'quiz' ? (
            <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-sm text-secondary leading-relaxed">{lesson.body}</p>
              {allNonQuizDone(course, progress) ? (
                <button
                  onClick={onStartQuiz}
                  className="py-2.5 px-5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 transition-all shadow-md shadow-purple-500/20"
                >
                  <Award className="w-4 h-4" /> Start Final Assessment
                </button>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                  <Lock className="w-4 h-4" /> Complete all prerequisite lessons first (
                  {doneNonQuizCount(course, progress)}/{nonQuizLessonCount(course)} done)
                </div>
              )}
            </div>
          ) : lesson.type === 'video' ? (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <a
                  href={lesson.body}
                  target="_blank"
                  rel="noreferrer"
                  className="w-16 h-16 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl shadow-purple-600/40 hover:scale-105 transition-all"
                >
                  <Play className="w-8 h-8 ml-1" />
                </a>
              </div>
              <button
                onClick={() => onMarkComplete(mi, li)}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                }`}
              >
                <Check className="w-4 h-4" /> {isDone ? 'Marked as Complete' : 'Mark as Complete'}
              </button>
            </div>
          ) : (
            /* Reading / Interactive Lesson */
            <div className="space-y-6">
              {/* Image / Diagram Banner */}
              {lesson.image && (
                <div className="rounded-xl overflow-hidden border border-[var(--border-default)] glass-card p-2 bg-black/40">
                  <img
                    src={lesson.image}
                    alt={lesson.title}
                    className="w-full h-auto rounded-lg max-h-96 object-contain object-center mx-auto"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none');
                    }}
                  />
                  <span className="text-[10px] text-[var(--text-muted)] italic block text-center mt-1.5">
                    Figure: {lesson.title} Architectural Diagram & Threat Flow
                  </span>
                </div>
              )}

              {/* Video Lecture Demonstration */}
              {lesson.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-[var(--border-default)] glass-card p-3 bg-black/60 space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Play className="w-3.5 h-3.5" /> Video Lecture & Practical Demonstration
                  </div>
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    {lesson.videoUrl.endsWith('.mp4') || lesson.videoUrl.endsWith('.webm') || lesson.videoUrl.startsWith('/uploads/') ? (
                      <video
                        src={lesson.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      />
                    ) : (
                      <iframe
                        src={lesson.videoUrl}
                        title={lesson.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Interactive 3D Threat Inspector Flip Card */}
              {lesson.flipCard && (
                <InteractiveFlipCard card={lesson.flipCard} />
              )}

              {/* Main Reading Body */}
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border-l-4 border-[var(--accent-primary)] text-[var(--text-secondary)] text-sm leading-relaxed">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-1">
                  <FileText className="w-3.5 h-3.5" /> Subject Core Material
                </div>
                {lesson.body}
              </div>

              {/* Technical Code / Syntax Example */}
              {lesson.example && (
                <div className="p-4 rounded-xl bg-black/50 border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--accent-primary)]">
                    <span>Target Vulnerability Example</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-muted)]">Code / Payload</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-black/80 font-mono text-xs text-emerald-400 overflow-x-auto border border-white/5">
                    {lesson.example}
                  </pre>
                </div>
              )}

              {/* Real-Time Enterprise Example */}
              {lesson.realTimeExample && (
                <div className="p-4 rounded-xl bg-[var(--accent-warning-faint)] border border-[var(--accent-warning-border)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-warning)] uppercase tracking-wider">
                    <span>⚡ Real-Time Breach Case Study</span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    {lesson.realTimeExample}
                  </p>
                </div>
              )}

              {/* Takeaways & Protocols */}
              {lesson.points && lesson.points.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Key Takeaways & Protocols
                  </h4>
                  <ul className="space-y-2">
                    {lesson.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                        <span className="w-5 h-5 rounded-md bg-[var(--accent-primary-faint)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inline Interactive Knowledge Check Question */}
              {lesson.knowledgeCheck && lesson.knowledgeCheck.length > 0 && (
                <div className="p-5 rounded-xl glass-card border border-[var(--accent-primary-border)] space-y-3 bg-[var(--surface-1)]">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                    <span>💡 Module Quick Knowledge Check</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--accent-primary-faint)]">Interactive</span>
                  </div>
                  {lesson.knowledgeCheck.map((kc, kIdx) => (
                    <div key={kIdx} className="space-y-2">
                      <p className="text-xs font-bold text-[var(--text-primary)]">{kc.q}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {kc.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => alert(oIdx === kc.answer ? "Correct! " + (kc.explanation || "") : "Incorrect. Try again!")}
                            className="p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-left text-xs text-[var(--text-secondary)] transition-all font-medium"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => onMarkComplete(mi, li)}
                  className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isDone
                      ? 'bg-[var(--accent-success-faint)] border border-[var(--accent-success-border)] text-[var(--accent-success)]'
                      : 'bg-[var(--accent-primary)] hover:opacity-90 text-white shadow-md'
                  }`}
                >
                  <Check className="w-4 h-4" /> {isDone ? 'Marked as Complete' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Lesson Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div>
            {prevLesson && (
              <button
                onClick={() => onNavigate(prevLesson.mi, prevLesson.li)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-primary hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> {prevLesson.l.title}
              </button>
            )}
          </div>

          <div>
            {nextLesson && (
              <button
                onClick={() => onNavigate(nextLesson.mi, nextLesson.li)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition-all flex items-center gap-2"
              >
                {nextLesson.l.title} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
