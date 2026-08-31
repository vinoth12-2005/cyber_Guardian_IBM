export type RiskLevel = 'Safe' | 'Suspicious' | 'Dangerous';
export type ScoreLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type SimulationDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface UserProfile {
  name: string;
  email?: string;
  avatarUrl: string;
  awarenessLevel: ScoreLevel;
  securityTipOfDay: {
    tip: string;
    category: string;
  };
}

export interface AwarenessScoreData {
  overallScore: number;
  maxScore: number;
  level: ScoreLevel;
  weeklyProgress: number; // percentage change, e.g., +6.5
  categoryScores: {
    phishingDefense: number;
    passwordHygiene: number;
    networkSecurity: number;
    threatDetection: number;
  };
}

export interface QuickStatItem {
  id: string;
  title: string;
  value: number | string;
  trend: string;
  isPositive: boolean;
  iconName: string;
  gradient: string;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  type: 'URL' | 'Email' | 'QR Code' | 'Attachment' | 'IP Address';
  target: string;
  result: string;
  riskLevel: RiskLevel;
  status: 'Completed' | 'Quarantined' | 'Whitelisted' | 'Flagged';
  details?: {
    threatType?: string;
    engineDetections?: string;
    recommendation?: string;
  };
}

export interface SuspiciousActivityItem {
  id: string;
  date: string;
  category: 'Suspicious Website' | 'Fake Login' | 'Phishing Email' | 'Scam QR' | 'Malware Link';
  target: string;
  riskLevel: RiskLevel;
  aiExplanation: string;
  technicalDetails: {
    ipAddress?: string;
    location?: string;
    indicatorsOfCompromise: string[];
    remediationAction: string;
  };
}

export interface ChatbotHistoryItem {
  id: string;
  date: string;
  question: string;
  aiSummary: string;
  category: 'Phishing' | 'Password' | 'Network' | 'Privacy' | 'General';
  messageCount: number;
}

export interface SimulationHistoryItem {
  id: string;
  simulationType: string;
  difficulty: SimulationDifficulty;
  result: 'Passed' | 'Failed' | 'In Progress';
  score: number; // e.g. 92%
  completionPercentage: number;
  date: string;
}

export interface WeeklyReportData {
  scoreChange: number;
  simulationsCompleted: number;
  threatsIdentified: number;
  weakAreas: string[];
  strongAreas: string[];
  barChartData: {
    day: string;
    threatsBlocked: number;
    scansPerformed: number;
  }[];
  lineChartData: {
    week: string;
    score: number;
  }[];
  pieChartData: {
    name: string;
    value: number;
    color: string;
  }[];
}

export interface AttackTrendItem {
  id: string;
  attackName: string;
  description: string;
  difficulty: SimulationDifficulty;
  popularity: number; // 0-100 percentage bar
  preventionTips: string[];
  iconName: string;
}

export interface AIRecommendationItem {
  id: string;
  title: string;
  priority: PriorityLevel;
  reason: string;
  actionText: string;
  actionType: 'simulation' | 'course' | 'setting' | 'review';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'score' | 'simulation' | 'report' | 'recommendation' | 'alert';
}

export type UIState = 'normal' | 'loading' | 'empty' | 'error';
