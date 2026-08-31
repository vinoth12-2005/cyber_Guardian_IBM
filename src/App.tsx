import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

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

import {
  mockUserProfile,
  mockAwarenessScore,
  mockQuickStats,
  mockAnalysisHistory,
  mockSuspiciousActivity,
  mockChatbotHistory,
  mockSimulationHistory,
  mockWeeklyReport,
  mockAttackTrends,
  mockAIRecommendations,
  mockNotifications,
} from './data/mockData';

import type {
  SuspiciousActivityItem,
  AnalysisHistoryItem,
  ChatbotHistoryItem,
  AIRecommendationItem,
  NotificationItem,
} from './types/dashboard';

// Map tab IDs to human-readable page titles
const PAGE_TITLES: Record<string, string> = {
  dashboard:          'Security Command Center',
  'courses-training': 'Courses & Training',
  training:           'Courses & Training',
  courses:            'Courses & Training',
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
  
  // Sync tab if navigated via URL
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const [selectedItem, setSelectedItem] = useState<
    SuspiciousActivityItem | AnalysisHistoryItem | null
  >(null);

  const currentUserProfile = {
    ...mockUserProfile,
    name: authUser?.displayName || authUser?.email?.split('@')[0] || mockUserProfile.name,
    email: authUser?.email || mockUserProfile.email,
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleExecuteRecommendation = (item: AIRecommendationItem) => {
    alert(`Initiating Action: ${item.actionText}\nType: ${item.actionType.toUpperCase()}`);
  };

  const handleContinueChat = (chat: ChatbotHistoryItem) => {
    alert(`Opening AI Security Chat Session: "${chat.question}"`);
  };

  const pageTitle = PAGE_TITLES[activeTab] ?? activeTab;
  const isTrainingPage = activeTab === 'courses-training' || activeTab === 'training' || activeTab === 'courses';
  const isSimulationPage = activeTab === 'simulation' || activeTab === 'simulation-progress' || activeTab === 'achievements';
  const hidePageTitle = isTrainingPage || isSimulationPage;

  return (
    <div
      className="dashboard-scope min-h-screen flex"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        <Header
          user={currentUserProfile}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllAsRead}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setActiveTab('settings')}
        />

        <main className={`flex-1 w-full mx-auto ${isTrainingPage ? 'p-4 sm:p-6 lg:p-8 max-w-[1440px] space-y-4' : 'p-4 sm:p-6 lg:p-8 max-w-[1440px] space-y-4'}`}>

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
              Only what the user needs at a glance.
          ══════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">

              {/* Row 1 — Welcome + Shield status */}
              <div className="animate-fade-in-up">
                <WelcomeBanner user={currentUserProfile} />
              </div>

              {/* Row 2 — 6 top stat cards */}
              <div className="animate-fade-in-up stagger">
                <QuickStats stats={mockQuickStats} />
              </div>

              {/* Row 3 — Awareness Score · Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in-up">
                <div className="lg:col-span-6">
                  <CyberAwarenessScore scoreData={mockAwarenessScore} />
                </div>
                <div className="lg:col-span-6 flex flex-col gap-4">
                  <QuickActions />
                </div>
              </div>

              {/* Row 4 — Preview: Analysis History + Suspicious Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up">
                <AnalysisHistoryPreview
                  logs={mockAnalysisHistory}
                  onSelectLog={(log) => setSelectedItem(log)}
                  onViewAll={() => setActiveTab('history')}
                />
                <SuspiciousActivityPreview
                  activities={mockSuspiciousActivity}
                  onSelectActivity={(act) => setSelectedItem(act)}
                  onViewAll={() => setActiveTab('threats')}
                />
              </div>

              {/* Row 5 — Simulation preview */}
              <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
                <SimulationHistoryPreview
                  simulations={mockSimulationHistory}
                  onViewAll={() => setActiveTab('simulation')}
                />
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════
              DEDICATED PAGES
          ══════════════════════════════════════════ */}

          {activeTab === 'history' && (
            <div className="animate-fade-in-up">
              <HistoryPage
                logs={mockAnalysisHistory}
                onSelectLog={(log) => setSelectedItem(log)}
              />
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="animate-fade-in-up">
              <ThreatsPage
                activities={mockSuspiciousActivity}
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
              <ReportsPage report={mockWeeklyReport} />
            </div>
          )}

          {activeTab === 'ai-assistant' && (
            <div className="animate-fade-in-up">
              <AIAssistantPage
                chats={mockChatbotHistory}
                onContinueChat={handleContinueChat}
              />
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="animate-fade-in-up">
              <TrendsPage trends={mockAttackTrends} />
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
                recommendations={mockAIRecommendations}
                onExecuteRecommendation={handleExecuteRecommendation}
              />
            </div>
          )}

          {(activeTab === 'courses-training' || activeTab === 'training' || activeTab === 'courses') && (
            <div className="animate-fade-in w-full h-full flex-1 flex flex-col">
              <TrainingCoursesPage />
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
    </div>
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

