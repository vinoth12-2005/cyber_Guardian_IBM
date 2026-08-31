import React from 'react';
import type { SuspiciousActivityItem, AnalysisHistoryItem } from '../../types/dashboard';
import { X, ShieldAlert, Server, MapPin, Terminal, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ActivityDetailModalProps {
  activity: SuspiciousActivityItem | AnalysisHistoryItem | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activity, onClose }) => {
  if (!activity) return null;

  const isSuspiciousItem = 'aiExplanation' in activity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in-up"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl p-6 overflow-hidden animate-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-4 mb-2"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'var(--accent-danger-faint)', color: 'var(--accent-danger)', border: '1px solid var(--accent-danger-border)' }}
            >
              <ShieldAlert className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {isSuspiciousItem ? activity.category : `${activity.type} Security Analysis`}
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Incident ID: #{activity.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Target */}
          <div
            className="p-3 rounded-xl text-xs break-all"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', color: 'var(--accent-info)' }}
          >
            <span className="block text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>TARGET INSPECTED:</span>
            {activity.target}
          </div>

          {/* AI forensic */}
          {isSuspiciousItem && (
            <div
              className="p-4 rounded-xl space-y-2 text-xs"
              style={{ background: 'var(--accent-primary-faint)', border: '1px solid var(--accent-primary-border)' }}
            >
              <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>
                <Terminal className="w-3.5 h-3.5" />
                AI Neural Assessment:
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {(activity as SuspiciousActivityItem).aiExplanation}
              </p>
            </div>
          )}

          {/* Technical details */}
          {isSuspiciousItem && (activity as SuspiciousActivityItem).technicalDetails && (
            <div className="space-y-3">
              <h4
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Technical Indicators of Compromise
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div
                  className="p-3 rounded-xl flex items-center gap-2"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                >
                  <Server className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>IP Address</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {(activity as SuspiciousActivityItem).technicalDetails.ipAddress}
                    </span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-xl flex items-center gap-2"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                >
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>Geolocation</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {(activity as SuspiciousActivityItem).technicalDetails.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* IoC list */}
              <div
                className="p-3 rounded-xl text-xs space-y-1.5"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
              >
                <span className="block text-[10px] font-medium mb-2" style={{ color: 'var(--accent-warning)' }}>
                  Detected Anomaly Signatures:
                </span>
                <ul className="space-y-1.5 pl-1">
                  {(activity as SuspiciousActivityItem).technicalDetails.indicatorsOfCompromise.map((ioc, i) => (
                    <li key={i} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-warning)' }} />
                      {ioc}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remediation */}
              <div
                className="p-3 rounded-xl flex items-center gap-2 text-xs"
                style={{ background: 'var(--accent-success-faint)', border: '1px solid var(--accent-success-border)' }}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-success)' }} />
                <div>
                  <span className="font-semibold block text-[10px]" style={{ color: 'var(--accent-success)' }}>
                    Automated Mitigation:
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {(activity as SuspiciousActivityItem).technicalDetails.remediationAction}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis details */}
          {!isSuspiciousItem && (activity as AnalysisHistoryItem).details && (
            <div
              className="p-4 rounded-xl space-y-3 text-xs"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
            >
              {[
                { label: 'THREAT CLASSIFICATION', value: (activity as AnalysisHistoryItem).details?.threatType, color: 'var(--text-primary)' },
                { label: 'ENGINE DETECTIONS',     value: (activity as AnalysisHistoryItem).details?.engineDetections, color: 'var(--accent-info)' },
                { label: 'RECOMMENDED ACTION',    value: (activity as AnalysisHistoryItem).details?.recommendation, color: 'var(--text-secondary)' },
              ].map((row) => (
                <div key={row.label}>
                  <span className="text-[10px] block mb-0.5" style={{ color: 'var(--text-muted)' }}>
                    {row.label}:
                  </span>
                  <span className="font-medium" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="pt-4 flex justify-end"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: 'var(--accent-primary)',
              color: '#fff',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
