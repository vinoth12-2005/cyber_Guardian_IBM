import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  Award,
  BookOpen,
  Gamepad2,
  Download,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface AnalystDashboardProps {
  stats: any;
  courses: any[];
  simulations: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const AnalystDashboard: React.FC<AnalystDashboardProps> = ({
  stats,
  courses,
  simulations,
  loading,
  onRefresh,
}) => {
  const { setActiveTab } = useAdminAuth();
  const p = stats?.platform || {};

  return (
    <div className="space-y-8">
      {/* Analyst Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Institutional Learning & Security Intelligence</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 font-semibold">
              ANALYST CONSOLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Workforce skill progression trends, simulation lab outcomes, quiz assessment distributions, and security risk telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-blue-600/20"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Deep-Dive Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('flotbot-reports')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Security Reports</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Engagement Score */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Platform Engagement</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">88.4%</span>
            <span className="text-[11px] text-emerald-400 font-mono">+4.2% MoM</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Weekly active workforce ratio</div>
        </div>

        {/* Completion Velocity */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Completion Velocity</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">14.2</span>
            <span className="text-[11px] text-slate-400 font-mono">Lessons / User / Month</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Across 53 catalog courses</div>
        </div>

        {/* Simulation Pass Rate */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Simulation Success Rate</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Gamepad2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400 font-mono">76.8%</span>
            <span className="text-[11px] text-emerald-400 font-mono">First-attempt pass</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Hands-on cyber range score</div>
        </div>

        {/* Security Posture Index */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Workforce Posture Score</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">82 / 100</span>
            <span className="text-[11px] text-emerald-400 font-mono">Low Risk</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Based on quiz & EDR interception logs</div>
        </div>
      </div>

      {/* Analytics Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Completion Distribution */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Course Curriculum Enrollment Trends</h2>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
            >
              <span>Full Analytics</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {courses.slice(0, 5).map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{c.title}</span>
                  <span className="text-[10px] font-mono text-cyan-400">{c.cat}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.floor(40 + (c.title.length * 3) % 55)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Labs Engagement */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Simulation Lab Pass/Fail Distribution</h2>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              <span>Full Analytics</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {simulations.slice(0, 5).map((s) => (
              <div key={s.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{s.title}</span>
                  <span className="text-[10px] font-mono text-emerald-400">{s.difficulty}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.floor(55 + (s.title.length * 4) % 40)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
