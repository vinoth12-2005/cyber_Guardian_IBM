import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';

// View Imports
import { AdminDashboardView } from './components/dashboard/AdminDashboardView';
import { UserListView } from './components/users/UserListView';
import { CourseListView } from './components/courses/CourseListView';
import { SimulationListView } from './components/simulations/SimulationListView';
import { CertificationListView } from './components/certifications/CertificationListView';
import { AssessmentQuizView } from './components/assessments/AssessmentQuizView';
import { LearningAnalyticsView } from './components/analytics/LearningAnalyticsView';

// FlotBot Security Views
import { FlotBotSecurityDashboard } from './components/flotbot/FlotBotSecurityDashboard';
import { FlotBotAlertsView } from './components/flotbot/FlotBotAlertsView';
import { FlotBotMonitoringView } from './components/flotbot/FlotBotMonitoringView';
import { FlotBotIOCManagement } from './components/flotbot/FlotBotIOCManagement';
import { FlotBotThreatRules } from './components/flotbot/FlotBotThreatRules';
import { FlotBotAIAnalysisView } from './components/flotbot/FlotBotAIAnalysisView';
import { FlotBotUserBehaviourView } from './components/flotbot/FlotBotUserBehaviourView';
import { FlotBotSecurityReports } from './components/flotbot/FlotBotSecurityReports';
import { FlotBotConfigView } from './components/flotbot/FlotBotConfigView';

// System Views
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { RolesPermissionsView } from './components/roles/RolesPermissionsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { AdminSettingsView } from './components/settings/AdminSettingsView';

import { useAdminAuth, TAB_ROLE_PERMISSIONS, ROLE_DEFAULT_TAB } from './context/AdminAuthContext';
import { ShieldAlert } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export const App: React.FC = () => {
  const { user, activeTab, setActiveTab } = useAdminAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const userRole = user?.role || 'SUPER_ADMIN';
  const allowedRoles = TAB_ROLE_PERMISSIONS[activeTab];
  const isAuthorized = userRole === 'SUPER_ADMIN' || !allowedRoles || allowedRoles.includes(userRole);

  const renderActiveView = () => {
    if (!isAuthorized) {
      return (
        <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-8 text-center space-y-4 max-w-md mx-auto my-16 shadow-2xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">403 Insufficient Privileges</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Your active role (<strong className="text-indigo-300 font-mono">{userRole}</strong>) does not have administrative access to the <strong className="text-slate-200 uppercase font-mono">{activeTab}</strong> console.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab(ROLE_DEFAULT_TAB[userRole] || 'dashboard')}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-indigo-600/20"
            >
              Go to Authorized Workspace ({ROLE_DEFAULT_TAB[userRole] || 'dashboard'})
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardView key={refreshKey} />;
      case 'users':
        return <UserListView key={refreshKey} />;
      case 'courses':
        return <CourseListView key={refreshKey} />;
      case 'simulations':
        return <SimulationListView key={refreshKey} />;
      case 'certifications':
        return <CertificationListView key={refreshKey} />;
      case 'assessments':
        return <AssessmentQuizView key={refreshKey} />;
      case 'analytics':
        return <LearningAnalyticsView key={refreshKey} />;
      case 'flotbot-dashboard':
        return <FlotBotSecurityDashboard key={refreshKey} />;
      case 'flotbot-alerts':
      case 'flotbot-threats':
      case 'flotbot-history':
        return <FlotBotAlertsView key={refreshKey} />;
      case 'flotbot-monitoring':
        return <FlotBotMonitoringView key={refreshKey} />;
      case 'flotbot-iocs':
        return <FlotBotIOCManagement key={refreshKey} />;
      case 'flotbot-rules':
        return <FlotBotThreatRules key={refreshKey} />;
      case 'flotbot-config':
        return <FlotBotConfigView key={refreshKey} />;
      case 'flotbot-ai':
        return <FlotBotAIAnalysisView key={refreshKey} />;
      case 'flotbot-behaviour':
        return <FlotBotUserBehaviourView key={refreshKey} />;
      case 'flotbot-reports':
        return <FlotBotSecurityReports key={refreshKey} />;
      case 'announcements':
        return <AnnouncementsView key={refreshKey} />;
      case 'roles':
        return <RolesPermissionsView key={refreshKey} />;
      case 'audit-logs':
        return <AuditLogsView key={refreshKey} />;
      case 'settings':
        return <AdminSettingsView key={refreshKey} />;
      default:
        return <AdminDashboardView key={refreshKey} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #1e293b',
            fontSize: '12px',
          },
        }}
      />

      {/* Unified Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onRefresh={handleRefresh} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
