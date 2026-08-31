import React, { useState } from 'react';
import type { AttackTrendItem } from '../../types/dashboard';
import {
  Flame, Mic, QrCode, BellRing, MessageSquare, KeyRound, Landmark,
  ChevronDown, ChevronUp, ShieldCheck,
} from 'lucide-react';

interface AttackTrendLearningProps {
  trends: AttackTrendItem[];
}

export const AttackTrendLearning: React.FC<AttackTrendLearningProps> = ({ trends }) => {
  const [expandedId, setExpandedId] = useState<string | null>(trends[0]?.id || null);

  const getIcon = (name: string) => {
    const s = { width: 16, height: 16 };
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

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Flame className="w-4 h-4" style={{ color: 'var(--accent-warning)' }} strokeWidth={2} />
            Attack Trend Learning
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Threat vectors rising globally across digital platforms
          </p>
        </div>
        <span
          className="badge"
          style={{ background: 'var(--accent-warning-faint)', color: 'var(--accent-warning)', borderColor: 'var(--accent-warning-border)' }}
        >
          {trends.length} Trending
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="p-5 rounded-xl flex flex-col justify-between transition-all duration-300"
              style={{
                background: isExpanded ? 'var(--surface-2)' : 'var(--surface-1)',
                border: isExpanded ? '1px solid var(--border-medium)' : '1px solid var(--border-default)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                  >
                    {getIcon(item.iconName)}
                  </div>
                  <span
                    className="badge"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)', fontSize: '9px' }}
                  >
                    {item.difficulty}
                  </span>
                </div>

                <h4 className="text-[13px] font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  {item.attackName}
                </h4>
                <p className="text-[11px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>

                {/* Popularity meter */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[10px]">
                    <span style={{ color: 'var(--text-muted)' }}>Threat Popularity</span>
                    <span className="font-semibold" style={{ color: 'var(--accent-warning)' }}>{item.popularity}%</span>
                  </div>
                  <div className="progress-track h-1">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.popularity}%`,
                        background: 'linear-gradient(to right, var(--accent-warning), var(--accent-danger))',
                      }}
                    />
                  </div>
                </div>

                {/* Prevention tips */}
                {isExpanded && (
                  <div
                    className="mt-3 pt-3 space-y-2 text-xs animate-fade-in-up"
                    style={{ borderTop: '1px solid var(--border-subtle)' }}
                  >
                    <span
                      className="text-[11px] font-semibold flex items-center gap-1"
                      style={{ color: 'var(--accent-success)' }}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      Prevention:
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {item.preventionTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-success)' }}>›</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Expand toggle */}
              <div
                className="mt-4 pt-3"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)')}
                >
                  {isExpanded ? 'Hide Tips' : 'View Prevention Tips'}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
