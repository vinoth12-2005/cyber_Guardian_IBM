// ============================================================
// SE-LAB — Social Engineering Simulation Lab
// Full Type System for the SE-LAB Engine
// ============================================================

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EnvironmentType =
  | 'email'
  | 'sms'
  | 'chat'
  | 'browser'
  | 'portal'
  | 'phone'
  | 'qr'
  | 'mfa'
  | 'oauth'
  | 'extension'
  | 'video'
  | 'multi'
  | 'social-media'
  | 'network'
  | 'desktop';

export type SEEventType =
  | 'SIMULATION_STARTED'
  | 'MESSAGE_OPENED'
  | 'SENDER_INSPECTED'
  | 'LINK_HOVERED'
  | 'LINK_OPENED'
  | 'URL_INSPECTED'
  | 'ATTACHMENT_OPENED'
  | 'HEADER_VIEWED'
  | 'FORM_OPENED'
  | 'FORM_FIELD_FOCUSED'
  | 'SYNTHETIC_DATA_ENTERED'
  | 'FORM_SUBMITTED'
  | 'CREDENTIAL_EXPOSED'
  | 'PERMISSION_VIEWED'
  | 'PERMISSION_ACCEPTED'
  | 'PERMISSION_REJECTED'
  | 'QR_SCANNED'
  | 'CALL_STARTED'
  | 'CALL_ENDED'
  | 'MFA_APPROVED'
  | 'MFA_DENIED'
  | 'MFA_REPORTED'
  | 'MESSAGE_REPLIED'
  | 'REPORT_FILED'
  | 'BLOCK_APPLIED'
  | 'VERIFICATION_PERFORMED'
  | 'WARNING_TRIGGERED'
  | 'ATTACKER_DATA_EXPOSED'
  | 'DEFENSE_ACTION'
  | 'BRANCH_TAKEN'
  | 'SIMULATION_COMPLETED'
  | 'SIMULATION_FAILED'
  | 'USER_EXECUTION';

// A single event recorded during the simulation
export interface SEEvent {
  id: string;
  type: SEEventType;
  timestamp: string;
  label: string;
  riskDelta: number;          // positive = raises risk, negative = lowers risk
  scoreDelta: number;
  isInvestigative?: boolean;  // counts toward investigative action minimum
  isDefensive?: boolean;      // counts toward defense actions
  isBranch?: boolean;         // this event produced a branch
  attackerSees?: string;      // what the simulated attacker observes
  exposedData?: string[];     // synthetic data items exposed
}

// Learning panel card shown reactively
export interface LearningCard {
  trigger: SEEventType;         // shown when this event fires
  title: string;
  body: string;
  attackerSaw?: string;
  detect?: string;
  respond?: string;
}

// Hint system
export interface Hint {
  level: 1 | 2 | 3;
  text: string;
  scorePenalty: number;
}

// A branch decision the learner can reach
export interface BranchOption {
  id: string;
  label: string;
  icon?: string;
  eventType: SEEventType;
  riskDelta: number;
  scoreDelta: number;
  attackerSees?: string;
  exposedData?: string[];
  nextState?: string;
  feedbackTitle: string;
  feedbackBody: string;
  isDefensive: boolean;
}

// Attacker campaign state
export interface AttackerEvent {
  timestamp: string;
  label: string;
  severity: 'info' | 'warn' | 'critical';
}

// Debrief report structure
export interface DebriefSection {
  attackScenario: string;
  outcome: 'safe' | 'compromised' | 'partial';
  whatYouDid: { label: string; good: boolean }[];
  attackerObtained: string[];
  indicators: string[];
  correctResponse: string[];
  score: number;
  grade: string;
  categoryScores: { label: string; score: number }[];
}

// Simulation scenario configuration
export interface SESimulation {
  id: string;                   // "SE-001"
  numericId: number;            // 1
  title: string;
  category: string;
  difficulty: Difficulty;
  duration: number;             // minutes
  environment: EnvironmentType;
  xp: number;
  icon: string;
  goal: string;
  summary: string;
  brand?: string;               // fictional brand: "Northstar Systems"
  learningObjectives: string[];
  hints: Hint[];
  learningCards: LearningCard[];
  debrief: DebriefSection;
}

// ---- RUNTIME STATE (managed by simulation store) ----

export interface SimulationSession {
  sessionId: string;
  simulationId: string;
  startedAt: string;
  currentState: string;
  riskLevel: RiskLevel;
  riskScore: number;             // 0–100
  score: number;                 // 0–100
  events: SEEvent[];
  attackerEvents: AttackerEvent[];
  exposedData: string[];
  hintsUsed: number;
  investigativeActions: number;
  defensiveActions: number;
  branchTaken: string | null;
  isComplete: boolean;
  completedAt?: string;
}

// Score breakdown
export interface ScoreBreakdown {
  detection: number;
  verification: number;
  infoProtection: number;
  decisionQuality: number;
  responseTime: number;
  total: number;
  grade: string;
}

// User profile
export interface UserProfile {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  lastActiveDate: string;
}

// Simulation result (stored on completion)
export interface SimulationResult {
  id: string;
  numericId: number;
  title: string;
  difficulty: Difficulty;
  stars: number;
  score: number;
  date: string;
  outcome: 'safe' | 'compromised' | 'partial';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  simulationId?: number;
  simulationsRequired?: number;
  xpRequired?: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface AppState {
  profile: UserProfile;
  completedList: SimulationResult[];
  achievements: Achievement[];
  settings: UserSettings;
}
