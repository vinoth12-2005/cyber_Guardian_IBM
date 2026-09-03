import React from 'react';
import type { SuspiciousActivityItem } from '../../types/dashboard';
import { ShieldAlert, ChevronRight, ArrowRight } from 'lucide-react';

interface SuspiciousActivityPreviewProps {
  activities: SuspiciousActivityItem[];
  onSelectActivity: (activity: SuspiciousActivityItem) => void;
  onViewAll: () => void;
}

export const SuspiciousActivityPreview: React.FC<SuspiciousActivityPreviewProps> = ({
  activities,
  onSelectActivity,
  onViewAll,
}) => {
  // Show top 2 Dangerous incidents first, then Suspicious
  const preview = [...activities]
    .sort((a, b) => {
      const order: Record<string, number> = { Dangerous: 0, Suspicious: 1, Safe: 2 };
      return (order[a.riskLevel] ?? 2) - (order[b.riskLevel] ?? 2);
    })
    .slice(0, 2);

  const riskStyle = (risk: string) => {
    if (risk === 'Dangerous') return { color: 'var(--accent-danger)', bg: 'var(--accent-danger-faint)', border: 'var(--accent-danger-border)' };
    if (risk === 'Suspicious') return { color: 'var(--accent-warning)', bg: 'var(--accent-warning-faint)', border: 'var(--accent-warning-border)' };
    return { color: 'var(--accent-success)', bg: 'var(--accent-success-faint)', border: 'var(--accent-success-border)' };
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-warning-faint)', border: '1px solid var(--accent-warning-border)' }}>
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: 'var(--accent-warning)' }} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Suspicious Activity
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Top threats detected</p>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-[11px] font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)')}
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Incidents */}
      <div className="space-y-2">
        {preview.length === 0 ? (
          <div className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            No suspicious activities or active threats detected.
          </div>
        ) : (
          preview.map((item) => {
            const rs = riskStyle(item.riskLevel);
            return (
              <div
                key={item.id}
                className="p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-medium)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)')}
                onClick={() => onSelectActivity(item)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="badge text-[10px]" style={{ background: rs.bg, color: rs.color, borderColor: rs.border }}>
                      {item.riskLevel.toUpperCase()}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.date}</span>
                  </div>
                  <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.category}</p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.target}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
