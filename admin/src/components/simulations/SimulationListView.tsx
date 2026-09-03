import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { SimulationFormModal } from './SimulationFormModal';
import { Gamepad2, Plus, Edit, Trash2, Search, Users, Trophy, Shield, RefreshCw } from 'lucide-react';

export const SimulationListView: React.FC = () => {
  const [sims, setSims] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSim, setSelectedSim] = useState<any | null>(null);

  const fetchSimulations = async () => {
    setLoading(true);
    try {
      const [simsRes, analyticsRes] = await Promise.all([
        adminApi.simulations.list({ category: catFilter }),
        adminApi.stats.getSimulationAnalytics(),
      ]);
      if (simsRes.success) setSims(simsRes.data || []);
      if (analyticsRes.success) setAnalytics(analyticsRes.data?.simulationMetrics || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, [catFilter]);

  const handleEdit = async (simId: string) => {
    try {
      const res = await adminApi.simulations.getById(simId);
      if (res.success && res.data) {
        setSelectedSim(res.data);
        setModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = () => {
    setSelectedSim(null);
    setModalOpen(true);
  };

  const handleDelete = async (simId: string) => {
    if (!confirm(`Are you sure you want to delete simulation '${simId}'?`)) return;
    try {
      await adminApi.simulations.delete(simId);
      fetchSimulations();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSims = sims.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.id?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.goal?.toLowerCase().includes(q) ||
      s.summary?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Attack & Defense Simulation Labs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure interactive scenarios (Phishing, Vishing, Quishing, MFA Fatigue, Ransomware) and inspect user tactical performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSimulations}
            title="Refresh Simulations"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Simulation</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scenarios by title, ID, pretext..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="">All Threat Categories</option>
            <option value="Phishing">Phishing</option>
            <option value="Vishing">Vishing (Voice)</option>
            <option value="Quishing">Quishing (QR)</option>
            <option value="Smishing">Smishing (SMS)</option>
            <option value="MFA Fatigue">MFA Fatigue</option>
            <option value="Ransomware">Ransomware</option>
            <option value="Social Engineering">Social Engineering</option>
            <option value="Insider Threat">Insider Threat</option>
            <option value="Deepfake">Deepfake</option>
            <option value="USB Drop">USB Drop</option>
          </select>
        </div>

        <div className="text-right flex items-center justify-end text-xs font-mono text-slate-400">
          Total: <strong className="text-indigo-300 ml-1">{filteredSims.length} Scenarios</strong>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSims.map((sim) => {
          const metric = analytics.find((m) => m.id === sim.id) || {};

          return (
            <div key={sim.id} className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs border border-indigo-500/20">
                      {sim.id}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{sim.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{sim.category} · {sim.difficulty} · {sim.environment}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+{sim.xp} XP</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{sim.goal || sim.summary}</p>
              </div>

              <div>
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center font-mono mb-3">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="text-xs font-bold text-white">{metric.attempts ?? 0}</div>
                    <div className="text-[10px] text-slate-500">Attempts</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="text-xs font-bold text-emerald-400">{metric.avgScore ?? 0}%</div>
                    <div className="text-[10px] text-slate-500">Avg Score</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="text-xs font-bold text-cyan-400">{metric.successRate ?? 0}%</div>
                    <div className="text-[10px] text-slate-500">Safe Pass Rate</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleEdit(sim.id)}
                    className="p-1.5 rounded text-indigo-400 hover:bg-indigo-950/40 transition-colors inline-flex items-center gap-1 text-[11px] font-mono"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Customize</span>
                  </button>
                  <button
                    onClick={() => handleDelete(sim.id)}
                    title="Delete Simulation"
                    className="p-1.5 rounded text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulation Modal */}
      {modalOpen && (
        <SimulationFormModal
          simulation={selectedSim}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            fetchSimulations();
          }}
        />
      )}
    </div>
  );
};
