import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminApi } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  Flame,
  Shield,
  Sliders,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Cpu,
  Globe,
  FileCode,
  HardDrive,
} from 'lucide-react';

interface FlotBotAdminDashboardProps {
  stats: any;
  alerts: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const FlotBotAdminDashboard: React.FC<FlotBotAdminDashboardProps> = ({
  stats,
  alerts,
  loading,
  onRefresh,
}) => {
  const { setActiveTab } = useAdminAuth();
  const s = stats?.security || {};

  const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED');
  const criticalThreats = activeAlerts.filter((a) => a.severity === 'CRITICAL');
  const threatLevel = criticalThreats.length > 0 ? 'CRITICAL' : activeAlerts.length > 0 ? 'WARNING' : 'SECURE';

  const handleAcknowledge = async (alertId: string) => {
    try {
      await adminApi.flotbot.acknowledgeAlert(alertId);
      toast.success('Alert acknowledged');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to acknowledge alert');
    }
  };

  return (
    <div className="space-y-8">
      {/* EDR Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">EDR Defense Operations & Host Fleet</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 font-semibold">
              FLOTBOT_SECURITY_ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Host sensor orchestration, threat detection rules, IOC repository, and real-time interception gates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('flotbot-rules')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-rose-600/20"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Threat Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('flotbot-iocs')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Add IOC</span>
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

      {/* 4 EDR Defense KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fleet Threat Level */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Fleet Threat Posture</span>
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                threatLevel === 'CRITICAL'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : threatLevel === 'WARNING'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                threatLevel === 'CRITICAL'
                  ? 'text-rose-400'
                  : threatLevel === 'WARNING'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {threatLevel}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Live Status</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Autonomous Interception Active</div>
        </div>

        {/* Active Threats */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Threat Incidents</span>
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-400 font-mono">{activeAlerts.length}</span>
            <span className="text-[11px] text-slate-400 font-mono">Unresolved</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">{criticalThreats.length} Critical severity</div>
        </div>

        {/* Threat Rules */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Detection Rules</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sliders className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400 font-mono">14 Active</span>
            <span className="text-[11px] text-emerald-400 font-mono">100% Armed</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">YARA & Heuristic Engines</div>
        </div>

        {/* IOC Indicators */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Threat Indicators (IOCs)</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">124</span>
            <span className="text-[11px] text-slate-400 font-mono">In Database</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">IPs, Hashes & Phish Domains</div>
        </div>
      </div>

      {/* Host Sensors Health Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Process Sensor</div>
            <div className="text-[10px] text-emerald-400 font-mono">ONLINE &bull; 0.2ms</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Network Filter</div>
            <div className="text-[10px] text-emerald-400 font-mono">ONLINE &bull; Port 53/443</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileCode className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">File Integrity</div>
            <div className="text-[10px] text-emerald-400 font-mono">ONLINE &bull; Real-time</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HardDrive className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Memory Guard</div>
            <div className="text-[10px] text-emerald-400 font-mono">ONLINE &bull; Heuristic</div>
          </div>
        </div>
      </div>

      {/* Active Threat Queue Table */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white">Active Threat Detection Stream</h2>
          </div>
          <button
            onClick={() => setActiveTab('flotbot-alerts')}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono"
          >
            <span>Triage All Alerts</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {activeAlerts.slice(0, 6).map((a) => (
            <div
              key={a.id}
              className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
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
                <p className="text-xs text-slate-400">{a.description}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Category: {a.category} &bull; Target: {a.target || 'Fleet Host'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {a.status === 'NEW' && (
                  <button
                    onClick={() => handleAcknowledge(a.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
                  >
                    Ack
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('flotbot-alerts')}
                  className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-xs font-mono text-rose-300 border border-rose-500/30"
                >
                  Investigate
                </button>
              </div>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No active security incidents detected. System is running cleanly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
