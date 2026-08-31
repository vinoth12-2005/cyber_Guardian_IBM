import React, { useState } from 'react';
import type { LearningPath, Course, CourseProgressMap } from '../../types/courses';
import {
  Compass,
  CheckCircle2,
  Award,
  ChevronRight,
  Layers,
  Target,
  Sparkles,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface LearningPathsViewProps {
  paths: LearningPath[];
  courses: Course[];
  progress: CourseProgressMap;
  onSelectPath: (path: LearningPath) => void;
  onOpenCourse: (courseId: string) => void;
}

export function LearningPathsView({
  paths,
  courses,
  progress,
  onOpenCourse,
}: LearningPathsViewProps) {
  const [selectedPathId, setSelectedPathId] = useState<string>(paths[0]?.id || '');

  const activePath = paths.find((p) => p.id === selectedPathId) || paths[0];

  const getCourseById = (id: string) => courses.find((c) => c.id === id);

  const calculatePathProgress = (path: LearningPath) => {
    if (!path.courses || path.courses.length === 0) return 0;
    let completedCount = 0;
    path.courses.forEach((cId) => {
      if (progress[cId]?.certified) {
        completedCount++;
      }
    });
    return Math.round((completedCount / path.courses.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner — Standardized with CyberGuardian Design Tokens */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-primary-faint)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Structured Career Journeys ({paths.length} Paths)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Role-Based Learning Paths
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Follow end-to-end skill progression pathways designed by industry leaders. Each path combines sequential courses, interactive labs, knowledge checkpoints, and verifiable credentials.
          </p>
        </div>
      </div>

      {/* Path Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.map((path) => {
          const isSelected = path.id === activePath.id;
          const pathPct = calculatePathProgress(path);
          return (
            <button
              key={path.id}
              onClick={() => setSelectedPathId(path.id)}
              className={`text-left p-5 rounded-2xl glass-card transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-faint)] shadow-md'
                  : 'hover:border-[var(--border-medium)]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    {path.level}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{path.estimatedDuration}</span>
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-base line-clamp-1">{path.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{path.shortDesc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>{path.courses.length} Courses</span>
                  <span className="font-semibold text-[var(--accent-primary)]">{pathPct}% Complete</span>
                </div>
                <div className="w-full h-1.5 progress-track">
                  <div
                    className="h-full bg-[var(--accent-primary)] transition-all duration-500 rounded-full"
                    style={{ width: `${pathPct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Path Detailed Overview */}
      {activePath && (
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-md bg-[var(--accent-primary-faint)] text-[var(--accent-primary)] border border-[var(--accent-primary-border)]">
                    {activePath.domain}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">• {activePath.estimatedDuration}</span>
                  <span className="text-xs text-[var(--text-muted)]">• {activePath.courses.length} Courses</span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">{activePath.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{activePath.desc}</p>
              </div>

              {/* Credential Preview Box */}
              <div className="lg:w-72 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] flex items-start gap-3 shrink-0">
                <div className="p-2.5 rounded-lg bg-[var(--accent-primary-faint)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider text-[var(--accent-primary)] uppercase">
                    Path Credential
                  </span>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2">
                    {activePath.credentialName}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Awarded upon 100% completion</p>
                </div>
              </div>
            </div>

            {/* Skills & Learning Objectives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Developed */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Skills Developed</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activePath.skillsDeveloped.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Objectives */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <Target className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Learning Objectives</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  {activePath.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prerequisites */}
            {activePath.prerequisites && activePath.prerequisites.length > 0 && (
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--text-secondary)]">Prerequisites:</span>
                <span>{activePath.prerequisites.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Sequential Course Journey */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
                <span>Course Sequence</span>
              </h4>
              <span className="text-xs text-[var(--text-muted)]">Complete in sequence for optimal skill building</span>
            </div>

            <div className="space-y-3">
              {activePath.courses.map((courseId, index) => {
                const c = getCourseById(courseId);
                if (!c) return null;
                const isCompleted = progress[c.id]?.certified;
                const isFirst = index === 0;
                const prevCourseId = index > 0 ? activePath.courses[index - 1] : null;
                const prevCompleted = prevCourseId ? progress[prevCourseId]?.certified : true;
                const isLocked = !isFirst && !prevCompleted && !isCompleted;

                return (
                  <div
                    key={c.id}
                    className={`p-4 sm:p-5 rounded-xl border glass-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'border-[var(--accent-success-border)] bg-[var(--accent-success-faint)]'
                        : isLocked
                        ? 'opacity-60 bg-[var(--surface-1)]'
                        : 'hover:border-[var(--accent-primary-border)]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCompleted
                            ? 'bg-[var(--accent-success)] text-black'
                            : isLocked
                            ? 'bg-[var(--surface-3)] text-[var(--text-muted)]'
                            : 'bg-[var(--accent-primary-faint)] text-[var(--accent-primary)] border border-[var(--accent-primary-border)]'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-[var(--text-primary)] text-sm sm:text-base">{c.title}</h5>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            {c.level}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{c.desc}</p>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] pt-1">
                          <span>{c.modules.length} Modules</span>
                          <span>•</span>
                          <span>Credential Eligible</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenCourse(c.id)}
                      disabled={isLocked}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all self-end sm:self-auto ${
                        isCompleted
                          ? 'bg-[var(--accent-success-faint)] text-[var(--accent-success)] border border-[var(--accent-success-border)] hover:bg-[var(--accent-success-border)]'
                          : isLocked
                          ? 'bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed border border-transparent'
                          : 'bg-[var(--accent-primary)] text-white hover:opacity-90 shadow-sm'
                      }`}
                    >
                      <span>{isCompleted ? 'Review Course' : isLocked ? 'Locked' : 'Start Course'}</span>
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
