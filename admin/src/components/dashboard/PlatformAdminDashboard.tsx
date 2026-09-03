import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Users,
  BookOpen,
  Gamepad2,
  Award,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Sparkles,
  BarChart3,
  Megaphone,
  RefreshCw,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface PlatformAdminDashboardProps {
  stats: any;
  courses: any[];
  simulations: any[];
  users: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const PlatformAdminDashboard: React.FC<PlatformAdminDashboardProps> = ({
  stats,
  courses,
  simulations,
  users,
  loading,
  onRefresh,
}) => {
  const { setActiveTab } = useAdminAuth();
  const p = stats?.platform || {};

  const draftCourses = courses.filter((c) => c.status === 'draft');
  const publishedCourses = courses.filter((c) => c.status !== 'draft');

  return (
    <div className="space-y-8">
      {/* Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Platform Operations Hub</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1 font-semibold">
              PLATFORM_ADMIN
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live DB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational oversight across learning curriculum, interactive cyber ranges, user directory, and institutional credentials.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <div
          onClick={() => setActiveTab('users')}
          className="cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 p-4 hover:border-indigo-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Workforce Directory
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
            <span>Manage Accounts</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Courses */}
        <div
          onClick={() => setActiveTab('courses')}
          className="cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 p-4 hover:border-cyan-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Curriculum Suite
            </span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{courses.length}</span>
            <span className="text-[11px] text-cyan-400 font-mono">
              {publishedCourses.length} Live / {draftCourses.length} Draft
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Course Catalog</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Simulations */}
        <div
          onClick={() => setActiveTab('simulations')}
          className="cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 p-4 hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Simulation Labs
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Gamepad2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{simulations.length}</span>
            <span className="text-[11px] text-emerald-400 font-mono">Hands-on Labs</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Attack & Defense Scenarios</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Certifications */}
        <div
          onClick={() => setActiveTab('certifications')}
          className="cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 p-4 hover:border-amber-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
              Verified Certifications
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{p.totalCertificates ?? 12}</span>
            <span className="text-[11px] text-amber-400 font-mono">Issued Credentials</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Audit Credentials</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Platform Actions */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider">Platform Operations</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add User</span>
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
            <span>Add Simulation</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Learning Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Megaphone className="h-3.5 w-3.5" />
            <span>Announcements</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Course Catalog Highlights & Simulation Ranges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Panel */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Course Curriculum Staging</h2>
            </div>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>Manage Catalog</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {courses.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{c.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Category: {c.cat} | {c.modules?.length || 0} Modules
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    c.status === 'draft'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {c.status === 'draft' ? 'Draft' : 'Live'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Simulations Panel */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Cyber Attack & Defense Ranges</h2>
            </div>
            <button
              onClick={() => setActiveTab('simulations')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
            >
              <span>Manage Labs</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {simulations.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{s.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {s.category} | Difficulty: {s.difficulty}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">
                  {s.duration || '15 min'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
