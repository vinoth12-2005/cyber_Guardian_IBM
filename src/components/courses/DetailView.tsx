import React, { useState } from 'react';
import type { Course, CourseProgressMap } from '../../types/courses';
import {
  pct,
  lessonCount,
  doneCount,
  allNonQuizDone,
  doneNonQuizCount,
  nonQuizLessonCount,
} from '../../utils/coursesState';
import {
  ArrowLeft,
  Clock,
  Layers,
  Award,
  Trophy,
  Check,
  ChevronDown,
  ChevronRight,
  Lock,
  Play,
  Target,
} from 'lucide-react';

interface DetailViewProps {
  course: Course;
  progress: CourseProgressMap;
  onBack: () => void;
  onOpenLesson: (moduleIndex: number, lessonIndex: number) => void;
  onStartQuiz: () => void;
  onViewCert: (courseId: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  course,
  progress,
  onBack,
  onOpenLesson,
  onStartQuiz,
  onViewCert,
}) => {
  const [openModules, setOpenModules] = useState<number[]>([0]);
  const progressPct = pct(course, progress);
  const isCertified = progress[course.id]?.certified;
  const isUnlocked = allNonQuizDone(course, progress);

  const toggleModule = (moduleIdx: number) => {
    setOpenModules((prev) =>
      prev.includes(moduleIdx)
        ? prev.filter((i) => i !== moduleIdx)
        : [...prev, moduleIdx]
    );
  };

  const bannerStyle = course.bannerImage
    ? { backgroundImage: `url(${course.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${course.color1 || '#7C3AED'}, ${course.color2 || '#38BDF8'})` };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to all courses
      </button>

      {/* Hero Banner */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="h-44 relative p-6 flex flex-col justify-end" style={bannerStyle}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-purple-300">
              {course.cat} · {course.level}
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">{course.title}</h1>
          </div>
        </div>

        {/* Hero Metadata bar */}
        <div className="p-4 bg-white/5 border-t border-white/5 flex flex-wrap items-center gap-6 text-xs text-secondary">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            {course.modules.length} Modules
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            {lessonCount(course)} Lessons
          </span>
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            {course.quiz.length}-Question Assessment
          </span>
          <span className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            Verified Certificate
          </span>
          {course.introVideo && (
            <a
              href={course.introVideo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold ml-auto"
            >
              <Play className="w-4 h-4" /> Watch Intro Video
            </a>
          )}
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Breakdown (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-primary border-b border-white/5 pb-3">
              <Layers className="w-4 h-4 text-purple-400" />
              Course Syllabus & Modules
            </div>

            <div className="space-y-3">
              {course.modules.map((module, mIdx) => {
                const completedInMod = module.lessons.filter((l) =>
                  progress[course.id]?.done.has(module.title + '__' + l.title)
                ).length;
                const isOpen = openModules.includes(mIdx);

                return (
                  <div
                    key={mIdx}
                    className="rounded-xl border border-white/5 overflow-hidden bg-white/[0.02]"
                  >
                    <button
                      onClick={() => toggleModule(mIdx)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                          {mIdx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-primary">{module.title}</h4>
                          <span className="text-[11px] text-muted">
                            {completedInMod} / {module.lessons.length} lessons completed
                          </span>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted" />
                      )}
                    </button>

                    {/* Lessons list */}
                    {isOpen && (
                      <div className="border-t border-white/5 divide-y divide-white/5 bg-black/20">
                        {module.lessons.map((lesson, lIdx) => {
                          const lessonKey = module.title + '__' + lesson.title;
                          const isDone = progress[course.id]?.done.has(lessonKey);

                          return (
                            <div
                              key={lIdx}
                              onClick={() => onOpenLesson(mIdx, lIdx)}
                              className="p-3.5 pl-6 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs transition-colors ${
                                    isDone
                                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                      : 'border-white/10 text-muted group-hover:border-purple-500/40'
                                  }`}
                                >
                                  {isDone && <Check className="w-3 h-3" />}
                                </div>

                                <div>
                                  <h5 className="text-xs font-semibold text-primary group-hover:text-purple-300 transition-colors">
                                    {lesson.title}
                                  </h5>
                                  <span className="text-[10px] text-muted capitalize">
                                    {lesson.type === 'quiz'
                                      ? 'Quiz Checkpoint'
                                      : lesson.type === 'video'
                                      ? 'Video Lesson'
                                      : 'Reading'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-muted">{lesson.dur}</span>
                                <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Status & Objectives (Right col) */}
        <div className="space-y-4">
          {/* Progress Card */}
          <div className="glass-card rounded-2xl p-5 text-center space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Course Progress
            </h3>

            {/* Gauge Ring */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
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
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * progressPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold text-primary">{progressPct}%</span>
                <span className="text-[10px] text-muted font-medium">Completed</span>
              </div>
            </div>

            <p className="text-xs text-secondary">
              {doneCount(course, progress)} of {lessonCount(course)} lessons completed
            </p>

            {/* Action Buttons */}
            {isCertified ? (
              <button
                onClick={() => onViewCert(course.id)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Trophy className="w-4 h-4" /> View Certificate
              </button>
            ) : isUnlocked ? (
              <button
                onClick={onStartQuiz}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Award className="w-4 h-4" /> Take Final Quiz
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-muted opacity-80 flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-4 h-4 text-muted" />
                Complete lessons ({doneNonQuizCount(course, progress)}/{nonQuizLessonCount(course)})
              </button>
            )}
          </div>

          {/* Objectives Card */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary border-b border-white/5 pb-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Learning Objectives
            </div>

            <ul className="space-y-2 text-xs text-secondary">
              {(course.objectives || []).map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
