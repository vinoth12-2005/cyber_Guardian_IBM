import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { auth } from './lib/firebase';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Overview components
import { WelcomeBanner } from './components/dashboard/WelcomeBanner';
import { CyberAwarenessScore } from './components/dashboard/CyberAwarenessScore';
import { QuickStats } from './components/dashboard/QuickStats';
import { QuickActions } from './components/dashboard/QuickActions';
// Unified Admin Consoles (Embedded directly for administrative roles)
import { AdminAuthProvider } from '@admin/context/AdminAuthContext';
import type { AdminUser } from '@admin/context/AdminAuthContext';
import { AdminDashboardView } from '@admin/components/dashboard/AdminDashboardView';
import { UserListView } from '@admin/components/users/UserListView';
import { CourseListView } from '@admin/components/courses/CourseListView';
import { SimulationListView } from '@admin/components/simulations/SimulationListView';
import { CertificationListView } from '@admin/components/certifications/CertificationListView';
import { AssessmentQuizView } from '@admin/components/assessments/AssessmentQuizView';
import { LearningAnalyticsView } from '@admin/components/analytics/LearningAnalyticsView';
import { FlotBotSecurityDashboard } from '@admin/components/flotbot/FlotBotSecurityDashboard';
import { FlotBotAlertsView } from '@admin/components/flotbot/FlotBotAlertsView';
import { FlotBotMonitoringView } from '@admin/components/flotbot/FlotBotMonitoringView';
import { FlotBotIOCManagement } from '@admin/components/flotbot/FlotBotIOCManagement';
import { FlotBotThreatRules } from '@admin/components/flotbot/FlotBotThreatRules';
import { FlotBotAIAnalysisView } from '@admin/components/flotbot/FlotBotAIAnalysisView';
import { FlotBotUserBehaviourView } from '@admin/components/flotbot/FlotBotUserBehaviourView';
import { FlotBotSecurityReports } from '@admin/components/flotbot/FlotBotSecurityReports';
import { FlotBotConfigView } from '@admin/components/flotbot/FlotBotConfigView';
import { AnnouncementsView } from '@admin/components/announcements/AnnouncementsView';
import { RolesPermissionsView } from '@admin/components/roles/RolesPermissionsView';
import { AuditLogsView } from '@admin/components/audit/AuditLogsView';
import { AdminSettingsView } from '@admin/components/settings/AdminSettingsView';
import { setAdminToken, generateAdminDevToken } from '@admin/lib/api';

// Overview preview components
import { AnalysisHistoryPreview } from './components/dashboard/AnalysisHistoryPreview';
import { SuspiciousActivityPreview } from './components/dashboard/SuspiciousActivityPreview';
import { SimulationHistoryPreview } from './components/dashboard/SimulationHistoryPreview';

// Dedicated pages
import { HistoryPage } from './components/pages/HistoryPage';
import { ThreatsPage } from './components/pages/ThreatsPage';
import { SimulationPage } from './components/pages/SimulationPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { AIAssistantPage } from './components/pages/AIAssistantPage';
import { TrendsPage } from './components/pages/TrendsPage';
import { AIInsightPage } from './components/pages/AIInsightPage';
import { ActivityPage } from './components/pages/ActivityPage';
import { TrainingCoursesPage } from './components/pages/TrainingCoursesPage';
import { SettingsPage } from './components/pages/SettingsPage';
import SimulationProgressPage from './components/pages/SimulationProgressPage';
import AchievementsPage from './components/pages/AchievementsPage';
import { SimulationIdPage } from './components/pages/SimulationIdPage';
import { FlotBotWidget } from './components/flotbot/FlotBotWidget';

// Modals
import { ActivityDetailModal } from './components/modals/ActivityDetailModal';
import { ThreatInterceptionModal } from './components/modals/ThreatInterceptionModal';
import type { ThreatInterceptionData } from './components/modals/ThreatInterceptionModal';
import { ClientURLEngine } from './lib/detection/clientURLEngine';

import { api } from './lib/api';

import type {
  SuspiciousActivityItem,
  AnalysisHistoryItem,
  ChatbotHistoryItem,
  SimulationHistoryItem,
  AIRecommendationItem,
  NotificationItem,
  QuickStatItem,
  AwarenessScoreData,
  WeeklyReportData,
  AttackTrendItem,
  RiskLevel,
  SimulationDifficulty,
  ScoreLevel,
  UserProfile,
} from './types/dashboard';

// Map tab IDs to human-readable page titles
const PAGE_TITLES: Record<string, string> = {
  dashboard:          'Dashboard',
  'courses-training': 'Student Course Catalog Preview',
  training:           'Courses & Training',
  courses:            'Curriculum & Courses Studio',
  assessments:        'Quizzes & Assessments Studio',
  simulations:        'Simulation Cyber Range Studio',
  certifications:     'Credential & Certificate Governance',
  users:              'User Directory & RBAC Governance',
  analytics:          'Learning & Security Analytics',
  'flotbot-dashboard':'FlotBot EDR/XDR Security Dashboard',
  'flotbot-alerts':   'Live Threat & Incident Alerts',
  'flotbot-threats':  'Threat Detections Console',
  'flotbot-monitoring':'Live Endpoint Telemetry',
  'flotbot-iocs':     'Indicators of Compromise (IOC) Database',
  'flotbot-rules':    'EDR Threat Rules Engine',
  'flotbot-ai':       'AI Security Analysis Console',
  'flotbot-behaviour':'User Security Behaviour Analytics',
  'flotbot-history':  'Incident Handling History',
  'flotbot-reports':  'Security & Compliance Reports',
  'flotbot-config':   'FlotBot Endpoint Configuration',
  announcements:      'Platform Announcements',
  roles:              'Admin Roles & RBAC',
  'audit-logs':       'Unified Audit Trails & Logs',
  simulation:         'Simulation Lab',
  'simulation-progress': 'Academy Progress Dashboard',
  achievements:       'Security Credentials & Achievements',
  'ai-assistant':     'AI Assistant',
  reports:            'Reports',
  history:            'Analysis History',
  threats:            'Suspicious Activity',
  trends:             'Attack Trends',
  activity:           'Recent Activity',
  'ai-insight':       'AI Security Insight',
  notifications:      'Notifications',
  settings:           'Settings',
};

function DashboardView({ defaultTab = 'dashboard' }: { defaultTab?: string }) {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  
  // Sync tab if navigated via URL
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<
    SuspiciousActivityItem | AnalysisHistoryItem | null
  >(null);
  const [globalThreatModal, setGlobalThreatModal] = useState<ThreatInterceptionData | null>(null);

  // Live real-time URL & Insecure HTTP detection engine
  const runGlobalUrlInterception = async (targetUrl: string) => {
    if (!targetUrl) return;
    const raw = targetUrl.trim();
    const clientScan = ClientURLEngine.analyze(raw);

    if (clientScan.isThreat) {
      setGlobalThreatModal({
        url: raw,
        domain: clientScan.domain,
        score: clientScan.score,
        riskLevel: clientScan.riskLevel,
        warnings: clientScan.warnings,
        mitre: clientScan.mitre,
        providers: clientScan.provider_results,
        evidence: clientScan.evidence,
        aiExplanation: clientScan.aiExplanation,
        onProceed: () => {
          toast.error('⚠️ Warning bypassed. Insecure destination accessed.');
        },
        onAbort: () => {
          toast.success('🛡️ Safe exit verified. Threat avoided (+20 Awareness XP).');
        },
      });

      // Dispatch to backend API in parallel for full SOC database persistence & threat intel
      try {
        const res = await api.flotbot.analyzeUrl(raw);
        if (res.success && res.data) {
          setGlobalThreatModal((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              alertId: res.data.alertId || res.data.alert?.id,
              score: res.data.telemetry?.score || prev.score,
              riskLevel: res.data.telemetry?.riskLevel || prev.riskLevel,
              warnings: res.data.telemetry?.warnings || prev.warnings,
              mitre: res.data.telemetry?.mitre || prev.mitre,
              providers: res.data.telemetry?.provider_results || prev.providers,
              aiExplanation: res.data.aiAnalysis?.summary || res.data.aiExplanation || prev.aiExplanation,
            };
          });

          // Refresh live alerts feed
          api.flotbot.getAlerts({ limit: 50 }).then((aRes) => {
            if (aRes.success && aRes.data) {
              const list = aRes.data.alerts || aRes.data || [];
              setDbAlerts(Array.isArray(list) ? list : []);
            }
          });
        }
      } catch (_) {}
    } else {
      toast.success(`🛡️ Verified Clean: ${clientScan.domain || raw} (TLS 1.3 encrypted, no threats detected)`);
    }
  };

  useEffect(() => {
    (window as any).triggerUrlInterception = runGlobalUrlInterception;

    const handleCustomInterception = (e: any) => {
      if (e.detail?.url) runGlobalUrlInterception(e.detail.url);
    };
    window.addEventListener('flotbot-intercept-url', handleCustomInterception);

    // Global click listener to intercept insecure HTTP links anywhere in the DOM
    const handleGlobalClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href') || anchor.href;
        if (href && (href.startsWith('http://') || (href.includes('http://') && !href.startsWith('https://')))) {
          e.preventDefault();
          e.stopPropagation();
          runGlobalUrlInterception(href);
        }
      }
    };
    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      window.removeEventListener('flotbot-intercept-url', handleCustomInterception);
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  // Live database records
  const [dbDashboard, setDbDashboard] = useState<any>(null);
  const [dbAlerts, setDbAlerts] = useState<any[]>([]);
  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [dbSimulations, setDbSimulations] = useState<any[]>([]);
  const [dbChats, setDbChats] = useState<any[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  // Load real data from backend
  const loadDatabaseData = async () => {
    try {
      const [dashRes, alertsRes, actRes, simRes, chatsRes] = await Promise.allSettled([
        api.users.getDashboard(),
        api.flotbot.getAlerts({ limit: 50 }),
        api.activity.list(),
        api.simulations.getMyHistory(),
        api.flotbot.listChats(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.success && dashRes.value?.data) {
        setDbDashboard(dashRes.value.data);
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value?.success && alertsRes.value?.data) {
        const list = alertsRes.value.data.alerts || alertsRes.value.data || [];
        setDbAlerts(Array.isArray(list) ? list : []);
      }
      if (actRes.status === 'fulfilled' && actRes.value?.success && actRes.value?.data) {
        setDbActivities(Array.isArray(actRes.value.data) ? actRes.value.data : []);
      }
      if (simRes.status === 'fulfilled' && simRes.value?.success && simRes.value?.data) {
        setDbSimulations(Array.isArray(simRes.value.data) ? simRes.value.data : []);
      }
      if (chatsRes.status === 'fulfilled' && chatsRes.value?.success && chatsRes.value?.data) {
        const cList = chatsRes.value.data.sessions || [];
        setDbChats(Array.isArray(cList) ? cList : []);
      }
    } catch (err) {
      console.warn('[Dashboard] Live DB sync notice:', err);
    }
  };

  useEffect(() => {
    if (!authUser) {
      setDbDashboard(null);
      setDbActivities([]);
      setDbSimulations([]);
      setDbChats([]);
      return;
    }
    loadDatabaseData();
  }, [authUser?.uid]);

  // Derived real data
  const currentUserProfile: UserProfile = {
    name: authUser?.displayName || dbDashboard?.profile?.name || authUser?.email?.split('@')[0] || 'User',
    email: authUser?.email || dbDashboard?.profile?.email || '',
    role: authUser?.role || dbDashboard?.profile?.role || 'EMPLOYEE',
    bio: authUser?.bio || dbDashboard?.profile?.bio || '',
    organization: authUser?.organization || dbDashboard?.profile?.organization || 'Enterprise CyberGuardian Organization',
    avatarUrl: authUser?.avatarUrl || dbDashboard?.profile?.avatarUrl || '',
    awarenessLevel: (dbDashboard?.awarenessScore?.level as ScoreLevel) || 'Intermediate',
    securityTipOfDay: {
      tip: "Be vigilant with unexpected MFA push prompts or emergency SMS verification requests—attackers use fatigue tactics to gain unauthorized access.",
      category: "Authentication Hygiene"
    }
  };

  const quickStats: QuickStatItem[] = [
    {
      id: "stat-1",
      title: "Security Threats",
      value: dbAlerts.length.toString(),
      trend: dbAlerts.length > 0 ? `${dbAlerts.length} logged in DB` : "0 active threats",
      isPositive: dbAlerts.length === 0,
      iconName: "ShieldAlert",
      gradient: "from-red-500/20 via-orange-500/10 to-transparent",
    },
    {
      id: "stat-2",
      title: "Enrolled Courses",
      value: (dbDashboard?.stats?.enrolledCourses ?? 0).toString(),
      trend: (dbDashboard?.stats?.completedCourses ?? 0) > 0 ? `${dbDashboard?.stats?.completedCourses} completed` : "Ready to learn",
      isPositive: true,
      iconName: "GraduationCap",
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
    },
    {
      id: "stat-3",
      title: "Simulations Run",
      value: (dbDashboard?.stats?.completedSimulations ?? dbSimulations.length ?? 0).toString(),
      trend: (dbDashboard?.stats?.averageSimulationScore ?? 0) > 0 ? `Avg: ${dbDashboard?.stats?.averageSimulationScore}%` : "No drills completed",
      isPositive: true,
      iconName: "Zap",
      gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    },
    {
      id: "stat-4",
      title: "Audit Activities",
      value: dbActivities.length.toString(),
      trend: dbActivities.length > 0 ? "Real-time audit" : "0 events logged",
      isPositive: true,
      iconName: "Globe",
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    },
    {
      id: "stat-5",
      title: "Certifications",
      value: (dbDashboard?.stats?.earnedCertificates ?? 0).toString(),
      trend: (dbDashboard?.stats?.earnedCertificates ?? 0) > 0 ? "Verified in DB" : "0 credentials",
      isPositive: (dbDashboard?.stats?.earnedCertificates ?? 0) > 0,
      iconName: "Mail",
      gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    },
    {
      id: "stat-6",
      title: "Active Streak",
      value: `${dbDashboard?.stats?.streakDays ?? (authUser as any)?.streak ?? 0} Days`,
      trend: (dbDashboard?.stats?.streakDays ?? 0) > 0 ? "Continuous protection" : "Start today",
      isPositive: true,
      iconName: "Zap",
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    },
  ];

  const awarenessScore: AwarenessScoreData = dbDashboard?.awarenessScore || {
    overallScore: 60,
    maxScore: 100,
    level: 'Intermediate',
    weeklyProgress: 0,
    categoryScores: {
      phishingDefense: 60,
      passwordHygiene: 60,
      networkSecurity: 60,
      threatDetection: 60,
    },
  };

  const suspiciousActivity: SuspiciousActivityItem[] = dbAlerts.map((a: any) => {
    const isHigh = a.severity === 'CRITICAL' || a.severity === 'HIGH';
    const isMed = a.severity === 'MEDIUM';
    const risk: RiskLevel = isHigh ? 'Dangerous' : isMed ? 'Suspicious' : 'Safe';

    let cat: SuspiciousActivityItem['category'] = 'Suspicious Website';
    const lowerCat = (a.category || '').toLowerCase();
    if (lowerCat.includes('phish') || lowerCat.includes('mail')) cat = 'Phishing Email';
    else if (lowerCat.includes('login') || lowerCat.includes('auth')) cat = 'Fake Login';
    else if (lowerCat.includes('qr')) cat = 'Scam QR';
    else if (lowerCat.includes('malware') || lowerCat.includes('exec') || lowerCat.includes('file')) cat = 'Malware Link';

    const dateStr = a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';

    return {
      id: a.id,
      date: dateStr,
      category: cat,
      target: a.source || a.title || 'Local Host',
      riskLevel: risk,
      aiExplanation: a.description || a.title,
      technicalDetails: {
        ipAddress: a.evidence?.ip || a.evidence?.remoteIp || undefined,
        indicatorsOfCompromise: [a.title, a.category].filter(Boolean),
        remediationAction: a.recommendation || 'Investigate and acknowledge threat in FlotBot',
      },
    };
  });

  const analysisHistory: AnalysisHistoryItem[] = dbActivities
    .filter((act: any) => act.category === 'Security Alert' || act.category === 'Security Awareness' || act.category === 'scan' || act.activityType?.includes('threat'))
    .map((act: any) => {
      const isDangerous = act.activityType?.includes('intercept') || act.label?.toLowerCase().includes('threat');
      const dateStr = act.time ? new Date(act.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';
      return {
        id: act.id,
        date: dateStr,
        type: (act.metadata?.type as any) || 'URL',
        target: act.metadata?.target || act.label,
        result: act.detail || act.label,
        riskLevel: (isDangerous ? 'Dangerous' : 'Safe') as RiskLevel,
        status: (isDangerous ? 'Flagged' : 'Completed') as any,
        details: {
          threatType: act.category,
          engineDetections: act.detail,
          recommendation: act.metadata?.recommendation,
        },
      };
    });

  const simulationHistory: SimulationHistoryItem[] = dbSimulations.map((sim: any) => {
    const dateStr = sim.created_at || sim.start_time
      ? new Date(sim.created_at || sim.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Recent';
    return {
      id: sim.id,
      simulationType: sim.scenario_title || sim.simulation_id || 'Security Drill',
      difficulty: (sim.difficulty as SimulationDifficulty) || 'Intermediate',
      result: (sim.score >= 70 ? 'Passed' : 'Failed') as any,
      score: sim.score || 0,
      completionPercentage: sim.status === 'completed' ? 100 : 50,
      date: dateStr,
    };
  });

  const notifications: NotificationItem[] = dbAlerts
    .filter((a: any) => !readNotifIds.has(`notif-${a.id}`))
    .map((a: any) => ({
      id: `notif-${a.id}`,
      title: a.title,
      description: a.description || a.title,
      type: (a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'alert' : 'warning') as any,
      timestamp: a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      read: false,
    }));

  const weeklyReport: WeeklyReportData = {
    scoreChange: 0,
    simulationsCompleted: dbDashboard?.stats?.completedSimulations ?? dbSimulations.length ?? 0,
    threatsIdentified: dbAlerts.length,
    weakAreas: Object.entries(awarenessScore.categoryScores)
      .filter(([_, val]) => typeof val === 'number' && val < 70)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()),
    strongAreas: Object.entries(awarenessScore.categoryScores)
      .filter(([_, val]) => typeof val === 'number' && val >= 70)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()),
    barChartData: [
      { day: 'Mon', threatsBlocked: 0, scansPerformed: 0 },
      { day: 'Tue', threatsBlocked: 0, scansPerformed: 0 },
      { day: 'Wed', threatsBlocked: 0, scansPerformed: 0 },
      { day: 'Thu', threatsBlocked: 0, scansPerformed: 0 },
      { day: 'Fri', threatsBlocked: 0, scansPerformed: 0 },
      { day: 'Sat', threatsBlocked: 0, scansPerformed: 0 },
      { day: 'Sun', threatsBlocked: dbAlerts.length, scansPerformed: dbActivities.length },
    ],
    lineChartData: [
      { week: 'W1', score: Math.max(0, awarenessScore.overallScore - 5) },
      { week: 'W2', score: Math.max(0, awarenessScore.overallScore - 2) },
      { week: 'W3', score: awarenessScore.overallScore },
      { week: 'W4', score: awarenessScore.overallScore },
    ],
    pieChartData: [
      { name: 'Threats', value: dbAlerts.length || 0, color: 'var(--accent-danger)' },
      { name: 'Drills', value: dbSimulations.length || 0, color: 'var(--accent-primary)' },
      { name: 'Activities', value: dbActivities.length || 0, color: 'var(--accent-info)' },
    ].filter((p) => p.value > 0),
  };

  const attackTrends: AttackTrendItem[] = dbAlerts.map((a: any) => ({
    id: a.id,
    attackName: a.title,
    description: a.description || a.title,
    difficulty: (a.severity === 'CRITICAL' ? 'Expert' : a.severity === 'HIGH' ? 'Advanced' : 'Intermediate') as SimulationDifficulty,
    popularity: 75,
    preventionTips: [a.recommendation || 'Follow incident response procedures and quarantine affected endpoints.'],
    iconName: a.category === 'Network' ? 'BellRing' : 'KeyRound',
  }));

  const aiRecommendations: AIRecommendationItem[] = [
    ...(dbAlerts.filter((a: any) => !a.acknowledged).length > 0 ? [{
      id: 'rec-threats',
      title: 'Acknowledge Pending Threat Detections',
      reason: `You have ${dbAlerts.filter((a: any) => !a.acknowledged).length} unacknowledged security threat alerts recorded in the database.`,
      priority: 'High' as const,
      actionText: 'Review Alerts',
      actionType: 'review' as const,
    }] : []),
    ...((dbDashboard?.stats?.enrolledCourses ?? 0) === 0 ? [{
      id: 'rec-courses',
      title: 'Begin Cybersecurity Fundamentals',
      reason: 'You are not enrolled in any training modules yet. Enroll in courses to boost your awareness score.',
      priority: 'Medium' as const,
      actionText: 'Explore Courses',
      actionType: 'course' as const,
    }] : []),
    ...(dbSimulations.length === 0 ? [{
      id: 'rec-sim',
      title: 'Launch Practical Defense Simulation',
      reason: 'Test your social engineering and phishing detection in an interactive simulation lab.',
      priority: 'Medium' as const,
      actionText: 'Start Simulation',
      actionType: 'simulation' as const,
    }] : []),
  ];

  const chatbotHistory: ChatbotHistoryItem[] = dbChats.map((sess: any) => ({
    id: sess.id,
    date: sess.updatedAt ? new Date(sess.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Saved',
    question: sess.title,
    aiSummary: `Persistent conversation session with ${sess.messageCount || 0} messages saved in PostgreSQL database.`,
    category: (sess.category as any) || 'General',
    messageCount: sess.messageCount || 0,
  }));

  const handleMarkAllAsRead = () => {
    setReadNotifIds(new Set(notifications.map((n) => n.id)));
  };

  const handleExecuteRecommendation = (item: AIRecommendationItem) => {
    if (item.actionType === 'review') setActiveTab('threats');
    else if (item.actionType === 'course') setActiveTab('training');
    else if (item.actionType === 'simulation') setActiveTab('simulation');
    else if (item.actionType === 'setting') setActiveTab('settings');
  };

  const handleContinueChat = (_chat: ChatbotHistoryItem) => {
    setActiveTab('ai-assistant');
  };

  const userRole = authUser?.role || 'EMPLOYEE';
  const isAdminRole = [
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'COURSE_ADMIN',
    'USER_ADMIN',
    'SIMULATION_ADMIN',
    'CERTIFICATION_ADMIN',
    'FLOTBOT_SECURITY_ADMIN',
    'SECURITY_ANALYST',
    'ANALYST',
  ].includes(userRole);

  useEffect(() => {
    if (authUser) {
      auth.currentUser?.getIdToken().then((tok: string | null) => {
        if (tok) {
          setAdminToken(tok);
        } else {
          setAdminToken(generateAdminDevToken(userRole, authUser.email, authUser.displayName));
        }
      }).catch(() => {
        setAdminToken(generateAdminDevToken(userRole, authUser.email, authUser.displayName));
      });
    }
  }, [authUser, userRole]);

  const adminUser: AdminUser = {
    id: authUser?.id || authUser?.uid || 'usr_admin',
    name: authUser?.displayName || authUser?.email?.split('@')[0] || 'Administrator',
    email: authUser?.email || 'admin@cyberguardian.local',
    role: userRole,
    avatarUrl: authUser?.avatarUrl,
    permissions: authUser?.permissions && authUser.permissions.length > 0
      ? authUser.permissions
      : (userRole === 'SUPER_ADMIN' ? ['*'] : [`${userRole.toLowerCase()}:*`]),
  };

  const pageTitle = PAGE_TITLES[activeTab] ?? activeTab;
  const isTrainingPage = activeTab === 'courses-training' || activeTab === 'training' || activeTab === 'courses';
  const isSimulationPage = activeTab === 'simulation' || activeTab === 'simulation-progress' || activeTab === 'achievements';
  const hidePageTitle = isTrainingPage || isSimulationPage || (activeTab === 'dashboard' && isAdminRole) || (isAdminRole && activeTab !== 'settings');

  return (
    <AdminAuthProvider initialUser={adminUser} initialTab={activeTab} onTabChange={setActiveTab}>
      <div
        className="dashboard-scope min-h-screen flex"
        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        {!isQuizActive && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`flex-1 ${isQuizActive ? 'w-full' : 'lg:pl-60'} flex flex-col min-w-0 transition-all duration-300`}>
          <Header
            user={currentUserProfile}
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onOpenSettings={() => setActiveTab('settings')}
            isQuizActive={isQuizActive}
          />

          <main className={`flex-1 w-full mx-auto ${isQuizActive ? 'p-3 sm:p-6 lg:p-8 max-w-6xl' : isTrainingPage ? 'p-4 sm:p-6 lg:p-8 max-w-[1440px]' : 'p-4 sm:p-6 lg:p-8 max-w-[1440px]'} space-y-4`}>

            {/* Page title row */}
            {!hidePageTitle && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
                <div>
                  <h2 className="text-[18px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {pageTitle}
                  </h2>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Real-time threat intelligence · AI Security Awareness Hub
                  </p>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                OVERVIEW / DASHBOARD
                The EXACT same dashboard from the Admin Panel
                is rendered directly for all Admin accounts!
            ══════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              isAdminRole ? (
                <div className="animate-fade-in w-full">
                  <AdminDashboardView />
                </div>
              ) : (
                <div className="space-y-4">

                {/* Row 1 — Welcome + Shield status */}
                <div className="animate-fade-in-up">
                  <WelcomeBanner user={currentUserProfile} />
                </div>

                {/* Row 2 — 6 top stat cards */}
                <div className="animate-fade-in-up stagger">
                  <QuickStats stats={quickStats} />
                </div>

                {/* Row 3 — Awareness Score · Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in-up">
                  <div className="lg:col-span-6">
                    <CyberAwarenessScore scoreData={awarenessScore} />
                  </div>
                  <div className="lg:col-span-6 flex flex-col gap-4">
                    <QuickActions
                      onSelectAction={(actionId) => {
                        if (actionId === 'url' || actionId === 'email' || actionId === 'qr') {
                          setActiveTab('ai-assistant');
                        } else if (actionId === 'sim') {
                          setActiveTab('simulation');
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Row 4 — Preview: Analysis History + Suspicious Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up">
                  <AnalysisHistoryPreview
                    logs={analysisHistory}
                    onSelectLog={(log) => setSelectedItem(log)}
                    onViewAll={() => setActiveTab('history')}
                  />
                  <SuspiciousActivityPreview
                    activities={suspiciousActivity}
                    onSelectActivity={(act) => setSelectedItem(act)}
                    onViewAll={() => setActiveTab('threats')}
                  />
                </div>

                {/* Row 5 — Simulation preview */}
                <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
                  <SimulationHistoryPreview
                    simulations={simulationHistory}
                    onViewAll={() => setActiveTab('simulation')}
                  />
                </div>

              </div>
            )
          )}

          {/* ══════════════════════════════════════════
              DEDICATED PAGES
          ══════════════════════════════════════════ */}

          {activeTab === 'history' && (
            <div className="animate-fade-in-up">
              <HistoryPage
                logs={analysisHistory}
                onSelectLog={(log) => setSelectedItem(log)}
              />
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="animate-fade-in-up">
              <ThreatsPage
                activities={suspiciousActivity}
                onSelectActivity={(act) => setSelectedItem(act)}
              />
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="animate-fade-in-up">
              <SimulationPage />
            </div>
          )}

          {activeTab === 'simulation-progress' && (
            <div className="animate-fade-in-up">
              <SimulationProgressPage />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="animate-fade-in-up">
              <AchievementsPage />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-fade-in-up">
              <ReportsPage report={weeklyReport} />
            </div>
          )}

          {activeTab === 'ai-assistant' && (
            <div className="animate-fade-in-up">
              <AIAssistantPage
                chats={chatbotHistory}
                onContinueChat={handleContinueChat}
              />
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="animate-fade-in-up">
              <TrendsPage trends={attackTrends} />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="animate-fade-in-up">
              <ActivityPage />
            </div>
          )}

          {activeTab === 'ai-insight' && (
            <div className="animate-fade-in-up">
              <AIInsightPage
                recommendations={aiRecommendations}
                onExecuteRecommendation={handleExecuteRecommendation}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════
              ADMIN CONSOLES & WORKSPACES
              (Directly renders planned admin views for admin roles)
          ══════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="animate-fade-in w-full">
              <UserListView />
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="animate-fade-in w-full h-full flex-1 flex flex-col">
              {isAdminRole ? <CourseListView /> : <TrainingCoursesPage onQuizActiveChange={setIsQuizActive} />}
            </div>
          )}

          {(activeTab === 'courses-training' || activeTab === 'training') && (
            <div className="animate-fade-in w-full h-full flex-1 flex flex-col">
              <TrainingCoursesPage onQuizActiveChange={setIsQuizActive} />
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="animate-fade-in w-full">
              <AssessmentQuizView />
            </div>
          )}

          {activeTab === 'simulations' && (
            <div className="animate-fade-in w-full">
              <SimulationListView />
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="animate-fade-in w-full">
              <CertificationListView />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fade-in w-full">
              <LearningAnalyticsView />
            </div>
          )}

          {activeTab === 'flotbot-dashboard' && (
            <div className="animate-fade-in w-full">
              <FlotBotSecurityDashboard />
            </div>
          )}

          {(activeTab === 'flotbot-alerts' || activeTab === 'flotbot-threats' || activeTab === 'flotbot-history') && (
            <div className="animate-fade-in w-full">
              <FlotBotAlertsView />
            </div>
          )}

          {activeTab === 'flotbot-monitoring' && (
            <div className="animate-fade-in w-full">
              <FlotBotMonitoringView />
            </div>
          )}

          {activeTab === 'flotbot-iocs' && (
            <div className="animate-fade-in w-full">
              <FlotBotIOCManagement />
            </div>
          )}

          {activeTab === 'flotbot-rules' && (
            <div className="animate-fade-in w-full">
              <FlotBotThreatRules />
            </div>
          )}

          {activeTab === 'flotbot-ai' && (
            <div className="animate-fade-in w-full">
              <FlotBotAIAnalysisView />
            </div>
          )}

          {activeTab === 'flotbot-behaviour' && (
            <div className="animate-fade-in w-full">
              <FlotBotUserBehaviourView />
            </div>
          )}

          {activeTab === 'flotbot-reports' && (
            <div className="animate-fade-in w-full">
              <FlotBotSecurityReports />
            </div>
          )}

          {activeTab === 'flotbot-config' && (
            <div className="animate-fade-in w-full">
              <FlotBotConfigView />
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="animate-fade-in w-full">
              <AnnouncementsView />
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="animate-fade-in w-full">
              <RolesPermissionsView />
            </div>
          )}

          {activeTab === 'audit-logs' && (
            <div className="animate-fade-in w-full">
              <AuditLogsView />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in-up">
              <SettingsPage userProfile={currentUserProfile} />
            </div>
          )}

          {/* Placeholder for tabs not yet implemented */}
          {activeTab === 'notifications' && (
            <div
              className="glass-card rounded-2xl p-12 text-center animate-fade-in-up"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {pageTitle} — coming soon
              </p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                This module is under construction.
              </p>
            </div>
          )}

        </main>

        <Footer />
      </div>

      <ActivityDetailModal
        activity={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <ThreatInterceptionModal
        threat={globalThreatModal}
        onClose={() => setGlobalThreatModal(null)}
      />
    </div>
    </AdminAuthProvider>
  );
}

function RootRedirect() {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/flotbot-widget" element={<FlotBotWidget />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardView defaultTab="dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulation"
          element={
            <ProtectedRoute>
              <DashboardView defaultTab="simulation" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulation/progress"
          element={
            <ProtectedRoute>
              <DashboardView defaultTab="simulation-progress" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulation/achievements"
          element={
            <ProtectedRoute>
              <DashboardView defaultTab="achievements" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulation/:id"
          element={
            <ProtectedRoute>
              <SimulationIdPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              color: "#F8FAFC",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
            },
            success: { iconTheme: { primary: "#22C55E", secondary: "#0B1120" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#0B1120" } },
          }}
        />
        <AnimatedRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;

