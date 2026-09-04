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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'var(--blur)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh]"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: isCritical ? 'var(--accent-danger)' : isHigh ? 'var(--accent-warning)' : 'var(--border-default)',
          boxShadow: isCritical ? 'var(--glow-danger, var(--shadow-xl))' : 'var(--shadow-xl)',
        }}
      >
        {/* Top Header Banner */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b"
          style={{
            background: isCritical ? 'var(--accent-danger-faint)' : 'var(--accent-warning-faint)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl border flex items-center justify-center"
              style={{
                background: isCritical ? 'var(--accent-danger-faint)' : 'var(--accent-warning-faint)',
                borderColor: isCritical ? 'var(--accent-danger-border)' : 'var(--accent-warning-border)',
                color: isCritical ? 'var(--accent-danger)' : 'var(--accent-warning)',
              }}
            >
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-danger)' }}>
                  Threat Detection Intercept
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono"
                  style={{
                    background: isCritical ? 'var(--accent-danger-faint)' : 'var(--accent-warning-faint)',
                    color: isCritical ? 'var(--accent-danger)' : 'var(--accent-warning)',
                    border: `1px solid ${isCritical ? 'var(--accent-danger-border)' : 'var(--accent-warning-border)'}`,
                  }}
                >
                  {threat.riskLevel} RISK · SCORE {threat.score}/100
                </span>
              </div>
              <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Activity Paused by Threat Detection Engine
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Destination Callout */}
          <div
            className="p-3.5 rounded-xl space-y-1"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5 font-medium">
                <ExternalLink className="w-3.5 h-3.5" />
                Target Destination
              </span>
              <span className="font-mono font-semibold" style={{ color: 'var(--accent-danger)' }}>Paused Before Load</span>
            </div>
            <div
              className="font-mono text-xs break-all p-2.5 rounded-lg select-all"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--accent-warning)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {threat.url}
            </div>
          </div>

          {/* Multi-Provider Intelligence Consensus Badges */}
          {threat.providers && threat.providers.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Layers className="w-3.5 h-3.5" style={{ color: 'var(--accent-ai)' }} />
                Multi-Provider Intelligence Consensus
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {threat.providers.map((p, idx) => {
                  const isMal = p.classification === 'malicious';
                  const isSus = p.classification === 'suspicious';
                  const isClean = p.classification === 'no_known_threat';

                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-xl text-[11px] flex flex-col justify-between"
                      style={{
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{p.provider}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                          style={{
                            background: isMal
                              ? 'var(--accent-danger-faint)'
                              : isSus
                              ? 'var(--accent-warning-faint)'
                              : isClean
                              ? 'var(--accent-success-faint)'
                              : 'var(--surface-2)',
                            color: isMal
                              ? 'var(--accent-danger)'
                              : isSus
                              ? 'var(--accent-warning)'
                              : isClean
                              ? 'var(--accent-success)'
                              : 'var(--text-muted)',
                            border: `1px solid ${
                              isMal
                                ? 'var(--accent-danger-border)'
                                : isSus
                                ? 'var(--accent-warning-border)'
                                : isClean
                                ? 'var(--accent-success-border)'
                                : 'var(--border-subtle)'
                            }`,
                          }}
                        >
                          {isMal ? 'MALICIOUS' : isSus ? 'SUSPICIOUS' : isClean ? 'CLEAN' : 'STANDBY'}
                        </span>
                        {p.detections?.malicious !== undefined && (
                          <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>
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
            className="p-4 rounded-xl relative overflow-hidden"
            style={{
              background: 'var(--accent-ai-faint)',
              border: '1px solid var(--accent-ai-border)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="p-1 rounded-lg flex items-center justify-center"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--accent-ai)',
                  border: '1px solid var(--accent-ai-border)',
                }}
              >
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold tracking-wide uppercase flex items-center gap-1" style={{ color: 'var(--accent-ai)' }}>
                FlotBot AI Security Coach Analysis
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {threat.aiExplanation ||
                'This destination exhibits high-risk indicators commonly associated with phishing attacks, credential harvesting, or deceptive domain impersonation. Do not enter credentials or execute downloads.'}
            </p>
          </div>

          {/* Detected Risk Heuristics */}
          {threat.warnings && threat.warnings.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--accent-warning)' }} />
                Detection Engine Telemetry Flags
              </h4>
              <div className="space-y-1">
                {threat.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="text-xs flex items-start gap-2 p-2 rounded-lg"
                    style={{
                      background: 'var(--accent-danger-faint)',
                      border: '1px solid var(--accent-danger-border)',
                      color: 'var(--accent-danger)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent-danger)' }} />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human-in-the-Loop Acknowledgment Gate */}
          <div
            className="p-3.5 rounded-xl space-y-2.5"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
            }}
          >
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 rounded w-4 h-4"
              />
              <span className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
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
                  className="w-full text-xs px-3 py-2 rounded-lg focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border-default)',
          }}
        >
          <button
            type="button"
            onClick={handleSafeExit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: 'var(--accent-success)',
              color: '#FFFFFF',
              boxShadow: 'var(--glow-success)',
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            Return to Safety (Recommended)
          </button>

          <button
            type="button"
            onClick={handleOverrideProceed}
            disabled={!acknowledged || isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all"
            style={{
              ...(acknowledged
                ? {
                    background: 'var(--accent-warning-faint)',
                    color: 'var(--accent-warning)',
                    borderColor: 'var(--accent-warning-border)',
                    cursor: 'pointer',
                  }
                : {
                    background: 'var(--surface-2)',
                    color: 'var(--text-muted)',
                    borderColor: 'var(--border-default)',
                    cursor: 'not-allowed',
                    opacity: 0.6,
                  }),
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Acknowledge Risk & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
