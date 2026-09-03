import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Users,
  BookOpen,
  Gamepad2,
  Flame,
  Shield,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Sparkles,
  ScrollText,
  Sliders,
  Settings,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  stats: any;
  courses: any[];
  simulations: any[];
  users: any[];
  alerts: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  stats,
  courses,
  simulations,
  users,
  alerts,
  loading,
  onRefresh,
}) => {
  const { setActiveTab } = useAdminAuth();
  const p = stats?.platform || {};
  const s = stats?.security || {};

  const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED');
  const criticalThreats = activeAlerts.filter((a) => a.severity === 'CRITICAL');

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Executive Operations Command</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3 w-3 text-indigo-400" /> SUPER_ADMIN ROOT
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live DB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full unrestricted governance across learning catalog, cyber attack ranges, workforce posture, and EDR sensors.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 4 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <div
          onClick={() => setActiveTab('users')}
          className="cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 p-4 relative overflow-hidden hover:border-indigo-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Workforce Accounts
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{p.totalUsers ?? users.length}</span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center">
              <ArrowUpRight className="h-3 w-3" /> {p.activeUsers ?? users.filter((u) => u.status === 'ACTIVE').length} Active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Identity Directory</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Courses */}
        <div
          onClick={() => setActiveTab('courses')}
          className="cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 p-4 relative overflow-hidden hover:border-cyan-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Course Curriculum
            </span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{courses.length || p.totalCourses || 53}</span>
            <span className="text-[11px] text-cyan-400 font-mono">
              {courses.filter((c) => c.status === 'draft').length} Staged Drafts
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Curriculum Studio</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Simulations */}
        <div
          onClick={() => setActiveTab('simulations')}
          className="cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 p-4 relative overflow-hidden hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Attack & Defense Labs
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Gamepad2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{simulations.length || 47}</span>
            <span className="text-[11px] text-emerald-400 font-mono">Active Ranges</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Terminal Environments</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* FlotBot EDR */}
        <div
          onClick={() => setActiveTab('flotbot-alerts')}
          className="cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 p-4 relative overflow-hidden hover:border-rose-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Fleet Threat Level
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${criticalThreats.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {criticalThreats.length > 0 ? 'CRITICAL' : activeAlerts.length > 0 ? 'WARNING' : 'SECURE'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {activeAlerts.length} active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="text-emerald-400 font-mono">{s.resolvedThreats ?? 0} Resolved</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Root Operational Quick Actions Strip */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Root Quick Operations</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Provision User</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Ingest Course</span>
          </button>
          <button
            onClick={() => setActiveTab('simulations')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Launch Lab</span>
          </button>
          <button
            onClick={() => setActiveTab('flotbot-rules')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Threat Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('audit-logs')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <ScrollText className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>System Settings</span>
          </button>
        </div>
      </div>

      {/* Dual Stream: Critical Security Alerts & Recent Workforce Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Security Alert Stream */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Live EDR Security Incidents</h2>
            </div>
            <button
              onClick={() => setActiveTab('flotbot-alerts')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        a.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : a.severity === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span className="text-xs font-semibold text-white">{a.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{a.description}</p>
                </div>
                <button
                  onClick={() => setActiveTab('flotbot-alerts')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 shrink-0 border border-slate-700"
                >
                  Triage
                </button>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-500">
                No active threats detected. Fleet sensors reporting clean.
              </div>
            )}
          </div>
        </div>

        {/* Right: Workforce Directory Activity */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Workforce Identity Directory</h2>
            </div>
            <button
              onClick={() => setActiveTab('users')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              <span>Manage Users</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {users.slice(0, 4).map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.profilePicture || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}
                    alt={u.name}
                    className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 object-cover"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {u.role}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{u.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
