import React from 'react';
import type { AttackTrendItem } from '../../types/dashboard';
import { Flame, Mic, QrCode, BellRing, MessageSquare, KeyRound, Landmark, ArrowRight } from 'lucide-react';

interface AttackTrendPreviewProps {
  trends: AttackTrendItem[];
  onViewAll: () => void;
}

const getIcon = (name: string) => {
  const s = { width: 14, height: 14 };
  switch (name) {
    case 'Mic':           return <Mic           style={{ ...s, color: 'var(--accent-primary)' }} strokeWidth={1.75} />;
    case 'QrCode':        return <QrCode        style={{ ...s, color: 'var(--accent-info)' }} strokeWidth={1.75} />;
    case 'BellRing':      return <BellRing      style={{ ...s, color: 'var(--accent-warning)' }} strokeWidth={1.75} />;
    case 'MessageSquare': return <MessageSquare style={{ ...s, color: 'var(--accent-success)' }} strokeWidth={1.75} />;
    case 'KeyRound':      return <KeyRound      style={{ ...s, color: 'var(--accent-danger)' }} strokeWidth={1.75} />;
    case 'Landmark':      return <Landmark      style={{ ...s, color: 'var(--accent-activity)' }} strokeWidth={1.75} />;
    default:              return <Flame         style={{ ...s, color: 'var(--accent-warning)' }} strokeWidth={1.75} />;
  }
};

export const AttackTrendPreview: React.FC<AttackTrendPreviewProps> = ({ trends, onViewAll }) => {
  const preview = trends.slice(0, 3);

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-warning-faint)', border: '1px solid var(--accent-warning-border)' }}>
            <Flame className="w-3.5 h-3.5" style={{ color: 'var(--accent-warning)' }} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Attack Trends
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Top trending threat vectors</p>
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

      {/* Compact list — no expandable tips */}
      <div className="space-y-0">
        {preview.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-2.5"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            {/* Icon */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
            >
              {getIcon(item.iconName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {item.attackName}
              </p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {item.difficulty}
              </p>
            </div>

            {/* Popularity bar */}
            <div className="flex items-center gap-2 flex-shrink-0 w-20">
              <div className="flex-1 progress-track h-1">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.popularity}%`, background: 'var(--accent-primary)', opacity: 0.65 }}
                />
              </div>
              <span className="text-[10px] font-medium w-7 text-right" style={{ color: 'var(--text-muted)' }}>
                {item.popularity}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
