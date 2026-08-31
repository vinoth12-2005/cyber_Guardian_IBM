import React, { useState } from 'react';
import type { Skill, Course, CourseProgressMap } from '../../types/courses';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  Layers,
} from 'lucide-react';

interface SkillsExplorerViewProps {
  skills: Skill[];
  courses: Course[];
  progress: CourseProgressMap;
  onOpenCourse: (courseId: string) => void;
}

export function SkillsExplorerView({
  skills,
  courses,
  progress,
  onOpenCourse,
}: SkillsExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(skills.map((s) => s.category)))];

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCourseById = (id: string) => courses.find((c) => c.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-primary-faint)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Competency-Based Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Skill-Based Learning Explorer
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Discover courses directly tied to specific cybersecurity domain capabilities. Target precise technical skills to bridge competency gaps and prepare for specialized industry roles.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skills or competencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl input-base text-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[var(--accent-primary-faint)] text-[var(--accent-primary)] border border-[var(--accent-primary-border)]'
                  : 'bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] border border-[var(--border-subtle)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSkills.map((skill) => {
          const relatedCourses = skill.relatedCourses
            .map((cId) => getCourseById(cId))
            .filter(Boolean) as Course[];

          const completedCount = relatedCourses.filter((c) => progress[c.id]?.certified).length;
          const skillPct = relatedCourses.length ? Math.round((completedCount / relatedCourses.length) * 100) : 0;

          return (
            <div
              key={skill.id}
              className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between hover:border-[var(--accent-primary-border)] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[var(--accent-primary-faint)] text-[var(--accent-primary)] border border-[var(--accent-primary-border)]">
                    {skill.category}
                  </span>
                  <span className="text-xs font-semibold text-[var(--accent-primary)]">{skillPct}% Mastered</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{skill.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{skill.description}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 progress-track">
                  <div
                    className="h-full bg-[var(--accent-primary)] transition-all duration-500 rounded-full"
                    style={{ width: `${skillPct}%` }}
                  />
                </div>
              </div>

              {/* Related Courses List */}
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Mapped Courses ({relatedCourses.length})</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {relatedCourses.slice(0, 3).map((c) => {
                    const isCert = progress[c.id]?.certified;
                    return (
                      <div
                        key={c.id}
                        onClick={() => onOpenCourse(c.id)}
                        className="p-2.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary-border)] hover:bg-[var(--surface-2)] transition-all cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 max-w-[80%]">
                          {isCert ? (
                            <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)] shrink-0" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                          )}
                          <span className="text-[var(--text-primary)] font-medium truncate">{c.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
