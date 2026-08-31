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
        {preview.map((item) => {
          const rs = riskStyle(item.riskLevel);
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-medium)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)')}
              onClick={() => onSelectActivity(item)}
            >
              <span
                className="badge flex-shrink-0"
                style={{ background: rs.bg, color: rs.color, borderColor: rs.border, fontSize: '9px' }}
              >
                {item.riskLevel.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{item.category}</p>
                <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.target}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.date}</span>
                <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
