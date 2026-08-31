
// ============================================================
// SE-LAB — Interactive SOC Incident Response Modal
// Hands-on incident report form replacing generic "Report" buttons
// ============================================================

import React, { useState } from 'react';
import { Shield, AlertTriangle, Terminal, CheckCircle2, FileText, Send, X, Lock, Server } from 'lucide-react';
import { toast } from 'sonner';

interface IncidentReportModalProps {
  simId: string;
  simTitle: string;
  category: string;
  onClose: () => void;
  onSubmitReport: (reportData: {
    threatSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    ioc: string;
    containmentAction: string;
    notes: string;
  }) => void;
}

export function IncidentReportModal({
  simId,
  simTitle,
  category,
  onClose,
  onSubmitReport,
}: IncidentReportModalProps) {
  const [threatSeverity, setThreatSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [ioc, setIoc] = useState('');
  const [containmentAction, setContainmentAction] = useState('block-domain');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ioc.trim()) {
      toast.error('Please enter an Indicator of Compromise (IoC) domain, IP, or email sender.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`SOC Ticket #INC-${Math.floor(100000 + Math.random() * 900000)} Created & Action Triggered!`);
      onSubmitReport({
        threatSeverity,
        ioc,
        containmentAction,
        notes,
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden modal-enter">

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">{simId}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {category}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white leading-tight">SOC Security Incident Report Form</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">

          {/* Scenario Info Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-xs">{simTitle}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">TICKET STATUS: DRAFT</span>
          </div>

          {/* Threat Severity Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
              1. Assessed Threat Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(sev => {
                const colors = {
                  LOW: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400',
                  MEDIUM: 'bg-yellow-950/40 border-yellow-800/60 text-yellow-400',
                  HIGH: 'bg-amber-950/40 border-amber-800/60 text-amber-400',
                  CRITICAL: 'bg-red-950/40 border-red-800/60 text-red-400',
                };
                const active = threatSeverity === sev;
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setThreatSeverity(sev)}
                    className={`py-2 rounded-lg border font-mono font-bold text-xs transition ${
                      active
                        ? `${colors[sev]} ring-2 ring-cyan-500/40`
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Indicator of Compromise (IoC) Field */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider flex items-center justify-between">
              <span>2. Indicator of Compromise (IoC)</span>
              <span className="text-red-400 font-normal">*Required</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. malicious domain, spoofed sender email, rogue IP address, file hash..."
              value={ioc}
              onChange={e => setIoc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-600 text-xs"
            />
          </div>

          {/* Containment Action Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
              3. Automated Containment / Defensive Action
            </label>
            <select
              value={containmentAction}
              onChange={e => setContainmentAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            >
              <option value="block-domain">🛡 Block Domain & Purge Email Mailboxes across Org</option>
              <option value="isolate-endpoint">🔌 Isolate Endpoint Host Machine from Corporate Network</option>
              <option value="revoke-tokens">🔑 Revoke Active User Session Tokens & Force MFA Reset</option>
              <option value="quarantine-file">☣ Quarantine File Attachment & Submit to EDR Sandbox</option>
              <option value="flag-user">⚠️ Escalate to Tier-2 SOC Team & Monitor Traffic</option>
            </select>
          </div>

          {/* Incident Analyst Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
              4. Analyst Investigation Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe detected red flags, psychological triggers used, or evidence gathered during inspection..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 text-xs leading-relaxed"
            />
          </div>

          {/* Submit Action Bar */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting SOC Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>SUBMIT INCIDENT REPORT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
