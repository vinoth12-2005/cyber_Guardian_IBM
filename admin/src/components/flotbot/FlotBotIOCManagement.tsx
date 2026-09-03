import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Database, Plus, Search, Trash2, Shield, RefreshCw } from 'lucide-react';

export const FlotBotIOCManagement: React.FC = () => {
  const [iocs, setIocs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newType, setNewType] = useState('ip');
  const [newValue, setNewValue] = useState('');
  const [newThreatName, setNewThreatName] = useState('');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [newNote, setNewNote] = useState('');

  const fetchIocs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.flotbot.getIocs({ type: typeFilter, search });
      if (res.success && res.data) {
        setIocs(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIocs();
  }, [typeFilter]);

  const handleAddIoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    try {
      await adminApi.flotbot.addIoc({
        type: newType,
        value: newValue.trim(),
        threatName: newThreatName.trim(),
        severity: newSeverity,
        note: newNote.trim(),
      });
      setShowAddModal(false);
      setNewValue('');
      setNewThreatName('');
      setNewNote('');
      fetchIocs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteIoc = async (id: string) => {
    if (!confirm('Are you sure you want to remove this IOC?')) return;
    try {
      await adminApi.flotbot.deleteIoc(id);
      fetchIocs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Threat Intelligence & IOC Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage global Indicators of Compromise (Hashes, Malicious IPs, Phishing Domains, Rogue Process names).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Indicator</span>
          </button>
          <button onClick={fetchIocs} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchIocs()}
            placeholder="Search indicator value, threat name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="">All Types (Hashes, IPs, Domains, Processes)</option>
            <option value="ip">IP Address</option>
            <option value="domain">Domain Name</option>
            <option value="hash">File Hash (SHA256 / MD5)</option>
            <option value="process">Process Binary Name</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Indicator Value</th>
              <th className="py-3 px-4">Threat Association</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Added By</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {iocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-sans">
                  No IOCs matching criteria found in database.
                </td>
              </tr>
            ) : (
              iocs.map((ioc) => (
                <tr key={ioc.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 uppercase text-indigo-400 font-bold">{ioc.type}</td>
                  <td className="py-3 px-4 text-slate-200 select-all">{ioc.value}</td>
                  <td className="py-3 px-4 text-slate-400">{ioc.threat_name || 'Generic Suspicious'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${ioc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'}`}>
                      {ioc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{ioc.added_by}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteIoc(ioc.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddIoc} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Add New Threat Indicator (IOC)</h3>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Indicator Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
              >
                <option value="ip">IP Address</option>
                <option value="domain">Domain Name</option>
                <option value="hash">File Hash (SHA256)</option>
                <option value="process">Process Name</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Indicator Value</label>
              <input
                type="text"
                required
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. 185.220.101.5 or evil-domain.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Threat Campaign / Malware Name</label>
              <input
                type="text"
                value={newThreatName}
                onChange={(e) => setNewThreatName(e.target.value)}
                placeholder="e.g. CobaltStrike C2"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white">
                Add Indicator
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
