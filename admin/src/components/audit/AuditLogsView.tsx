import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { ScrollText, Search, ShieldAlert, RefreshCw } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.audit.getLogs({ search });
      if (res.success && res.data) {
        setLogs(res.data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Administrative Immutable Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically recorded log of administrative operations, role modifications, and threat mitigations.
          </p>
        </div>
        <button onClick={fetchLogs} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            placeholder="Search action, administrator, resource..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Administrator</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Resource Target</th>
              <th className="py-3 px-4">Metadata Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs font-sans">
                  No audit logs found in database.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 text-white font-bold">{l.adminName || l.adminEmail}</td>
                  <td className="py-3 px-4 text-indigo-400 font-bold">{l.action}</td>
                  <td className="py-3 px-4 text-slate-300">{l.resource} ({l.resourceId || 'N/A'})</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs">{JSON.stringify(l.metadata)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
