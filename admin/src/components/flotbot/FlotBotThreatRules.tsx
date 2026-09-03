import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Sliders, ToggleLeft, ToggleRight, Shield, RefreshCw } from 'lucide-react';

export const FlotBotThreatRules: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await adminApi.flotbot.getRules();
      if (res.success && res.data) {
        setRules(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (ruleId: string, currentEnabled: boolean) => {
    try {
      await adminApi.flotbot.toggleRule(ruleId, !currentEnabled);
      fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Threat Detection Rule Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure heuristic rule sets, enable/disable detection triggers, and audit rule modifications.
          </p>
        </div>
        <button onClick={fetchRules} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-4">Rule ID</th>
              <th className="py-3 px-4">Rule Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Status / Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {rules.map((r) => (
              <tr key={r.id || r.rule_id} className="hover:bg-slate-800/30">
                <td className="py-3 px-4 text-indigo-400 font-bold">{r.rule_id}</td>
                <td className="py-3 px-4 font-sans font-semibold text-white">{r.name}</td>
                <td className="py-3 px-4 text-slate-300">{r.category}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${r.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'}`}>
                    {r.severity}
                  </span>
                </td>
                <td className="py-3 px-4 font-sans text-slate-400 text-[11px] max-w-xs truncate">{r.description}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggle(r.rule_id, r.enabled)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                      r.enabled
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <span>{r.enabled ? 'ACTIVE' : 'DISABLED'}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
