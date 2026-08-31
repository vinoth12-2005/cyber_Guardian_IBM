import React from 'react';
import type { Course, CourseProgressMap } from '../../types/courses';
import { LEARNING_PATHS } from '../../data/learningPathsData';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Zap,
  Target,
} from 'lucide-react';

interface RecommendationsViewProps {
  courses: Course[];
  progress: CourseProgressMap;
  onOpenCourse: (courseId: string) => void;
  onSelectPath?: (pathId: string) => void;
}

export function RecommendationsView({
  courses,
  progress,
  onOpenCourse,
  onSelectPath,
}: RecommendationsViewProps) {
  // Compute user completion stats
  const completedCourseIds = Object.entries(progress)
    .filter(([_, p]) => p.certified)
    .map(([id]) => id);

  const completedCourses = courses.filter((c) => completedCourseIds.includes(c.id));

  // Determine recommended next courses based on completed categories and skills
  const completedCategories = new Set(completedCourses.map((c) => c.cat));

  const recommendedCourses = courses
    .filter((c) => !progress[c.id]?.certified)
    .sort((a, b) => {
      const aMatch = completedCategories.has(a.cat) ? 2 : 0;
      const bMatch = completedCategories.has(b.cat) ? 2 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 4);

  const recommendedPaths = LEARNING_PATHS.slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-primary-faint)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>AI-Guided Career Progression</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Recommended Next Steps
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Based on your active learning history, target skill set, and completion milestones, we've tailored these next learning paths and courses to maximize your technical advancement.
          </p>
        </div>
      </div>

      {/* Section 1: Based on What You Completed */}
      {completedCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--accent-success)]" />
              <span>Because You Completed</span>
            </h3>
            <span className="text-xs text-[var(--text-muted)]">{completedCourses.length} Courses Certified</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {completedCourses.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1.5 rounded-md bg-[var(--accent-success-faint)] border border-[var(--accent-success-border)] text-[var(--accent-success)] text-xs font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {c.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Recommended Next Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>Top Recommended Courses</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)]">Tailored to your current level</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedCourses.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl glass-card hover:border-[var(--accent-primary-border)] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-[var(--accent-primary-faint)] text-[var(--accent-primary)] border border-[var(--accent-primary-border)]">
                    {course.cat}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{course.level}</span>
                </div>
                <h4 className="font-bold text-[var(--text-primary)] text-base">{course.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{course.desc}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">{course.modules.length} Modules</span>
                <button
                  onClick={() => onOpenCourse(course.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-90 shadow-sm"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Recommended Paths */}
      <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>Recommended Career Pathways</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedPaths.map((path) => (
            <div
              key={path.id}
              className="p-6 rounded-2xl glass-card hover:border-[var(--accent-primary-border)] transition-all space-y-4"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider">
                  {path.domain}
                </span>
                <h4 className="text-xl font-bold text-[var(--text-primary)]">{path.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{path.shortDesc}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-1.5">
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">Includes {path.courses.length} courses:</span>
                <p className="text-xs text-[var(--accent-primary)] font-medium">
                  {path.skillsDeveloped.join(' • ')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--text-muted)]">{path.estimatedDuration}</span>
                <button
                  onClick={() => onSelectPath && onSelectPath(path.id)}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold flex items-center gap-2 transition-all hover:opacity-90 shadow-sm"
                >
                  <span>Explore Path</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
