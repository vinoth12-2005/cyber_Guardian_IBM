import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Award, Search, ShieldCheck, Ban, RefreshCw, CheckCircle2 } from 'lucide-react';

export const CertificationListView: React.FC = () => {
  const [certs, setCerts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.certifications.list({ search });
      if (res.success && res.data) {
        setCerts(res.data.certificates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleRevoke = async (credId: string) => {
    const reason = prompt('Please enter revocation audit rationale:');
    if (!reason) return;

    try {
      await adminApi.certifications.revoke(credId, reason);
      fetchCerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Certification & Credential Registry</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit issued certificates, inspect SHA-256 anti-tamper hashes, and execute authorized revocations.
          </p>
        </div>
        <button onClick={fetchCerts} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
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
            onKeyDown={(e) => e.key === 'Enter' && fetchCerts()}
            placeholder="Search by Credential ID, recipient, course..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-4">Credential ID</th>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Certification Title</th>
              <th className="py-3 px-4">Exam Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Issued Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {certs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                  No certification records found in database.
                </td>
              </tr>
            ) : (
              certs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{c.credId}</td>
                  <td className="py-3 px-4 font-semibold text-white">{c.recipientName}</td>
                  <td className="py-3 px-4 text-slate-300">{c.title}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{c.score}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${c.status === 'active' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950/50 text-rose-400 border border-rose-800/50'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{new Date(c.issueDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    {c.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(c.credId)}
                        className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[11px] font-mono"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
