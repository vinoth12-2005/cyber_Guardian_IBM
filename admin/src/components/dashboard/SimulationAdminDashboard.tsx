import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Gamepad2,
  Terminal,
  Flag,
  Activity,
  Plus,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface SimulationAdminDashboardProps {
  stats: any;
  simulations: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const SimulationAdminDashboard: React.FC<SimulationAdminDashboardProps> = ({
  stats,
  simulations,
  loading,
  onRefresh,
}) => {
  const { setActiveTab } = useAdminAuth();

  const categories = Array.from(new Set(simulations.map((s) => s.category).filter(Boolean)));
  const beginnerCount = simulations.filter((s) => s.difficulty === 'Beginner').length;
  const intermediateCount = simulations.filter((s) => s.difficulty === 'Intermediate').length;
  const advancedCount = simulations.filter((s) => s.difficulty === 'Advanced').length;

  return (
    <div className="space-y-8">
      {/* Simulation Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Cyber Range & Simulation Engineering</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
              SIMULATION_ADMIN LABS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive virtual terminals, attack/defense room configurations, terminal flags, and objective scoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulations')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Simulation</span>
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

      {/* 4 Cyber Range KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Scenarios */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Cyber Scenarios</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Gamepad2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{simulations.length}</span>
            <span className="text-[11px] text-emerald-400 font-mono">Rooms</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Configured in Sandbox</div>
        </div>

        {/* Categories */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Attack Vectors</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">{categories.length || 6}</span>
            <span className="text-[11px] text-slate-400 font-mono">Specialties</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Phishing, MFA, Vishing, Quishing</div>
        </div>

        {/* Difficulty Coverage */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Difficulty Coverage</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400 font-mono">3 Tiers</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {beginnerCount} Beg / {intermediateCount} Int / {advancedCount} Adv
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Graduated learning pathway</div>
        </div>

        {/* Terminal Objectives */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Interactive Objectives</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Flag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">100%</span>
            <span className="text-[11px] text-emerald-400 font-mono">CTF Verified</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Automated flag verification</div>
        </div>
      </div>

      {/* Live Simulation Ranges Table */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Active Cyber Attack & Defense Labs</h2>
          </div>
          <button
            onClick={() => setActiveTab('simulations')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
          >
            <span>Manage All Labs</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Scenario Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Duration</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {simulations.slice(0, 8).map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-white">{s.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{s.description}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {s.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        s.difficulty === 'Beginner'
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : s.difficulty === 'Intermediate'
                          ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {s.difficulty}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 font-mono">{s.duration || '15 min'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveTab('simulations')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700"
                    >
                      Configure Room
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
