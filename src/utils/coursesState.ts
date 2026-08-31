import { COURSES_DEFAULT } from '../data/coursesData';
import type { Course, CourseProgressMap, StreakData } from '../types/courses';

export const COURSES_STORAGE_KEY = 'cga_courses';
export const PROGRESS_STORAGE_KEY = 'cga_progress';
export const STREAK_STORAGE_KEY = 'cga_streak';

export const INITIAL_STREAK: StreakData = {
  current: 7,
  best: 14,
  week: [true, true, true, true, true, true, false],
};

export function loadCoursesFromStorage(): Course[] {
  try {
    const raw = localStorage.getItem(COURSES_STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      if (Array.isArray(stored) && stored.length > 0) {
        const map = new Map<string, Course>();
        COURSES_DEFAULT.forEach((c) => map.set(c.id, c));
        stored.forEach((c) => map.set(c.id, c));
        return Array.from(map.values());
      }
    }
  } catch (err) {
    console.error('Error loading courses:', err);
  }
  return COURSES_DEFAULT;
}

export function saveCoursesToStorage(courses: Course[]): void {
  try {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  } catch (err) {
    console.error('Error saving courses:', err);
  }
}

export function buildInitialProgress(courses: Course[]): CourseProgressMap {
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  })();

  const progress: CourseProgressMap = {};
  courses.forEach((c) => {
    const s = saved[c.id] || {};
    progress[c.id] = {
      done: new Set(Array.isArray(s.done) ? s.done : []),
      activitiesDone: new Set(Array.isArray(s.activitiesDone) ? s.activitiesDone : []),
      quizzesPassed: s.quizzesPassed || {},
      finalAssessmentScore: s.finalAssessmentScore ?? s.quizScore ?? undefined,
      quizScore: s.quizScore ?? undefined,
      certified: s.certified || false,
      certifiedAt: s.certifiedAt || undefined,
      credId: s.credId || undefined,
      timeSpentMinutes: s.timeSpentMinutes || 0,
    };
  });
  return progress;
}

export function saveProgress(progress: CourseProgressMap): void {
  try {
    const serializable: Record<string, any> = {};
    Object.entries(progress).forEach(([id, p]) => {
      serializable[id] = {
        done: Array.from(p.done),
        activitiesDone: Array.from(p.activitiesDone || []),
        quizzesPassed: p.quizzesPassed || {},
        finalAssessmentScore: p.finalAssessmentScore,
        quizScore: p.quizScore,
        certified: p.certified,
        certifiedAt: p.certifiedAt,
        credId: p.credId,
        timeSpentMinutes: p.timeSpentMinutes || 0,
      };
    });
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(serializable));
  } catch (err) {
    console.error('Error saving progress:', err);
  }
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return INITIAL_STREAK;
}

export function saveStreak(streak: StreakData): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
  } catch (err) {
    console.error('Error saving streak:', err);
  }
}

// ── Course Helpers ──────────────────────────────────────────────────────────
export function lessonCount(course: Course): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function doneCount(course: Course, progress: CourseProgressMap): number {
  return progress[course.id]?.done.size ?? 0;
}

export function pct(course: Course, progress: CourseProgressMap): number {
  const t = lessonCount(course);
  return t ? Math.round((doneCount(course, progress) / t) * 100) : 0;
}

export function nonQuizLessonKeys(course: Course): string[] {
  const keys: string[] = [];
  course.modules.forEach((m) =>
    m.lessons.forEach((l) => {
      if (l.type !== 'quiz') keys.push(m.title + '__' + l.title);
    })
  );
  return keys;
}

export function nonQuizLessonCount(course: Course): number {
  return nonQuizLessonKeys(course).length;
}

export function doneNonQuizCount(course: Course, progress: CourseProgressMap): number {
  return nonQuizLessonKeys(course).filter((k) => progress[course.id]?.done.has(k)).length;
}

export function allNonQuizDone(course: Course, progress: CourseProgressMap): boolean {
  const keys = nonQuizLessonKeys(course);
  if (keys.length === 0) return true;
  return keys.every((k) => progress[course.id]?.done.has(k));
}

export function flatLessons(course: Course) {
  const list: { mi: number; li: number; m: Course['modules'][0]; l: Course['modules'][0]['lessons'][0] }[] = [];
  course.modules.forEach((m, mi) =>
    m.lessons.forEach((l, li) => list.push({ mi, li, m, l }))
  );
  return list;
}
