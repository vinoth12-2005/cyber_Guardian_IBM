import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { UserCheck, Shield, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export const FlotBotUserBehaviourView: React.FC = () => {
  const [behaviourList, setBehaviourList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBehaviour = async () => {
    setLoading(true);
    try {
      const res = await adminApi.flotbot.getAllUsersSecurityBehaviour();
      if (res.success && res.data) {
        setBehaviourList(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBehaviour();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">User Security Behaviour Posture</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective security posture scores calculated dynamically from real alert acknowledgments, response times, and defensive interactions.
          </p>
        </div>
        <button onClick={fetchBehaviour} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Security Score</th>
              <th className="py-3 px-4">Associated Alerts</th>
              <th className="py-3 px-4">Acknowledged</th>
              <th className="py-3 px-4">AI Explanations Asked</th>
              <th className="py-3 px-4">Avg Response Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {behaviourList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-sans">
                  No user security records available.
                </td>
              </tr>
            ) : (
              behaviourList.map((b) => {
                const m = b.metrics || {};
                const score = m.securityPostureScore ?? 80;

                return (
                  <tr key={b.userId} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-white">{b.userName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{b.userEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        score >= 80 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : score >= 60 ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-bold">{m.totalAlerts ?? 0}</td>
                    <td className="py-3 px-4 text-emerald-400">{m.acknowledgedAlerts ?? 0}</td>
                    <td className="py-3 px-4 text-indigo-300">{m.aiExplanationsRequested ?? 0}</td>
                    <td className="py-3 px-4 text-slate-400">{m.averageResponseTimeSeconds ?? 0} sec</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
