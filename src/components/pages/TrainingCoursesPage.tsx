import { useState, useEffect } from 'react';
import type { Course, CourseProgressMap, StreakData } from '../../types/courses';
import { SYSTEM_SKILLS, LEARNING_PATHS } from '../../data/learningPathsData';
import {
  loadCoursesFromStorage,
  saveCoursesToStorage,
  buildInitialProgress,
  saveProgress,
  loadStreak,
  saveStreak,
} from '../../utils/coursesState';
import { CatalogView } from '../courses/CatalogView';
import { DetailView } from '../courses/DetailView';
import { LessonView } from '../courses/LessonView';
import { QuizView } from '../courses/QuizView';
import { CertificatesView } from '../courses/CertificatesView';
import { CertificateModal } from '../courses/CertificateModal';
import { MyLearningView } from '../courses/MyLearningView';
import { StreaksView } from '../courses/StreaksView';
import { LearningPathsView } from '../courses/LearningPathsView';
import { SkillsExplorerView } from '../courses/SkillsExplorerView';
import { RecommendationsView } from '../courses/RecommendationsView';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Trophy,
  Flame,
  Layers,
  Sparkles,
  Compass,
  Zap,
  Target,
  Shield,
  PlusCircle,
} from 'lucide-react';

type TabView = 'paths' | 'catalog' | 'skills' | 'recommended' | 'my-learning' | 'certificates' | 'streaks';
type ActiveMode = TabView | 'detail' | 'lesson' | 'quiz';

export function TrainingCoursesPage() {
  const { user: authUser } = useAuth();
  const canManageCourses = authUser?.role && ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'].includes(authUser.role);

  const [courses] = useState<Course[]>(loadCoursesFromStorage);
  const [progress, setProgress] = useState<CourseProgressMap>(() =>
    buildInitialProgress(courses)
  );
  const [streak] = useState<StreakData>(loadStreak);

  const [currentTab, setCurrentTab] = useState<TabView>('paths');
  const [mode, setMode] = useState<ActiveMode>('paths');

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [lessonPos, setLessonPos] = useState<{ mi: number; li: number }>({ mi: 0, li: 0 });
  const [activeCertCourseId, setActiveCertCourseId] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveCoursesToStorage(courses);
  }, [courses]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  // Realtime calculation of total XP & completed items (NO fake static data)
  const totalCompletedLessons = Object.values(progress).reduce((acc, p) => acc + (p?.done?.size || 0), 0);
  const totalCertificates = Object.values(progress).reduce((acc, p) => acc + (p?.certified ? 1 : 0), 0);
  const calculatedXP = (totalCompletedLessons * 50) + (totalCertificates * 200);

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  // Navigation handlers
  const handleOpenCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    setMode('detail');
  };

  const handleOpenLesson = (mi: number, li: number) => {
    setLessonPos({ mi, li });
    setMode('lesson');
  };

  const handleMarkComplete = (mi: number, li: number) => {
    if (!activeCourse) return;
    const m = activeCourse.modules[mi];
    const l = m?.lessons[li];
    if (!l) return;

    const lessonKey = m.title + '__' + l.title;

    setProgress((prev) => {
      const cur = prev[activeCourse.id] || { done: new Set() };
      const nextDone = new Set(cur.done);
      if (nextDone.has(lessonKey)) {
        nextDone.delete(lessonKey);
      } else {
        nextDone.add(lessonKey);
      }
      return {
        ...prev,
        [activeCourse.id]: { ...cur, done: nextDone },
      };
    });

    toast.success('Progress updated!');
  };

  const handleStartQuiz = () => {
    setMode('quiz');
  };

  const handleQuizPassed = (scorePct: number, _integrityMetrics?: any) => {
    if (!activeCourse) return;
    const credId = `CG-CERT-${activeCourse.id.toUpperCase()}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    setProgress((prev) => ({
      ...prev,
      [activeCourse.id]: {
        ...prev[activeCourse.id],
        quizScore: scorePct,
        certified: true,
        certifiedAt: new Date().toISOString(),
        credId,
      },
    }));

    toast.success('Course Certified! 🎉');
    setActiveCertCourseId(activeCourse.id);
    setMode('detail');
  };

  const handleQuizFailed = () => {
    setMode('detail');
  };

  const switchTab = (tab: TabView) => {
    setCurrentTab(tab);
    setMode(tab);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Top Navbar & Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {[
            { id: 'paths', label: 'Learning Paths', icon: Compass },
            { id: 'catalog', label: 'Course Catalog (50+)', icon: BookOpen },
            { id: 'skills', label: 'Skills Explorer', icon: Target },
            { id: 'recommended', label: 'Recommended', icon: Zap },
            { id: 'my-learning', label: 'My Dashboard', icon: Layers },
            { id: 'certificates', label: 'Credentials', icon: Trophy },
            { id: 'streaks', label: 'Streaks & XP', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id && (mode === tab.id || mode === 'paths');
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id as TabView)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${isActive
                    ? 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                style={{ color: isActive ? undefined : 'var(--text-secondary)' }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Streak, XP Badges & Admin Authoring Action */}
        <div className="flex items-center gap-3 shrink-0">
          {canManageCourses && (
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all border border-indigo-400/40"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Author Course</span>
            </a>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{streak.current} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{calculatedXP} XP</span>
          </div>
        </div>
      </div>

      {/* Course Administrator Banner */}
      {canManageCourses && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="font-bold text-white">Course Administrator Privileges Active</span>
              <p className="text-[11px] text-indigo-300/80">You can create courses, structure modules, and publish certification quizzes.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <div className="flex-1 w-full">
        {mode === 'paths' && (
          <LearningPathsView
            paths={LEARNING_PATHS}
            courses={courses}
            progress={progress}
            onSelectPath={(path) => {
              // Could filter or highlight
            }}
            onOpenCourse={handleOpenCourse}
          />
        )}

        {mode === 'catalog' && (
          <CatalogView
            courses={courses}
            progress={progress}
            onOpenCourse={handleOpenCourse}
          />
        )}

        {mode === 'skills' && (
          <SkillsExplorerView
            skills={SYSTEM_SKILLS}
            courses={courses}
            progress={progress}
            onOpenCourse={handleOpenCourse}
          />
        )}

        {mode === 'recommended' && (
          <RecommendationsView
            courses={courses}
            progress={progress}
            onOpenCourse={handleOpenCourse}
            onSelectPath={() => switchTab('paths')}
          />
        )}

        {mode === 'my-learning' && (
          <MyLearningView
            courses={courses}
            progress={progress}
            onOpenCourse={handleOpenCourse}
          />
        )}

        {mode === 'certificates' && (
          <CertificatesView
            courses={courses}
            progress={progress}
            onOpenCert={(cId) => setActiveCertCourseId(cId)}
          />
        )}

        {mode === 'streaks' && <StreaksView streak={streak} />}

        {mode === 'detail' && activeCourse && (
          <DetailView
            course={activeCourse}
            progress={progress}
            onBack={() => setMode(currentTab)}
            onOpenLesson={handleOpenLesson}
            onStartQuiz={handleStartQuiz}
            onViewCert={(cId) => setActiveCertCourseId(cId)}
          />
        )}

        {mode === 'lesson' && activeCourse && (
          <LessonView
            course={activeCourse}
            lessonPos={lessonPos}
            progress={progress}
            onBack={() => setMode('detail')}
            onMarkComplete={handleMarkComplete}
            onNavigate={(mi, li) => setLessonPos({ mi, li })}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {mode === 'quiz' && activeCourse && (
          <QuizView
            course={activeCourse}
            onBack={() => setMode('detail')}
            onPassed={handleQuizPassed}
            onFailed={handleQuizFailed}
          />
        )}
      </div>

      {/* Certificate Modal */}
      {activeCertCourseId && (
        <CertificateModal
          course={courses.find((c) => c.id === activeCertCourseId) || activeCourse}
          scorePct={progress[activeCertCourseId]?.quizScore ?? 95}
          credId={progress[activeCertCourseId]?.credId}
          onClose={() => setActiveCertCourseId(null)}
        />
      )}
    </div>
  );
}
