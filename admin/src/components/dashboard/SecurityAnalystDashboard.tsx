import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminApi } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Search,
  Bot,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Database,
  Clock,
} from 'lucide-react';

interface SecurityAnalystDashboardProps {
  stats: any;
  alerts: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const SecurityAnalystDashboard: React.FC<SecurityAnalystDashboardProps> = ({
  stats,
  alerts,
  loading,
  onRefresh,
}) => {
  const { setActiveTab } = useAdminAuth();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const pendingAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED');
  const criticalAlerts = pendingAlerts.filter((a) => a.severity === 'CRITICAL');
  const highAlerts = pendingAlerts.filter((a) => a.severity === 'HIGH');

  const handleResolve = async (alertId: string) => {
    const notes = prompt('Enter investigation notes and resolution rationale:');
    if (!notes || !notes.trim()) return;

    setResolvingId(alertId);
    try {
      await adminApi.flotbot.resolveAlert(alertId, notes.trim());
      toast.success('Alert resolved with forensic notes');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to resolve alert');
    } finally {
      setResolvingId(null);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await adminApi.flotbot.acknowledgeAlert(alertId);
      toast.success('Alert marked as under investigation');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to acknowledge alert');
    }
  };

  return (
    <div className="space-y-8">
      {/* SOC Triage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">SOC Incident Triage & Investigation Console</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1 font-semibold">
              SECURITY_ANALYST (TIER 1/2)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time alert triage, IOC indicator validation, host telemetry inspection, and AI threat correlation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('flotbot-ai')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>AI Security Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('flotbot-iocs')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Lookup IOC</span>
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

      {/* 4 SOC KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Triage */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Triage Queue</span>
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-400 font-mono">{pendingAlerts.length}</span>
            <span className="text-[11px] text-slate-400 font-mono">Unresolved</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Requires triage determination</div>
        </div>

        {/* Critical Alerts */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Critical Priority</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{criticalAlerts.length}</span>
            <span className="text-[11px] text-rose-400 font-mono">Immediate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Potential breach / data exposure</div>
        </div>

        {/* High Severity Alerts */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">High Severity</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">{highAlerts.length}</span>
            <span className="text-[11px] text-slate-400 font-mono">Elevated</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Typosquatting & credential harvesting</div>
        </div>

        {/* Triage Velocity */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Median Triage Time</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">2.4m</span>
            <span className="text-[11px] text-emerald-400 font-mono">Fast Response</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">SLA target &lt; 15 minutes</div>
        </div>
      </div>

      {/* Priority Alert Triage Stream */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-orange-400" />
            <h2 className="text-sm font-bold text-white">Priority Incident Triage Queue</h2>
          </div>
          <button
            onClick={() => setActiveTab('flotbot-alerts')}
            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-mono"
          >
            <span>View Full Alert Ledger</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-3">
          {pendingAlerts.slice(0, 6).map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                  <span className="text-sm font-semibold text-white">{a.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">({a.id})</span>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === 'NEW' && (
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(a.id)}
                    disabled={resolvingId === a.id}
                    className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-mono text-emerald-300 border border-emerald-500/30"
                  >
                    {resolvingId === a.id ? 'Saving...' : 'Resolve Alert'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400">{a.description}</p>
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
                <span>Category: {a.category} &bull; Threat Score: {a.threatScore || 85}/100</span>
                <span>Target: {a.target || 'Fleet Host Endpoint'}</span>
              </div>
            </div>
          ))}
          {pendingAlerts.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No pending alerts in queue. All reported incidents are resolved.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
