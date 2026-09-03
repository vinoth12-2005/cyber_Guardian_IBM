import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { FlotBotAlertDetailModal } from './FlotBotAlertDetailModal';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Flame,
  Shield,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const FlotBotAlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.flotbot.getAlerts({
        severity: severityFilter,
        status: statusFilter,
        search,
      });
      if (res.success && res.data) {
        setAlerts(res.data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Security Alert & Threat Triage</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor sensor anomalies, inspect evidence telemetry, query AI explanations, and manage the full threat lifecycle.
          </p>
        </div>
        <button onClick={fetchAlerts} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAlerts()}
            placeholder="Search alerts, PID, source..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Threat Headline</th>
              <th className="py-3 px-4">Category / Sensor</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Detected Timestamp</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                  No security alerts matching filters found in database.
                </td>
              </tr>
            ) : (
              alerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : alt.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {alt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{alt.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{alt.description}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    <div>{alt.category}</div>
                    <div className="text-[10px] text-slate-500">{alt.source}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        alt.status === 'RESOLVED'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50'
                          : alt.acknowledged
                          ? 'bg-blue-950/50 text-blue-400 border border-blue-800/50'
                          : 'bg-rose-950/50 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {alt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(alt.timestamp).toLocaleTimeString()} · {new Date(alt.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedAlertId(alt.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Investigate</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Alert Investigation Modal */}
      {selectedAlertId && (
        <FlotBotAlertDetailModal
          alertId={selectedAlertId}
          onClose={() => setSelectedAlertId(null)}
          onAlertUpdated={fetchAlerts}
        />
      )}
    </div>
  );
};
