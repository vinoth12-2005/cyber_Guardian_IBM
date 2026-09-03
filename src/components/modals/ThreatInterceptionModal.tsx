import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Info,
  CheckCircle2,
  Lock,
  ArrowRight,
  XCircle,
  Bot,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

export interface ThreatProviderResult {
  provider: string;
  status: string;
  classification: string;
  confidence?: number;
  detections?: { malicious?: number; suspicious?: number; total?: number };
}

export interface ThreatInterceptionData {
  alertId?: string;
  url: string;
  domain?: string;
  score: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  warnings: string[];
  mitre?: string[];
  providers?: ThreatProviderResult[];
  evidence?: string[];
  aiExplanation?: string;
  onProceed?: () => void;
  onAbort?: () => void;
}

interface ThreatInterceptionModalProps {
  threat: ThreatInterceptionData | null;
  onClose: () => void;
}

export const ThreatInterceptionModal: React.FC<ThreatInterceptionModalProps> = ({
  threat,
  onClose,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!threat) return null;

  const isCritical = threat.riskLevel === 'CRITICAL' || threat.score >= 75;
  const isHigh = threat.riskLevel === 'HIGH' || threat.score >= 50;

  const handleSafeExit = async () => {
    setIsSubmitting(true);
    try {
      if (threat.alertId) {
        await api.flotbot.recordDecision(threat.alertId, 'safe_exit');
      }
      toast.success('🛡️ Safe choice! Dangerous activity aborted. +20 Awareness XP', {
        duration: 4000,
        style: {
          background: '#0f172a',
          color: '#38bdf8',
          border: '1px solid #0284c7',
        },
      });
      threat.onAbort?.();
      onClose();
    } catch (e) {
      console.error(e);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverrideProceed = async () => {
    if (!acknowledged) {
      toast.error('Please check the risk acknowledgment box to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (threat.alertId) {
        await api.flotbot.recordDecision(
          threat.alertId,
          'override_proceed',
          reason || 'User confirmed awareness and bypassed warning'
        );
      }
      toast('⚠️ Warning override registered. Logged to Admin Security Inspection.', {
        icon: '⚠️',
        duration: 5000,
        style: {
          background: '#1e1b4b',
          color: '#facc15',
          border: '1px solid #eab308',
        },
      });
      threat.onProceed?.();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to register acknowledgment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh]"
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(11, 15, 25, 0.98))',
          borderColor: isCritical ? 'rgba(239, 68, 68, 0.5)' : isHigh ? 'rgba(249, 115, 22, 0.5)' : 'rgba(234, 179, 8, 0.5)',
          boxShadow: isCritical
            ? '0 0 50px -10px rgba(239, 68, 68, 0.3)'
            : '0 0 40px -10px rgba(249, 115, 22, 0.25)',
        }}
      >
        {/* Top Header Banner */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b"
          style={{
            background: isCritical
              ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(15, 23, 42, 0.6))'
              : 'linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(15, 23, 42, 0.6))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl border flex items-center justify-center"
              style={{
                background: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                borderColor: isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(249, 115, 22, 0.4)',
                color: isCritical ? '#ef4444' : '#f97316',
              }}
            >
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Threat Detection Intercept
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono"
                  style={{
                    background: isCritical ? 'rgba(239, 68, 68, 0.25)' : 'rgba(249, 115, 22, 0.25)',
                    color: isCritical ? '#f87171' : '#fb923c',
                    border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(249, 115, 22, 0.4)'}`,
                  }}
                >
                  {threat.riskLevel} RISK · SCORE {threat.score}/100
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Activity Paused by Threat Detection Engine
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Destination Callout */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                Target Destination
              </span>
              <span className="font-mono text-red-400 font-semibold">Paused Before Load</span>
            </div>
            <div className="font-mono text-xs text-amber-200 break-all bg-slate-950/80 p-2.5 rounded-lg border border-white/5 select-all">
              {threat.url}
            </div>
          </div>

          {/* Multi-Provider Intelligence Consensus Badges */}
          {threat.providers && threat.providers.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Multi-Provider Intelligence Consensus
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {threat.providers.map((p, idx) => {
                  const isMal = p.classification === 'malicious';
                  const isSus = p.classification === 'suspicious';
                  const isClean = p.classification === 'no_known_threat';
                  const isUnavail = p.status === 'unavailable';

                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] flex flex-col justify-between"
                    >
                      <div className="font-bold text-slate-300 truncate">{p.provider}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isMal
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : isSus
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : isClean
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isMal ? 'MALICIOUS' : isSus ? 'SUSPICIOUS' : isClean ? 'CLEAN' : 'STANDBY'}
                        </span>
                        {p.detections?.malicious !== undefined && (
                          <span className="font-mono text-[9px] text-slate-400">
                            {p.detections.malicious}/{p.detections.total || 70}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Security Coach Explanation */}
          <div
            className="p-4 rounded-xl border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
              borderColor: 'rgba(56, 189, 248, 0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold tracking-wide text-cyan-300 uppercase flex items-center gap-1">
                FlotBot AI Security Coach Analysis
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line">
              {threat.aiExplanation ||
                'This destination exhibits high-risk indicators commonly associated with phishing attacks, credential harvesting, or deceptive domain impersonation. Do not enter credentials or execute downloads.'}
            </p>
          </div>

          {/* Detected Risk Heuristics */}
          {threat.warnings && threat.warnings.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Detection Engine Telemetry Flags
              </h4>
              <div className="space-y-1">
                {threat.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="text-xs flex items-start gap-2 p-2 rounded-lg bg-red-950/30 border border-red-900/40 text-red-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human-in-the-Loop Acknowledgment Gate */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 w-4 h-4"
              />
              <span className="text-xs text-slate-300 leading-snug">
                I understand that proceeding to this destination poses a security risk and may compromise credentials or download malicious software.
              </span>
            </label>

            {acknowledged && (
              <div className="animate-fade-in pt-1">
                <input
                  type="text"
                  placeholder="Optional: Justification reason for manual override..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSafeExit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Return to Safety (Recommended)
          </button>

          <button
            type="button"
            onClick={handleOverrideProceed}
            disabled={!acknowledged || isSubmitting}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all ${
              acknowledged
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 cursor-pointer'
                : 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Acknowledge Risk & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
