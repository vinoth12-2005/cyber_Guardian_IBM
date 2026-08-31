import React, { useState } from 'react';
import type { Course, CourseProgressMap } from '../../types/courses';
import { pct, lessonCount } from '../../utils/coursesState';
import {
  BookOpen,
  Clock,
  Award,
  Trophy,
  Search,
  Layers,
} from 'lucide-react';

interface CatalogViewProps {
  courses: Course[];
  progress: CourseProgressMap;
  onOpenCourse: (courseId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  courses,
  progress,
  onOpenCourse,
}) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...Array.from(new Set(courses.map((c) => c.cat))).sort()];

  const totalCompletedLessons = Object.values(progress).reduce((acc, p) => acc + (p?.done?.size || 0), 0);
  const hoursLearned = (totalCompletedLessons * 0.25).toFixed(1);
  const quizScores = Object.values(progress).map((p) => p?.quizScore).filter((s): s is number => typeof s === 'number');
  const avgQuizScore = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;

  const completedCount = courses.filter((c) => pct(c, progress) === 100).length;
  const certCount = courses.filter((c) => progress[c.id]?.certified).length;

  const filtered = courses.filter(
    (c) =>
      (filter === 'All' || c.cat === filter) &&
      (c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span
            className="text-[11px] font-bold tracking-widest uppercase block mb-1"
            style={{ color: 'var(--accent-info)' }}
          >
            Learning Center
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Training & Cybersecurity Courses
          </h1>
          <p className="text-sm text-secondary mt-1">
            Interactive courses with quizzes, certification, and hands-on scenarios — 50+ modules available.
          </p>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary">Courses Completed</span>
            <div
              className="p-2 rounded-xl"
              style={{ background: 'var(--accent-primary-faint)', color: 'var(--accent-primary)' }}
            >
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-primary">
            {completedCount} <span className="text-sm font-normal text-muted">/ {courses.length}</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary">Time Learned</span>
            <div
              className="p-2 rounded-xl"
              style={{ background: 'var(--accent-info-faint)', color: 'var(--accent-info)' }}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-primary">{hoursLearned}h</div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary">Avg Quiz Score</span>
            <div
              className="p-2 rounded-xl"
              style={{ background: 'var(--accent-warning-faint)', color: 'var(--accent-warning)' }}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-primary">{avgQuizScore > 0 ? `${avgQuizScore}%` : 'N/A'}</div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary">Certificates Earned</span>
            <div
              className="p-2 rounded-xl"
              style={{ background: 'var(--accent-success-faint)', color: 'var(--accent-success)' }}
            >
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-primary">{certCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'bg-white/5 text-secondary hover:text-primary hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search 50+ courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs input-base"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center text-secondary">
            <Search className="w-10 h-10 mx-auto text-muted mb-3" />
            <p className="font-semibold text-primary">No courses match your search</p>
            <p className="text-xs text-muted mt-1">Try selecting a different category or clearing filters.</p>
          </div>
        ) : (
          filtered.map((course) => {
            const progressPct = pct(course, progress);
            const isCertified = progress[course.id]?.certified;

            const bannerStyle = course.bannerImage
              ? { backgroundImage: `url(${course.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: `linear-gradient(135deg, ${course.color1 || '#7C3AED'}, ${course.color2 || '#38BDF8'})` };

            return (
              <div
                key={course.id}
                onClick={() => onOpenCourse(course.id)}
                className="glass-card glass-card-interactive rounded-2xl overflow-hidden cursor-pointer flex flex-col group"
              >
                {/* Banner */}
                <div className="h-32 relative flex items-center justify-center overflow-hidden" style={bannerStyle}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Level Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-white/10 text-white">
                    {course.level}
                  </span>

                  {/* Certified Flag */}
                  {isCertified && (
                    <span className="absolute top-3 right-3 p-1.5 rounded-lg bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-400">
                      <Trophy className="w-4 h-4" />
                    </span>
                  )}

                  {/* Icon */}
                  <div className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                        {course.cat}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-primary group-hover:text-purple-300 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                      {course.desc}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {course.modules.length} Modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lessonCount(course)} Lessons
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-secondary font-medium mb-1">
                        <span>{progressPct === 100 ? 'Completed' : 'Progress'}</span>
                        <span className="font-bold">{progressPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPct}%`,
                            background:
                              progressPct === 100
                                ? 'linear-gradient(90deg, #10B981, #38BDF8)'
                                : 'linear-gradient(90deg, #7C3AED, #38BDF8)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
