import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Shield, Flame, AlertTriangle, CheckCircle2, Bot, Database, Activity, RefreshCw } from 'lucide-react';

export const FlotBotSecurityDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [secData, setSecData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ovRes, secRes] = await Promise.all([
        adminApi.stats.getOverview(),
        adminApi.stats.getSecurityAnalytics(),
      ]);
      if (ovRes.success) setStats(ovRes.data?.security || {});
      if (secRes.success) setSecData(secRes.data || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const s = stats || {};
  const cats = secData?.categoryDistribution || [];
  const iocs = secData?.activeIocs || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">FlotBot Security & EDR Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Endpoint detection and response telemetry, real-time threat analysis, and AI correlation engine.
          </p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Threat Detections</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">{s.totalAlerts ?? 0}</div>
          <div className="mt-1 text-[11px] text-slate-500">Live PostgreSQL alert records</div>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Threats</span>
            <Flame className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400 font-mono">{s.activeThreats ?? 0}</div>
          <div className="mt-1 text-[11px] text-rose-400/80 font-mono">Requires investigation</div>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Resolved Incidents</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">{s.resolvedThreats ?? 0}</div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">Neutralized & closed</div>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active IOC Indicators</span>
            <Database className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400 font-mono">
            {Object.values(iocs).reduce((a: any, b: any) => a + b, 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">Hashes, IPs, Domains</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5">
          <h2 className="text-sm font-bold text-white mb-4">Threat Vectors by Category</h2>
          <div className="space-y-3">
            {cats.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No categorised telemetry available.</div>
            ) : (
              cats.map((c: any) => (
                <div key={c.category} className="flex justify-between items-center text-xs p-2 rounded bg-slate-950/60 border border-slate-800/60">
                  <span className="font-mono text-slate-300">{c.category}</span>
                  <span className="font-mono font-bold text-indigo-400">{c.count} Detections</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-3">AI Correlation Engine Posture</h2>
            <p className="text-xs text-slate-400 mb-4">
              Ollama AI processes endpoint logs, maps adversary behavior to MITRE ATT&CK tactics, and generates automated remediation recommendations.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center gap-3 text-xs text-indigo-300 font-mono">
            <Bot className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Ollama Qwen2.5 Local Engine</div>
              <div className="text-[11px] text-slate-400">Sensor inference active at 127.0.0.1:11434</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
