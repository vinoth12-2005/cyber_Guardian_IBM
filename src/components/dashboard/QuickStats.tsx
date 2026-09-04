import React from 'react';
import type { QuickStatItem } from '../../types/dashboard';
import { Globe, Mail, QrCode, ShieldAlert, GraduationCap, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface QuickStatsProps {
  stats: QuickStatItem[];
}

interface SemanticTheme {
  iconColor: string;
  bgFaint: string;
  borderFaint: string;
}

const getSemanticTheme = (stat: QuickStatItem): SemanticTheme => {
  const title = stat.title.toLowerCase();
  if (title.includes('threat')) {
    return {
      iconColor: 'var(--accent-danger)',
      bgFaint: 'var(--accent-danger-faint)',
      borderFaint: 'var(--accent-danger-border)',
    };
  }
  if (title.includes('course')) {
    return {
      iconColor: 'var(--accent-primary)',
      bgFaint: 'var(--accent-primary-faint)',
      borderFaint: 'var(--accent-primary-border)',
    };
  }
  if (title.includes('simulation') || title.includes('drill')) {
    return {
      iconColor: 'var(--accent-ai)',
      bgFaint: 'var(--accent-ai-faint)',
      borderFaint: 'var(--accent-ai-border)',
    };
  }
  if (title.includes('audit') || title.includes('activit')) {
    return {
      iconColor: 'var(--accent-info)',
      bgFaint: 'var(--accent-info-faint)',
      borderFaint: 'var(--accent-info-border)',
    };
  }
  if (title.includes('certif') || title.includes('credential')) {
    return {
      iconColor: 'var(--accent-success)',
      bgFaint: 'var(--accent-success-faint)',
      borderFaint: 'var(--accent-success-border)',
    };
  }
  if (title.includes('streak')) {
    return {
      iconColor: 'var(--accent-activity)',
      bgFaint: 'var(--accent-activity-faint)',
      borderFaint: 'var(--accent-activity-border)',
    };
  }
  return {
    iconColor: 'var(--accent-primary)',
    bgFaint: 'var(--accent-primary-faint)',
    borderFaint: 'var(--accent-primary-border)',
  };
};

const getIcon = (name: string, color: string) => {
  const style = { width: 16, height: 16, color };
  switch (name) {
    case 'Globe':         return <Globe         style={style} strokeWidth={2} />;
    case 'Mail':          return <Mail          style={style} strokeWidth={2} />;
    case 'QrCode':        return <QrCode        style={style} strokeWidth={2} />;
    case 'ShieldAlert':   return <ShieldAlert   style={style} strokeWidth={2} />;
    case 'GraduationCap': return <GraduationCap style={style} strokeWidth={2} />;
    case 'Zap':           return <Zap           style={style} strokeWidth={2} />;
    default:              return <Globe         style={style} strokeWidth={2} />;
  }
};

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 stagger">
      {stats.map((stat) => {
        const theme = getSemanticTheme(stat);
        return (
          <div
            key={stat.id}
            className="glass-card glass-card-interactive rounded-xl p-4 flex flex-col gap-3 animate-fade-in-up cursor-default group relative overflow-hidden"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = theme.borderFaint;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
            }}
          >
            {/* Subtle top ambient glow from semantic theme */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 opacity-60 transition-opacity group-hover:opacity-100"
              style={{ background: theme.iconColor }}
            />

            {/* Icon — semantic surface background */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: theme.bgFaint, border: `1px solid ${theme.borderFaint}` }}
            >
              {getIcon(stat.iconName, theme.iconColor)}
            </div>

            {/* Value */}
            <div>
              <span
                className="text-xl font-bold block leading-tight tracking-tight font-mono"
                style={{ color: 'var(--text-primary)' }}
              >
                {stat.value}
              </span>
              <span className="text-[11px] mt-0.5 block font-medium" style={{ color: 'var(--text-muted)' }}>
                {stat.title}
              </span>
            </div>

            {/* Trend indicator */}
            <div className="flex items-center gap-1 mt-auto">
              {stat.isPositive
                ? <TrendingUp  className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-success)' }} />
                : <TrendingDown className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-danger)' }} />
              }
              <span
                className="text-[10px] font-semibold truncate"
                style={{ color: stat.isPositive ? 'var(--accent-success)' : 'var(--accent-danger)' }}
              >
                {stat.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
