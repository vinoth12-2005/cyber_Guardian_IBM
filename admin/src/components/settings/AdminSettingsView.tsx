import React from 'react';
import { SlidersHorizontal, Database, Server, ShieldCheck } from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System & Backend Configuration</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review backend database parameters, API gateway settings, and security sensor policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Database className="h-4 w-4 text-cyan-400" />
            <span>Database Connection Settings</span>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500">Engine</span>
              <span className="text-emerald-400">PostgreSQL (Primary)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500">Database Name</span>
              <span>cyberguardian</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500">Port</span>
              <span>5432</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Server className="h-4 w-4 text-indigo-400" />
            <span>API Gateway Environment</span>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500">Backend Port</span>
              <span>5000</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500">Admin Console Port</span>
              <span>5174</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500">Ollama AI Endpoint</span>
              <span>http://127.0.0.1:11434</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
