
// ============================================================
// SE-LAB — Interactive SOC Incident Response & Threat Classification Console
// Hands-on incident report form with threat classification, IoC validation,
// red flag forensics, containment action execution, and root defense flag release.
// ============================================================

import React, { useState } from 'react';
import {
  Shield, AlertTriangle, Terminal, CheckCircle2, FileText,
  Send, X, Lock, Server, Key, Copy, Check, Sparkles, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export interface IncidentReportModalProps {
  simId: string;
  simTitle: string;
  category: string;
  expectedFlag?: string;
  onClose: () => void;
  onSubmitReport: (reportData: {
    threatSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    attackClassification: string;
    ioc: string;
    containmentAction: string;
    redFlags: string[];
    notes: string;
  }) => void;
}

export function IncidentReportModal({
  simId,
  simTitle,
  category,
  expectedFlag,
  onClose,
  onSubmitReport,
}: IncidentReportModalProps) {
  const [attackClassification, setAttackClassification] = useState(
    category.toLowerCase().includes('phish') ? 'Spear Phishing & Credential Harvesting' :
    category.toLowerCase().includes('chat') || category.toLowerCase().includes('ceo') ? 'Business Email Compromise (BEC) / CEO Fraud' :
    category.toLowerCase().includes('sms') ? 'Smishing (SMS Phishing) Deception' :
    category.toLowerCase().includes('qr') ? 'Quishing (Malicious QR Code Deception)' :
    'Spear Phishing & Credential Harvesting'
  );

  const [threatSeverity, setThreatSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [ioc, setIoc] = useState('');
  const [containmentAction, setContainmentAction] = useState('block-domain');
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([
    'Mismatched or spoofed sender domain',
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContained, setIsContained] = useState(false);
  const [flagCopied, setFlagCopied] = useState(false);

  // Compute canonical defense flag
  const cleanId = (simId || 'SE-001').toUpperCase();
  const cleanCategory = (category || 'THREAT').toUpperCase().replace(/\s+/g, '_');
  const rootFlag = expectedFlag || `FLAG{${cleanId}_${cleanCategory}_DEFENDED}`;

  const availableRedFlags = [
    'Mismatched or spoofed sender domain',
    'Urgent deadline pressure / threat of suspension',
    'SPF / DKIM email authentication failure',
    'Suspicious non-corporate link URL / untrusted domain',
    'Unverified credential harvesting form',
    'Executable attachment or disguised file extension',
  ];

  const toggleRedFlag = (flagText: string) => {
    if (selectedRedFlags.includes(flagText)) {
      setSelectedRedFlags(selectedRedFlags.filter(f => f !== flagText));
    } else {
      setSelectedRedFlags([...selectedRedFlags, flagText]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ioc.trim() || ioc.trim().length < 3) {
      toast.error('⚠️ IoC Required: Please enter the malicious domain, sender email address, or URL discovered in the VM sandbox.');
      return;
    }

    if (selectedRedFlags.length === 0) {
      toast.error('⚠️ Evidence Required: Please check at least one observed red flag to support your SOC report.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsContained(true);
      toast.success(`🛡️ SOC Incident Verified! Workstation secured & perimeter rules updated.`);
    }, 900);
  };

  const handleFinishAndExit = () => {
    onSubmitReport({
      threatSeverity,
      attackClassification,
      ioc: ioc.trim(),
      containmentAction,
      redFlags: selectedRedFlags,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#111722] border-2 border-slate-700/80 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden">

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0c1018] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-mono font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">{simId}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold uppercase">
                  {category}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">● SOC CONSOLE</span>
              </div>
              <h2 className="text-sm font-bold text-white leading-tight">SOC Security Incident Report &amp; Threat Classification</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── CONTAINMENT RESOLUTION / FLAG REVEAL VIEW ── */}
        {isContained ? (
          <div className="p-6 space-y-5 text-center modal-enter overflow-y-auto max-h-[80vh]">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950/60">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> INCIDENT CONTAINED &amp; CLASSIFIED
              </div>
              <h2 className="text-xl font-black text-white">SOC Incident Ticket Contained Successfully!</h2>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                Your report for <span className="text-cyan-400 font-semibold">{simTitle}</span> was verified. The perimeter firewall has sinkholed the threat and isolated the attacker payload.
              </p>
            </div>

            {/* Incident Summary Card */}
            <div className="bg-[#090d14] border border-emerald-500/50 rounded-xl p-4 text-left font-mono text-xs space-y-2">
              <div className="text-emerald-400 font-bold text-[11px] uppercase border-b border-slate-800 pb-1.5 flex justify-between">
                <span>SOC INCIDENT VERIFICATION REPORT</span>
                <span className="text-slate-500">TICKET #INC-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div><span className="text-slate-500">Classification:</span> <span className="text-cyan-300 font-semibold">{attackClassification}</span></div>
                <div><span className="text-slate-500">Assessed Severity:</span> <span className="text-amber-300 font-bold">{threatSeverity}</span></div>
                <div><span className="text-slate-500">Neutralized IoC:</span> <span className="text-red-300 break-all">{ioc}</span></div>
                <div><span className="text-slate-500">Containment:</span> <span className="text-emerald-300 font-semibold">APPLIED &amp; SINKHOLED</span></div>
              </div>
            </div>

            {/* Generated Root Defense Flag Card */}
            <div className="bg-emerald-950/40 border-2 border-emerald-500/80 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Key className="w-4 h-4 text-emerald-400" /> OFFICIAL ROOT DEFENSE FLAG:
                </span>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded font-bold border border-emerald-700">
                  READY TO CAPTURE
                </span>
              </div>

              <div className="bg-[#090d14] border border-emerald-500/60 rounded-lg p-3 text-emerald-300 font-mono font-black text-sm tracking-wider select-all break-all shadow-inner">
                {rootFlag}
              </div>

              <p className="text-[11px] text-slate-300 text-left">
                📌 Copy this flag and paste it into <strong>Task 3</strong> in the left room tasks panel to capture the flag and complete the cyber range room!
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(rootFlag);
                    setFlagCopied(true);
                    toast.success('Root Flag copied to clipboard! Paste it into Task 3.');
                    setTimeout(() => setFlagCopied(false), 3000);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 font-mono"
                >
                  {flagCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{flagCopied ? 'Flag Copied!' : 'Copy Root Flag'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishAndExit}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 font-mono"
                >
                  Proceed to Flag Submission →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── INCIDENT INVESTIGATION FORM ── */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">

            {/* Target Machine & Pretext Context */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="font-semibold text-xs">{simTitle}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                TICKET STATUS: ACTIVE INVESTIGATION
              </span>
            </div>

            {/* Step 1: Threat Classification */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                1. Classify Threat / Attack Vector
              </label>
              <select
                value={attackClassification}
                onChange={e => setAttackClassification(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-sans font-medium"
              >
                <option value="Spear Phishing & Credential Harvesting">🎣 Spear Phishing &amp; Credential Harvesting</option>
                <option value="Domain Homoglyph / Typosquatting Pretext">🔤 Homoglyph / Typosquatting Domain Spoofing</option>
                <option value="Business Email Compromise (BEC) / CEO Fraud">💼 Business Email Compromise (BEC) / Wire Transfer Fraud</option>
                <option value="Malicious Attachment & Payload Delivery">☣ Malicious Attachment / Malware Delivery (.exe / macro)</option>
                <option value="Urgent Authority Impersonation Pretext">⚠️ Urgent Authority Pretexting &amp; Suspension Extortion</option>
                <option value="Smishing / Multi-Factor Authentication Fatigue">📱 Smishing / MFA Prompt Bombing Attack</option>
                <option value="Quishing (Malicious QR Code Deception)">📷 Quishing (Malicious QR Code Redirection)</option>
              </select>
            </div>

            {/* Step 2: Threat Severity Level */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                2. Assessed Threat Severity Level
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

            {/* Step 3: Indicator of Compromise (IoC) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                  3. Identified Indicator of Compromise (IoC)
                </label>
                <span className="text-red-400 font-mono text-[10px]">*Required from VM inspection</span>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. security@northstar-systems.test.invalid, n0rthstar-systems.test, login-portal.test..."
                value={ioc}
                onChange={e => setIoc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-600 text-xs"
              />
              <div className="text-[10px] text-slate-500">
                💡 Inspect the VM on the right (sender headers, reply-to domain, or link destination URL) to extract the genuine IoC.
              </div>
            </div>

            {/* Step 4: Observed Red Flags Forensics */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                4. Observed Forensic Red Flags (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableRedFlags.map((flag, idx) => {
                  const isChecked = selectedRedFlags.includes(flag);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleRedFlag(flag)}
                      className={`p-2 rounded-lg border text-left text-xs transition flex items-start gap-2 ${
                        isChecked
                          ? 'bg-cyan-950/40 border-cyan-600 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] border flex-shrink-0 ${
                        isChecked ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-700'
                      }`}>
                        {isChecked && '✓'}
                      </span>
                      <span className="leading-tight">{flag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Containment Action */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                5. Automated Containment / Defensive Action
              </label>
              <select
                value={containmentAction}
                onChange={e => setContainmentAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="block-domain">🛡 Block Domain &amp; Deploy Perimeter DNS Sinkhole</option>
                <option value="isolate-endpoint">🔌 Isolate Endpoint Host Machine from Corporate Network</option>
                <option value="revoke-tokens">🔑 Revoke Active User Session Tokens &amp; Force MFA Reset</option>
                <option value="quarantine-file">☣ Quarantine File Attachment &amp; Submit to EDR Sandbox</option>
                <option value="purge-mail">📬 Purge Malicious Campaign Across Org Mailboxes</option>
              </select>
            </div>

            {/* Step 6: Analyst Investigation Notes */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                6. Analyst Investigation Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Describe detected red flags, psychological triggers used, or evidence gathered during inspection..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 text-xs leading-relaxed"
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
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 font-mono"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Containment Rules...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>CLASSIFY &amp; CONTAIN THREAT</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

