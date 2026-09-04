import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { auth } from '../../lib/firebase';
import toast from 'react-hot-toast';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  BookOpen,
  Gamepad2,
  Users,
  Award,
  Sparkles,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  Ban,
  Activity,
  UserCheck,
  UserX,
  FileText,
  Sliders,
  Layers,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  Search,
} from 'lucide-react';

// Awareness sub-widgets for personal training view
import { WelcomeBanner } from './WelcomeBanner';
import { QuickStats } from './QuickStats';
import { CyberAwarenessScore } from './CyberAwarenessScore';
import { QuickActions } from './QuickActions';
import { AnalysisHistoryPreview } from './AnalysisHistoryPreview';
import { SuspiciousActivityPreview } from './SuspiciousActivityPreview';
import { SimulationHistoryPreview } from './SimulationHistoryPreview';

import type {
  UserProfile,
  QuickStatItem,
  AwarenessScoreData,
  SuspiciousActivityItem,
  AnalysisHistoryItem,
  SimulationHistoryItem,
} from '../../types/dashboard';

interface RoleAdminDashboardProps {
  user: UserProfile;
  quickStats: QuickStatItem[];
  awarenessScore: AwarenessScoreData;
  suspiciousActivity: SuspiciousActivityItem[];
  analysisHistory: AnalysisHistoryItem[];
  simulationHistory: SimulationHistoryItem[];
  onNavigateTab: (tabId: string) => void;
  onRefreshData?: () => void;
}

export const RoleAdminDashboard: React.FC<RoleAdminDashboardProps> = ({
  user,
  quickStats,
  awarenessScore,
  suspiciousActivity,
  analysisHistory,
  simulationHistory,
  onNavigateTab,
  onRefreshData,
}) => {
  const { user: authUser } = useAuth();
  const [viewMode, setViewMode] = useState<'admin' | 'awareness'>('admin');

  // Live administrative telemetry
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [certList, setCertList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const role = authUser?.role || 'SUPER_ADMIN';

  const fetchAdminTelemetry = async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes, simsRes, alertsRes] = await Promise.all([
        api.admin.getStats().catch(() => ({ success: false, data: null })),
        api.courses.list({ includeDrafts: true }).catch(() => ({ success: false, data: null })),
        api.simulations.list().catch(() => ({ success: false, data: null })),
        api.flotbot.getAlerts({ limit: 12 }).catch(() => ({ success: false, data: null })),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data || []);
      if (simsRes.success && simsRes.data) setSimulations(simsRes.data || []);
      if (alertsRes.success && alertsRes.data) {
        setAlerts(alertsRes.data.alerts || alertsRes.data || []);
      }

      // Role-conditional data
      if (role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN' || role === 'USER_ADMIN') {
        const usersRes = await api.admin.listUsers({ limit: 8 }).catch(() => ({ success: false, data: null }));
        if (usersRes.success && usersRes.data) {
          setUserList(usersRes.data.users || usersRes.data || []);
        }
      }

      if (role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN' || role === 'CERTIFICATION_ADMIN') {
        const certsRes = await api.admin.listCertificates({ limit: 8 }).catch(() => ({ success: false, data: null }));
        if (certsRes.success && certsRes.data) {
          setCertList(certsRes.data.certificates || certsRes.data || []);
        }
      }
    } catch (e) {
      console.warn('[RoleAdminDashboard] Telemetry fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminTelemetry();
  }, [role]);

  // SSO Link to Enterprise Admin Console on :5174
  const handleLaunchAdminCenter = async () => {
    try {
      const currentUser = auth.currentUser;
      const token = currentUser ? await currentUser.getIdToken() : '';
      const qs = new URLSearchParams();
      if (token) qs.set('token', token);
      if (authUser?.role) qs.set('role', authUser.role);
      if (authUser?.email) qs.set('email', authUser.email);
      if (authUser?.displayName) qs.set('name', authUser.displayName);

      const targetUrl = `http://localhost:5174${qs.toString() ? `?${qs.toString()}` : ''}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      window.open('http://localhost:5174', '_blank', 'noopener,noreferrer');
    }
  };

  // 1-Click Course Publish
  const handlePublishCourse = async (courseId: string) => {
    setActionLoadingId(courseId);
    try {
      const res = await api.admin.publishCourse(courseId);
      if (res.success) {
        toast.success('Course published live to all students!');
        fetchAdminTelemetry();
      } else {
        toast.error(res.error?.message || 'Failed to publish course');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error publishing course');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 1-Click Alert Acknowledge
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.flotbot.acknowledgeAlert(alertId);
      toast.success('Alert marked as under investigation');
      fetchAdminTelemetry();
    } catch (err: any) {
      toast.error(err.message || 'Failed to acknowledge alert');
    }
  };

  // 1-Click Alert Resolve
  const handleResolveAlert = async (alertId: string) => {
    const notes = prompt('Enter investigation notes and resolution rationale:');
    if (!notes || !notes.trim()) return;

    try {
      await api.flotbot.resolveAlert(alertId, notes.trim());
      toast.success('Security alert resolved with forensic trail');
      fetchAdminTelemetry();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve alert');
    }
  };

  // 1-Click User Status Toggle
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.admin.updateUserStatus(userId, nextStatus);
      toast.success(`User status updated to ${nextStatus}`);
      fetchAdminTelemetry();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  // 1-Click Certificate Revoke
  const handleRevokeCertificate = async (credId: string) => {
    const reason = prompt('Specify security reason for certificate revocation:');
    if (!reason || !reason.trim()) return;

    try {
      await api.admin.revokeCertificate(credId, reason.trim());
      toast.success('Credential revoked and logged in audit log');
      fetchAdminTelemetry();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke certificate');
    }
  };

  // Calculations for Course Admin
  const draftCourses = courses.filter((c) => c.status === 'draft');
  const publishedCourses = courses.filter((c) => c.status !== 'draft');
  const totalLessons = courses.reduce(
    (acc, c) => acc + (c.modules || []).reduce((mAcc: number, m: any) => mAcc + (m.lessons || []).length, 0),
    0
  );
  const totalQuizzes = courses.filter((c) => c.quiz && c.quiz.length > 0).length;

  // Calculations for Security Analyst
  const pendingAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED');
  const criticalAlerts = pendingAlerts.filter((a) => a.severity === 'CRITICAL');
  const highAlerts = pendingAlerts.filter((a) => a.severity === 'HIGH');

  // Friendly title & badge for each admin role
  const roleDisplayMap: { [key: string]: { title: string; subtitle: string; badge: string; color: string } } = {
    COURSE_ADMIN: {
      title: 'Curriculum Studio & Assessment Center',
      subtitle: 'Author interactive courses, proctored quizzes, 3D threat flashcards, and AI PDF curriculum ingestion.',
      badge: 'COURSE_ADMIN · CURRICULUM LEAD',
      color: 'from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border-cyan-500/40 text-cyan-300',
    },
    SECURITY_ANALYST: {
      title: 'Security Operations Center (SOC) Telemetry',
      subtitle: 'Real-time host intrusion triage, FlotBot telemetry streams, IOC analysis, and incident remediation.',
      badge: 'SECURITY_ANALYST · SOC LEAD',
      color: 'from-rose-500/20 via-orange-500/10 to-amber-500/20 border-rose-500/40 text-rose-300',
    },
    SIMULATION_ADMIN: {
      title: 'Cyber Range & Simulation Engineering',
      subtitle: 'Configure interactive virtual drill labs, attack/defense room scenarios, and objective flags.',
      badge: 'SIMULATION_ADMIN · RANGE LEAD',
      color: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border-emerald-500/40 text-emerald-300',
    },
    CERTIFICATION_ADMIN: {
      title: 'Institutional Credential & Certification Authority',
      subtitle: 'Issue, audit, verify, and revoke cryptographic cybersecurity certifications and diplomas.',
      badge: 'CERTIFICATION_ADMIN · CREDENTIAL LEAD',
      color: 'from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-amber-500/40 text-amber-300',
    },
    USER_ADMIN: {
      title: 'Enterprise Personnel & Identity Directory',
      subtitle: 'Govern corporate user accounts, department affiliations, multi-factor states, and security access.',
      badge: 'USER_ADMIN · ACCESS GOVERNANCE',
      color: 'from-indigo-500/20 via-purple-500/10 to-blue-500/20 border-indigo-500/40 text-indigo-300',
    },
    PLATFORM_ADMIN: {
      title: 'Platform Infrastructure Operations Hub',
      subtitle: 'System-wide operational oversight across curriculum, ranges, user directory, and platform telemetry.',
      badge: 'PLATFORM_ADMIN · PLATFORM LEAD',
      color: 'from-cyan-500/20 via-indigo-500/10 to-blue-500/20 border-cyan-500/40 text-cyan-300',
    },
    FLOTBOT_SECURITY_ADMIN: {
      title: 'FlotBot EDR/XDR Defense Operations & Host Fleet',
      subtitle: 'Endpoint defense telemetry, detection heuristics, MITRE ATT&CK rules, and sensor agent fleet.',
      badge: 'FLOTBOT_SECURITY_ADMIN · EDR LEAD',
      color: 'from-rose-500/20 via-purple-500/10 to-indigo-500/20 border-rose-500/40 text-rose-300',
    },
    SUPER_ADMIN: {
      title: 'Executive Operations Command & Root Governance',
      subtitle: 'Highest administrative authority across all platform services, security heuristics, database, and telemetry.',
      badge: 'SUPER_ADMIN · ROOT EXECUTIVE',
      color: 'from-indigo-500/20 via-purple-500/10 to-pink-500/20 border-indigo-500/40 text-indigo-300',
    },
    ANALYST: {
      title: 'Workforce Learning & Security Intelligence',
      subtitle: 'Analyze enterprise security training trends, simulation drill averages, and vulnerability curves.',
      badge: 'ANALYST · INTELLIGENCE LEAD',
      color: 'from-blue-500/20 via-indigo-500/10 to-teal-500/20 border-blue-500/40 text-blue-300',
    },
  };

  const activeRoleConfig = roleDisplayMap[role] || roleDisplayMap.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner & Workspace View Switcher ── */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900/95 via-indigo-950/40 to-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${activeRoleConfig.color} flex items-center gap-1.5`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeRoleConfig.badge}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> PostgreSQL Connected
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {activeRoleConfig.title}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {activeRoleConfig.subtitle}
            </p>
          </div>

          {/* Action Hub & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* View Mode Toggle: Admin Dashboard vs Personal Awareness */}
            <div className="p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'admin'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Workspace</span>
              </button>
              <button
                onClick={() => setViewMode('awareness')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'awareness'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>My Awareness Drills</span>
              </button>
            </div>

            {/* Launch Dedicated Admin Center Button */}
            <button
              onClick={handleLaunchAdminCenter}
              title="Open full dedicated Admin Center on port 5174"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 border border-indigo-400/30 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Admin Console</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/30 border border-white/20">5174</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchAdminTelemetry();
                if (onRefreshData) onRefreshData();
              }}
              disabled={loading}
              title="Refresh Live Telemetry"
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── CONDITIONAL VIEW 1: MY AWARENESS DRILLS ── */}
      {viewMode === 'awareness' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 flex items-center justify-between">
            <span>Viewing personal security awareness profile and employee training drills for <strong>{user.name}</strong>.</span>
            <button
              onClick={() => setViewMode('admin')}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px]"
            >
              Back to {role} Dashboard
            </button>
          </div>

          <WelcomeBanner user={user} />
          <QuickStats stats={quickStats} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <CyberAwarenessScore scoreData={awarenessScore} />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-4">
              <QuickActions
                onSelectAction={(actionId) => {
                  if (actionId === 'url' || actionId === 'email' || actionId === 'qr') {
                    onNavigateTab('ai-assistant');
                  } else if (actionId === 'sim') {
                    onNavigateTab('simulation');
                  }
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalysisHistoryPreview
              logs={analysisHistory}
              onSelectLog={() => onNavigateTab('history')}
              onViewAll={() => onNavigateTab('history')}
            />
            <SuspiciousActivityPreview
              activities={suspiciousActivity}
              onSelectActivity={() => onNavigateTab('threats')}
              onViewAll={() => onNavigateTab('threats')}
            />
          </div>
          <SimulationHistoryPreview
            simulations={simulationHistory}
            onViewAll={() => onNavigateTab('simulation')}
          />
        </div>
      )}

      {/* ── CONDITIONAL VIEW 2: ROLE-TAILORED ADMIN DASHBOARD ── */}
      {viewMode === 'admin' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* ═══════════════════════════════════════════════════════════
              ROLE: COURSE_ADMIN
          ═══════════════════════════════════════════════════════════ */}
          {role === 'COURSE_ADMIN' && (
            <div className="space-y-6">
              {/* 4 Curriculum KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Courses</span>
                    <div className="text-2xl font-bold text-white mt-1">{courses.length}</div>
                    <span className="text-[10px] text-cyan-400 mt-0.5 block">{publishedCourses.length} active in catalog</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Modules & Lessons</span>
                    <div className="text-2xl font-bold text-white mt-1">{totalLessons}</div>
                    <span className="text-[10px] text-indigo-400 mt-0.5 block">Structured syllabus</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Quizzes & Exams</span>
                    <div className="text-2xl font-bold text-white mt-1">{totalQuizzes}</div>
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">Proctored assessments</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Drafts Staged</span>
                    <div className="text-2xl font-bold text-amber-400 mt-1">{draftCourses.length}</div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Awaiting publication</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Course Authoring Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">Course Management Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLaunchAdminCenter}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Ingest PDF Curriculum</span>
                  </button>
                  <button
                    onClick={handleLaunchAdminCenter}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Course Studio</span>
                  </button>
                  <button
                    onClick={() => onNavigateTab('courses-training')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800 text-indigo-300 text-xs font-medium transition-all"
                  >
                    <span>View Student Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Staged Drafts Ready to Publish */}
              {draftCourses.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold text-amber-200 tracking-wider uppercase font-mono">
                        Drafts Awaiting Publication ({draftCourses.length})
                      </h3>
                    </div>
                    <span className="text-[11px] text-amber-400/80">Click Publish to release immediately to learners</span>
                  </div>

                  <div className="space-y-2">
                    {draftCourses.map((draft) => (
                      <div
                        key={draft.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{draft.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              DRAFT
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{draft.desc || 'Comprehensive security training module'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePublishCourse(draft.id)}
                            disabled={actionLoadingId === draft.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{actionLoadingId === draft.id ? 'Publishing...' : 'Publish Live'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Curriculum Catalog */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                      Courseware Catalog & Lesson Structure ({courses.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleLaunchAdminCenter}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Open Curriculum Suite in Admin Console <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {courses.slice(0, 6).map((course) => {
                    const modCount = (course.modules || []).length;
                    const lessonCount = (course.modules || []).reduce((acc: number, m: any) => acc + (m.lessons || []).length, 0);
                    return (
                      <div key={course.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{course.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {course.cat || 'General'}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                              course.status === 'draft'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {course.status === 'draft' ? 'DRAFT' : 'PUBLISHED'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{course.desc}</p>
                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                            <span>{modCount} Modules</span>
                            <span>·</span>
                            <span>{lessonCount} Lessons</span>
                            <span>·</span>
                            <span>{course.level || 'Beginner'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onNavigateTab('courses-training')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              ROLE: SECURITY_ANALYST
          ═══════════════════════════════════════════════════════════ */}
          {role === 'SECURITY_ANALYST' && (
            <div className="space-y-6">
              {/* 4 SOC KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Alerts</span>
                    <div className="text-2xl font-bold text-white mt-1">{pendingAlerts.length}</div>
                    <span className="text-[10px] text-rose-400 mt-0.5 block">Pending investigation</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Critical / High Risk</span>
                    <div className="text-2xl font-bold text-rose-400 mt-1">{criticalAlerts.length + highAlerts.length}</div>
                    <span className="text-[10px] text-amber-400 mt-0.5 block">Immediate triage needed</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">FlotBot EDR Sensor</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">ONLINE</div>
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">Kernel & host protection</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Events Logged</span>
                    <div className="text-2xl font-bold text-white mt-1">{alerts.length}</div>
                    <span className="text-[10px] text-indigo-400 mt-0.5 block">Audit timeline secure</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Real-Time Alert Triage Queue */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                      Real-Time Security Threat Queue ({alerts.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleLaunchAdminCenter}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Open SOC Threat Desk in Admin Console <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {alerts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No security alerts detected. Host endpoints operating normally.
                    </div>
                  ) : (
                    alerts.slice(0, 8).map((alert) => {
                      const isHigh = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
                      return (
                        <div key={alert.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                                alert.severity === 'CRITICAL'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : isHigh
                                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}>
                                {alert.severity || 'MEDIUM'}
                              </span>
                              <span className="text-xs font-semibold text-white">{alert.title}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                                {alert.status || 'NEW'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{alert.description || alert.details || 'Suspicious process or communication detected'}</p>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                              <span>Source: {alert.source || 'FlotBot Engine'}</span>
                              <span>·</span>
                              <span>Target: {alert.target || 'Local Host'}</span>
                              <span>·</span>
                              <span>{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Recent'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {alert.status !== 'RESOLVED' && (
                              <>
                                <button
                                  onClick={() => handleAcknowledgeAlert(alert.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-xs text-indigo-300 font-medium transition-colors"
                                >
                                  Ack
                                </button>
                                <button
                                  onClick={() => handleResolveAlert(alert.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                                >
                                  Resolve
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              ROLE: SIMULATION_ADMIN
          ═══════════════════════════════════════════════════════════ */}
          {role === 'SIMULATION_ADMIN' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Cyber Range Drills</span>
                    <div className="text-2xl font-bold text-white mt-1">{simulations.length}</div>
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">Active attack/defense labs</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Beginner Labs</span>
                    <div className="text-2xl font-bold text-white mt-1">
                      {simulations.filter((s) => s.difficulty === 'Beginner').length}
                    </div>
                    <span className="text-[10px] text-cyan-400 mt-0.5 block">Entry level defense</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Intermediate Labs</span>
                    <div className="text-2xl font-bold text-white mt-1">
                      {simulations.filter((s) => s.difficulty === 'Intermediate').length}
                    </div>
                    <span className="text-[10px] text-indigo-400 mt-0.5 block">Hands-on scenarios</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Advanced Labs</span>
                    <div className="text-2xl font-bold text-rose-400 mt-1">
                      {simulations.filter((s) => s.difficulty === 'Advanced').length}
                    </div>
                    <span className="text-[10px] text-rose-400 mt-0.5 block">Red-team & CTF flags</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Simulation Labs List */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                      Configured Cyber Range Scenarios ({simulations.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigateTab('simulation')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    Open Simulation Range <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {simulations.map((sim) => (
                    <div key={sim.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{sim.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {sim.category || 'Defense'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {sim.difficulty || 'Beginner'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{sim.goal || sim.desc || 'Interactive social engineering attack scenario'}</p>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                          <span>Duration: {sim.duration || 10} mins</span>
                          <span>·</span>
                          <span>XP: +{sim.xp || 100}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onNavigateTab('simulation')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                        >
                          Launch Drill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              ROLE: CERTIFICATION_ADMIN
          ═══════════════════════════════════════════════════════════ */}
          {role === 'CERTIFICATION_ADMIN' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Issued Credentials</span>
                    <div className="text-2xl font-bold text-white mt-1">{certList.length || '12+'}</div>
                    <span className="text-[10px] text-amber-400 mt-0.5 block">Cryptographically signed</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Verification Rate</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">100%</div>
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">Audit ledger synchronized</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Exam Pass Minimum</span>
                    <div className="text-2xl font-bold text-white mt-1">70%</div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Proctored threshold</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Revocation Protocol</span>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">ACTIVE</div>
                    <span className="text-[10px] text-cyan-400 mt-0.5 block">Immediate audit invalidation</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Ban className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Certificate Verification Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                      Institutional Credential Ledger ({certList.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleLaunchAdminCenter}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Open Certification Desk on :5174 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {certList.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No certificates recorded yet. Complete course quizzes to issue accredited credentials.
                    </div>
                  ) : (
                    certList.map((c) => (
                      <div key={c.id || c.credId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{c.recipientName || c.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {c.courseTitle || 'Cybersecurity Certification'}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                              c.status === 'REVOKED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {c.status || 'VALID'}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">ID: {c.credId || c.id}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {c.status !== 'REVOKED' && (
                            <button
                              onClick={() => handleRevokeCertificate(c.credId || c.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              ROLE: USER_ADMIN
          ═══════════════════════════════════════════════════════════ */}
          {role === 'USER_ADMIN' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Personnel</span>
                    <div className="text-2xl font-bold text-white mt-1">{userList.length || '8+'}</div>
                    <span className="text-[10px] text-indigo-400 mt-0.5 block">Active directory</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Status</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">
                      {userList.filter((u) => u.status === 'ACTIVE').length}
                    </div>
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">Access authorized</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Suspended</span>
                    <div className="text-2xl font-bold text-rose-400 mt-1">
                      {userList.filter((u) => u.status === 'SUSPENDED').length}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Locked accounts</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <UserX className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Admin Staff</span>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">
                      {userList.filter((u) => (u.role || '').includes('ADMIN')).length}
                    </div>
                    <span className="text-[10px] text-cyan-400 mt-0.5 block">Privileged personnel</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* User Directory Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                      Enterprise Personnel & Access List ({userList.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleLaunchAdminCenter}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Open User Console on :5174 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {userList.map((u) => (
                    <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{u.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {u.role || 'EMPLOYEE'}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {u.status || 'ACTIVE'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status || 'ACTIVE')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/50'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/50'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              ROLE: SUPER_ADMIN, PLATFORM_ADMIN, FLOTBOT_SECURITY_ADMIN, ANALYST
          ═══════════════════════════════════════════════════════════ */}
          {(role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN' || role === 'FLOTBOT_SECURITY_ADMIN' || role === 'ANALYST') && (
            <div className="space-y-6">
              {/* Executive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Courses Active</span>
                    <div className="text-2xl font-bold text-white mt-1">{courses.length}</div>
                    <span className="text-[10px] text-cyan-400 mt-0.5 block">{publishedCourses.length} in catalog</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Cyber Drills</span>
                    <div className="text-2xl font-bold text-white mt-1">{simulations.length}</div>
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">Virtual labs running</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">FlotBot Alerts</span>
                    <div className="text-2xl font-bold text-rose-400 mt-1">{alerts.length}</div>
                    <span className="text-[10px] text-rose-400 mt-0.5 block">{pendingAlerts.length} active triage</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Core Gateway</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">HEALTHY</div>
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">Express & PostgreSQL Live</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Administrative Subsystem Launchpad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => onNavigateTab('courses-training')}
                  className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">Curriculum Studio</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Review and curate {courses.length} educational modules, proctored quizzes, and AI ingestion blueprints.
                  </p>
                </div>

                <div
                  onClick={() => onNavigateTab('simulation')}
                  className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">Cyber Range Drills</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Deploy {simulations.length} attack scenarios, test defenses, and configure terminal capture-the-flag objectives.
                  </p>
                </div>

                <div
                  onClick={() => onNavigateTab('threats')}
                  className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-500/60 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">Threat Interceptions</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Triage {alerts.length} host-level detections, acknowledge security incidents, and maintain defense telemetry.
                  </p>
                </div>
              </div>

              {/* Direct Full Admin Console Launch Card */}
              <div className="p-5 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-purple-950/30 to-slate-900 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Full Enterprise Admin Operations Console</h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Access dedicated sub-consoles for PDF ingestion, IOC indicators, MITRE threat rules, role assignments, and unified audit logs on port 5174.
                  </p>
                </div>
                <button
                  onClick={handleLaunchAdminCenter}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
                >
                  <span>Open Admin Console (5174)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
