import React from 'react';
import type { QuickStatItem } from '../../types/dashboard';
import { Globe, Mail, QrCode, ShieldAlert, GraduationCap, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface QuickStatsProps {
  stats: QuickStatItem[];
}

// All stat-card icons use the same neutral icon colour — no rainbow
const getIcon = (name: string) => {
  const style = { width: 14, height: 14, color: 'var(--text-secondary)' };
  switch (name) {
    case 'Globe':         return <Globe         style={style} strokeWidth={1.75} />;
    case 'Mail':          return <Mail          style={style} strokeWidth={1.75} />;
    case 'QrCode':        return <QrCode        style={style} strokeWidth={1.75} />;
    case 'ShieldAlert':   return <ShieldAlert   style={style} strokeWidth={1.75} />;
    case 'GraduationCap': return <GraduationCap style={style} strokeWidth={1.75} />;
    case 'Zap':           return <Zap           style={style} strokeWidth={1.75} />;
    default:              return <Globe         style={style} strokeWidth={1.75} />;
  }
};

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 stagger">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="glass-card glass-card-interactive rounded-xl p-4 flex flex-col gap-3 animate-fade-in-up cursor-default"
        >
          {/* Icon — uniform surface background, no per-card colour */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-default)' }}
          >
            {getIcon(stat.iconName)}
          </div>

          {/* Value */}
          <div>
            <span
              className="text-xl font-bold block leading-tight tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {stat.value}
            </span>
            <span className="text-[11px] mt-0.5 block" style={{ color: 'var(--text-muted)' }}>
              {stat.title}
            </span>
          </div>

          {/* Trend — only green/red for up/down, no other colours */}
          <div className="flex items-center gap-1">
            {stat.isPositive
              ? <TrendingUp  className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-success)' }} />
              : <TrendingDown className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-danger)' }} />
            }
            <span
              className="text-[10px] font-medium"
              style={{ color: stat.isPositive ? 'var(--accent-success)' : 'var(--accent-danger)' }}
            >
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
