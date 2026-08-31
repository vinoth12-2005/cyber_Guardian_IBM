import React from 'react';
import type { SuspiciousActivityItem, RiskLevel } from '../../types/dashboard';
import {
  Globe, KeyRound, Mail, QrCode, FileCode, ShieldAlert, ChevronRight, Sparkles,
} from 'lucide-react';

interface SuspiciousActivityHistoryProps {
  activities: SuspiciousActivityItem[];
  onSelectActivity: (activity: SuspiciousActivityItem) => void;
}

export const SuspiciousActivityHistory: React.FC<SuspiciousActivityHistoryProps> = ({
  activities,
  onSelectActivity,
}) => {
  const getCategoryIcon = (category: SuspiciousActivityItem['category']) => {
    const s = { width: 14, height: 14 };
    switch (category) {
      case 'Suspicious Website': return <Globe    style={{ ...s, color: 'var(--accent-info)' }} />;
      case 'Fake Login':         return <KeyRound style={{ ...s, color: 'var(--accent-warning)' }} />;
      case 'Phishing Email':     return <Mail     style={{ ...s, color: 'var(--accent-primary)' }} />;
      case 'Scam QR':            return <QrCode   style={{ ...s, color: 'var(--accent-danger)' }} />;
      case 'Malware Link':       return <FileCode style={{ ...s, color: 'var(--accent-danger)' }} />;
    }
  };

  const getRiskStyle = (risk: RiskLevel) => {
    switch (risk) {
      case 'Dangerous':  return { bg: 'var(--accent-danger-faint)',  color: 'var(--accent-danger)',  border: 'var(--accent-danger-border)' };
      case 'Suspicious': return { bg: 'var(--accent-warning-faint)', color: 'var(--accent-warning)', border: 'var(--accent-warning-border)' };
      default:           return { bg: 'var(--accent-success-faint)', color: 'var(--accent-success)', border: 'var(--accent-success-border)' };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShieldAlert className="w-4 h-4" style={{ color: 'var(--accent-warning)' }} strokeWidth={2} />
            Suspicious Threat Timeline
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            AI telemetry timeline of detected threat vectors
          </p>
        </div>
        <span
          className="badge"
          style={{ background: 'var(--accent-warning-faint)', color: 'var(--accent-warning)', borderColor: 'var(--accent-warning-border)' }}
        >
          {activities.length} Incidents
        </span>
      </div>

      {/* Timeline */}
      <div className="relative pl-7 space-y-4">
        {/* Vertical line */}
        <div
          className="absolute left-3 top-2 bottom-2 w-px"
          style={{ background: 'linear-gradient(to bottom, var(--accent-primary), var(--border-subtle))' }}
        />

        {activities.map((item, idx) => {
          const riskStyle = getRiskStyle(item.riskLevel);
          return (
            <div key={item.id} className="relative group">
              {/* Timeline dot */}
              <div
                className="absolute -left-7 top-2 w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-125"
                style={{
                  background: 'var(--bg-elevated)',
                  border: `2px solid ${idx === 0 ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: idx === 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                />
              </div>

              {/* Card */}
              <div
                className="p-4 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-medium)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'; }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                    >
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        {item.category}
                        <span
                          className="badge"
                          style={{ background: riskStyle.bg, color: riskStyle.color, borderColor: riskStyle.border, fontSize: '9px' }}
                        >
                          {item.riskLevel.toUpperCase()}
                        </span>
                      </h4>
                      <p className="text-[11px] truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                        {item.target}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {item.date}
                  </span>
                </div>

                {/* AI insight */}
                <div
                  className="p-3 rounded-xl flex items-start gap-2 text-xs mb-3"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} strokeWidth={1.75} />
                  <div className="flex-1 leading-relaxed">
                    <span className="font-semibold block mb-0.5" style={{ color: 'var(--accent-primary)' }}>
                      AI Assessment:
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.aiExplanation}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onSelectActivity(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                  >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
