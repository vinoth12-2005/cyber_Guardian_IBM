import { useState, useEffect } from 'react';
import type { Course, CourseProgressMap, StreakData } from '../../types/courses';
import { SYSTEM_SKILLS, LEARNING_PATHS } from '../../data/learningPathsData';
import { COURSES_DEFAULT } from '../../data/coursesData';
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
import { api } from '../../lib/api';
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
  RefreshCw,
} from 'lucide-react';

type TabView = 'paths' | 'catalog' | 'skills' | 'recommended' | 'my-learning' | 'certificates' | 'streaks';
type ActiveMode = TabView | 'detail' | 'lesson' | 'quiz';

interface TrainingCoursesPageProps {
  onQuizActiveChange?: (active: boolean) => void;
}

export function TrainingCoursesPage({ onQuizActiveChange }: TrainingCoursesPageProps = {}) {
  const { user: authUser } = useAuth();
  const user = authUser;
  const canManageCourses = authUser?.role && ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'].includes(authUser.role);

  const [courses, setCourses] = useState<Course[]>(loadCoursesFromStorage);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [progress, setProgress] = useState<CourseProgressMap>(() =>
    buildInitialProgress(courses, authUser?.uid)
  );
  const [streak, setStreak] = useState<StreakData>(() => loadStreak(authUser?.uid));

  // Sync courses with backend PostgreSQL/SQLite database to include newly published courses
  const syncCoursesWithServer = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.courses.list({ status: 'published' });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const courseMap = new Map<string, Course>();
        // Seed with default static courses
        COURSES_DEFAULT.forEach((c) => courseMap.set(c.id, c));
        // Seed with local storage
        loadCoursesFromStorage().forEach((c) => courseMap.set(c.id, c));

        // Merge with all server courses
        res.data.forEach((serverCourse: any) => {
          if (serverCourse && serverCourse.id) {
            const existing = courseMap.get(serverCourse.id);
            const mergedCourse: Course = {
              id: serverCourse.id,
              title: serverCourse.title || existing?.title || 'Untitled Course',
              cat: serverCourse.cat || existing?.cat || 'Incident Response',
              icon: serverCourse.icon || existing?.icon || 'Shield',
              color1: serverCourse.color1 || existing?.color1 || '#7C3AED',
              color2: serverCourse.color2 || existing?.color2 || '#38BDF8',
              level: serverCourse.level || existing?.level || 'Beginner',
              desc: serverCourse.desc || serverCourse.desc_text || existing?.desc || '',
              duration: serverCourse.duration || existing?.duration || '4-6 hours',
              provider: serverCourse.provider || existing?.provider || 'CyberGuardian Institute',
              objectives: Array.isArray(serverCourse.objectives)
                ? serverCourse.objectives
                : existing?.objectives || [],
              skillsGained: Array.isArray(serverCourse.skillsGained)
                ? serverCourse.skillsGained
                : existing?.skillsGained || [],
              prerequisites: Array.isArray(serverCourse.prerequisites)
                ? serverCourse.prerequisites
                : existing?.prerequisites || [],
              bannerImage: serverCourse.bannerImage ?? existing?.bannerImage,
              introVideo: serverCourse.introVideo ?? existing?.introVideo,
              status: serverCourse.status || 'published',
              modules: Array.isArray(serverCourse.modules) && serverCourse.modules.length > 0
                ? serverCourse.modules
                : existing?.modules || [],
              quiz: Array.isArray(serverCourse.quiz) && serverCourse.quiz.length > 0
                ? serverCourse.quiz
                : existing?.quiz || [],
              credentialEligible: serverCourse.credentialEligible ?? true,
              credentialName: serverCourse.credentialName || `${serverCourse.title} Specialist`,
            };
            courseMap.set(serverCourse.id, mergedCourse);
          }
        });

        const merged = Array.from(courseMap.values());
        setCourses(merged);
        saveCoursesToStorage(merged);
      }
    } catch (err) {
      console.warn('[TrainingCoursesPage] Notice during courses synchronization:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    syncCoursesWithServer();

    // Auto-sync when window regains focus (e.g., admin tab just published course)
    const onWindowFocus = () => {
      syncCoursesWithServer();
    };
    window.addEventListener('focus', onWindowFocus);
    return () => {
      window.removeEventListener('focus', onWindowFocus);
    };
  }, []);

  const [currentTab, setCurrentTab] = useState<TabView>('paths');
  const [mode, setMode] = useState<ActiveMode>('paths');

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [lessonPos, setLessonPos] = useState<{ mi: number; li: number }>({ mi: 0, li: 0 });
  const [activeCertCourseId, setActiveCertCourseId] = useState<string | null>(null);

  // Re-synchronize user progress and streak when authenticated user changes
  useEffect(() => {
    let isMounted = true;
    const initialProg = buildInitialProgress(courses, authUser?.uid);
    setStreak(loadStreak(authUser?.uid));

    if (authUser?.uid) {
      api.certifications.getMy().then((res) => {
        if (!isMounted) return;
        const certs = (res.success && Array.isArray(res.data)) ? res.data : [];
        const certMap = new Map<string, any>();
        certs.forEach((c: any) => {
          if (c.courseId) certMap.set(c.courseId, c);
        });

        setProgress(() => {
          const updated: CourseProgressMap = { ...initialProg };
          courses.forEach((c) => {
            const serverCert = certMap.get(c.id);
            if (serverCert) {
              const cur = updated[c.id] || { done: new Set() };
              const allDone = new Set(cur.done);
              c.modules.forEach((m) =>
                m.lessons.forEach((l) => allDone.add(m.title + '__' + l.title))
              );
              updated[c.id] = {
                ...cur,
                done: allDone,
                certified: true,
                credId: serverCert.credId,
                quizScore: serverCert.score || 100,
                finalAssessmentScore: serverCert.score || 100,
                certifiedAt: serverCert.issueDate,
              };
            } else if (updated[c.id]) {
              // Ensure courses not certified on server are not falsely shown as certified
              updated[c.id] = {
                ...updated[c.id],
                certified: false,
                credId: undefined,
              };
            }
          });
          saveProgress(updated, authUser.uid);
          return updated;
        });
      }).catch(() => {
        if (isMounted) setProgress(initialProg);
      });
    } else {
      setProgress(initialProg);
    }

    return () => {
      isMounted = false;
    };
  }, [authUser?.uid, courses]);

  // Question tracking for quiz mode header
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizTotalQuestions, setQuizTotalQuestions] = useState<number>(0);

  // Synchronize active quiz state with parent layout (hiding sidebar)
  useEffect(() => {
    const isQuiz = mode === 'quiz';
    onQuizActiveChange?.(isQuiz);
    return () => {
      onQuizActiveChange?.(false);
    };
  }, [mode, onQuizActiveChange]);

  // Sync state to LocalStorage
  useEffect(() => {
    saveCoursesToStorage(courses);
  }, [courses]);

  useEffect(() => {
    saveProgress(progress, authUser?.uid);
  }, [progress, authUser?.uid]);

  useEffect(() => {
    saveStreak(streak, authUser?.uid);
  }, [streak, authUser?.uid]);

  // Realtime calculation of total XP & completed items
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

  const handleQuizPassed = async (scorePct: number, integrityMetrics?: any) => {
    if (!activeCourse) return;
    const credId = `CG-CERT-${activeCourse.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    // Mark all module lessons in this course as completed
    const allLessonKeys: string[] = [];
    activeCourse.modules.forEach((m) =>
      m.lessons.forEach((l) => allLessonKeys.push(m.title + '__' + l.title))
    );

    const now = new Date().toISOString();

    setProgress((prev) => {
      const current = prev[activeCourse.id] || {
        done: new Set(),
        activitiesDone: new Set(),
        quizzesPassed: {},
        timeSpentMinutes: 0,
      };
      const updatedDone = new Set(current.done);
      allLessonKeys.forEach((k) => updatedDone.add(k));

      const updated = {
        ...prev,
        [activeCourse.id]: {
          ...current,
          done: updatedDone,
          quizScore: scorePct,
          finalAssessmentScore: scorePct,
          certified: true,
          certifiedAt: now,
          credId,
        },
      };
      saveProgress(updated, authUser?.uid);
      return updated;
    });

    toast.success('Course Certified! 🎉');
    setActiveCertCourseId(activeCourse.id);
    setMode('detail');

    // Claim on backend to update PostgreSQL certifications, course_enrollments, course_progress, and users XP
    try {
      await api.certifications.claim({
        courseId: activeCourse.id,
        courseTitle: activeCourse.title,
        scorePct,
        credId,
        userName: user?.displayName,
        userEmail: user?.email,
        skills: activeCourse.skillsGained,
      });
    } catch (err) {
      console.warn('[TrainingCoursesPage] Failed to claim cert on server:', err);
    }

    // Record activity timeline
    try {
      await api.activity.record({
        activityType: 'CERTIFICATION_EARNED',
        label: `Earned Certificate: ${activeCourse.title}`,
        detail: `Scored ${scorePct}% on proctored final assessment. Credential ID: ${credId}`,
        category: 'Training',
        iconType: 'award',
        metadata: { courseId: activeCourse.id, scorePct, credId, integrityMetrics },
      });
    } catch (e) {}
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
      {/* Top Navbar & Header Strip: When in Quiz, remove courses & learning paths tabs; show course name & question progress */}
      {mode === 'quiz' ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Assessment In Progress
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-primary tracking-tight">
                {activeCourse?.title || 'Course Assessment'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-secondary">
              <span className="text-muted">Total Questions:</span>
              <span className="font-bold text-primary font-mono text-sm">
                {quizTotalQuestions || activeCourse?.quiz?.length || 0}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-xs font-bold text-purple-300 shadow-sm">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Attending Question:</span>
              <span className="text-white font-mono text-sm px-2 py-0.5 rounded bg-purple-600">
                {quizQuestionIndex + 1}
              </span>
              <span className="text-purple-300 font-mono">
                / {quizTotalQuestions || activeCourse?.quiz?.length || 0}
              </span>
            </div>
          </div>
        </div>
      ) : (
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

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{streak.current} Day Streak</span>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{calculatedXP} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Course Administrator Banner */}
      {canManageCourses && mode !== 'quiz' && (
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
            onRefresh={syncCoursesWithServer}
            isRefreshing={isRefreshing}
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
            onQuestionChange={(current, total) => {
              setQuizQuestionIndex(current);
              setQuizTotalQuestions(total);
            }}
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
