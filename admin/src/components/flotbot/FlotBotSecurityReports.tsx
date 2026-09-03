import React, { useState } from 'react';
import { FileText, Download, ShieldCheck, RefreshCw, Printer } from 'lucide-react';

export const FlotBotSecurityReports: React.FC = () => {
  const [reportType, setReportType] = useState('executive');

  const handleExportJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      platform: 'CyberGuardian AI & FlotBot EDR/XDR',
      summary: {
        totalAlertsAnalyzed: 3,
        criticalThreatsMitigated: 1,
        activeIocCount: 3,
        overallFleetSecurityScore: 88,
      },
      auditHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FlotBot_Security_Report_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">FlotBot Security Reports & Threat Audits</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate formal incident summaries, export compliance audits, and download cryptographic threat replays.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Telemetry JSON</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-sm font-bold text-white">Executive SOC Threat Intelligence Briefing</h2>
          <span className="text-[11px] font-mono text-slate-400">Generated: {new Date().toLocaleString()} · Unified EDR Sensor Stream</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Threat Incursions Blocked</div>
            <div className="text-2xl font-bold text-white font-mono">100%</div>
            <div className="text-[10px] text-emerald-400 font-mono">No host breaches undetected</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Average Threat Triage Time</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">42 sec</div>
            <div className="text-[10px] text-slate-500 font-mono">From alert to acknowledgement</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">AI Confidence Accuracy</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">96.4%</div>
            <div className="text-[10px] text-slate-500 font-mono">Ollama Qwen2.5 Correlation</div>
          </div>
        </div>
      </div>
    </div>
  );
};
