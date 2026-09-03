export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon?: string;
  relatedCourses: string[]; // Course IDs
}

export interface Activity {
  id: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'code' | 'simulation' | 'scenario';
  duration: string;
  content: string; // Markdown or rich instructions
  codeTemplate?: string;
  interactiveConfig?: {
    type: 'packet-analysis' | 'sql-injection' | 'log-investigation' | 'drag-drop';
    instructions: string;
    targetSolution?: string;
  };
}

export interface FlipCardData {
  front: {
    title: string;
    scenario: string;
    indicator: string;
  };
  back: {
    title: string;
    analysis: string;
    mitigation: string;
  };
}

export interface Lesson {
  id?: string;
  title: string;
  type: 'reading' | 'video' | 'quiz' | 'interactive' | string;
  dur: string;
  body: string;
  image?: string;
  videoUrl?: string;
  flipCard?: FlipCardData;
  example?: string;
  realTimeExample?: string;
  points?: string[];
  activities?: Activity[];
  knowledgeCheck?: QuizQuestion[];
}

export interface Module {
  id?: string;
  title: string;
  desc?: string;
  duration?: string;
  objectives?: string[];
  lessons: Lesson[];
  moduleQuiz?: QuizQuestion[];
}

export interface QuizQuestion {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface Course {
  id: string;
  title: string;
  cat: string;
  icon: string;
  color1: string;
  color2: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  desc: string;
  duration?: string; // e.g. "4-6 hours"
  provider?: string; // e.g. "CyberGuardian Security Institute"
  objectives: string[];
  skillsGained?: string[]; // Skill names or Skill IDs
  prerequisites?: string[];
  bannerImage?: string | null;
  introVideo?: string;
  status?: 'draft' | 'published' | 'archived';
  createdBy?: string;
  sourceDocName?: string;
  modules: Module[];
  quiz: QuizQuestion[]; // Final Assessment
  credentialEligible?: boolean;
  credentialName?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  domain: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  shortDesc: string;
  desc: string;
  estimatedDuration: string;
  coursesCount: number;
  modulesCount: number;
  courses: string[]; // Course IDs in sequence
  skillsDeveloped: string[];
  learningObjectives: string[];
  prerequisites: string[];
  credentialName: string;
  credentialBadge?: string;
  recommendedNextPathId?: string;
}

export interface CredentialEarned {
  id: string;
  credentialId: string; // e.g. CG-CRED-2026-X892
  title: string;
  skills: string[];
  issuedAt: string;
  recipientName: string;
  verified: boolean;
  learningPathId?: string;
  courseId?: string;
}

export interface CourseProgressItem {
  done: Set<string>; // lesson keys (e.g. mIdx__lIdx or module.title + '__' + lesson.title)
  activitiesDone?: Set<string>;
  quizzesPassed?: Record<string, number>; // moduleId -> score
  quizScore?: number;
  finalAssessmentScore?: number;
  certified?: boolean;
  certifiedAt?: string;
  credId?: string;
  timeSpentMinutes?: number;
}

export type CourseProgressMap = Record<string, CourseProgressItem>;

export interface PathProgressItem {
  completedCourseIds: Set<string>;
  completedModulesCount: number;
  progressPercentage: number;
  completedAt?: string;
  credentialEarnedId?: string;
}

export type PathProgressMap = Record<string, PathProgressItem>;

export interface StreakData {
  current: number;
  best: number;
  week: boolean[];
}
