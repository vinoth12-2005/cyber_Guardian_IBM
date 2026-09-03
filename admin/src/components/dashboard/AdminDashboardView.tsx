import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { RefreshCw } from 'lucide-react';

// Specialized Role Dashboards
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { PlatformAdminDashboard } from './PlatformAdminDashboard';
import { UserAdminDashboard } from './UserAdminDashboard';
import { CourseAdminDashboard } from './CourseAdminDashboard';
import { SimulationAdminDashboard } from './SimulationAdminDashboard';
import { CertificationAdminDashboard } from './CertificationAdminDashboard';
import { FlotBotAdminDashboard } from './FlotBotAdminDashboard';
import { SecurityAnalystDashboard } from './SecurityAnalystDashboard';
import { AnalystDashboard } from './AnalystDashboard';

export const AdminDashboardView: React.FC = () => {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, alertsRes, usersRes, coursesRes, simsRes] = await Promise.all([
        adminApi.stats.getOverview().catch(() => ({ success: false, data: null })),
        adminApi.flotbot.getAlerts({ limit: 12 }).catch(() => ({ success: false, data: null })),
        adminApi.users.list({ limit: 10 }).catch(() => ({ success: false, data: null })),
        adminApi.courses.list({ includeDrafts: true }).catch(() => ({ success: false, data: null })),
        adminApi.simulations.list().catch(() => ({ success: false, data: null })),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (alertsRes.success && alertsRes.data) setRecentAlerts(alertsRes.data.alerts || []);
      if (usersRes.success && usersRes.data) setRecentUsers(usersRes.data.users || []);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data || []);
      if (simsRes.success && simsRes.data) setSimulations(simsRes.data || []);
    } catch (e) {
      console.error('[AdminDashboard] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh live telemetry every 12 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const role = user?.role || 'SUPER_ADMIN';

  if (loading && !stats && courses.length === 0) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Loading {role} Telemetry Console...</p>
      </div>
    );
  }

  // Render Role-Tailored Visual Dashboard
  switch (role) {
    case 'SUPER_ADMIN':
      return (
        <SuperAdminDashboard
          stats={stats}
          courses={courses}
          simulations={simulations}
          users={recentUsers}
          alerts={recentAlerts}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    case 'PLATFORM_ADMIN':
      return (
        <PlatformAdminDashboard
          stats={stats}
          courses={courses}
          simulations={simulations}
          users={recentUsers}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    case 'USER_ADMIN':
      return (
        <UserAdminDashboard
          stats={stats}
          users={recentUsers}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    case 'COURSE_ADMIN':
      return (
        <CourseAdminDashboard
          stats={stats}
          courses={courses}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    case 'SIMULATION_ADMIN':
      return (
        <SimulationAdminDashboard
          stats={stats}
          simulations={simulations}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    case 'CERTIFICATION_ADMIN':
      return (
        <CertificationAdminDashboard
          stats={stats}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    case 'FLOTBOT_SECURITY_ADMIN':
      return (
        <FlotBotAdminDashboard
          stats={stats}
          alerts={recentAlerts}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    case 'SECURITY_ANALYST':
      return (
        <SecurityAnalystDashboard
          stats={stats}
          alerts={recentAlerts}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    case 'ANALYST':
      return (
        <AnalystDashboard
          stats={stats}
          courses={courses}
          simulations={simulations}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );

    default:
      return (
        <SuperAdminDashboard
          stats={stats}
          courses={courses}
          simulations={simulations}
          users={recentUsers}
          alerts={recentAlerts}
          loading={loading}
          onRefresh={fetchDashboardData}
        />
      );
  }
};
