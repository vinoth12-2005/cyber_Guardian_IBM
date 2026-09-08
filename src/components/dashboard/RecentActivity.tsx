import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

interface ActivityEntry {
  id: string;
  icon: 'success' | 'warning' | 'danger';
  label: string;
  detail: string;
  time: string;
}

interface RecentActivityProps {
  activities?: any[];
  onViewAll?: () => void;
}

const DEFAULT_RECENT_ACTIVITIES: ActivityEntry[] = [
  { id: '1', icon: 'success', label: 'Workforce Workspace Initialized', detail: 'Local cryptographic security profile active', time: 'Just now' },
  { id: '2', icon: 'success', label: 'FlotBot AI Shield Online',        detail: 'Zero-trust real-time URL & IOC protection',    time: 'Today' },
  { id: '3', icon: 'warning', label: 'Proactive Telemetry Engaged',     detail: 'Continuous behavioral analysis active',        time: 'Today' },
];

const iconConfig = {
  success: { icon: CheckCircle2, color: 'var(--accent-success)',  bg: 'var(--accent-success-faint)',  border: 'var(--accent-success-border)' },
  warning: { icon: AlertTriangle, color: 'var(--accent-warning)', bg: 'var(--accent-warning-faint)',  border: 'var(--accent-warning-border)' },
  danger:  { icon: ShieldAlert,   color: 'var(--accent-danger)',  bg: 'var(--accent-danger-faint)',   border: 'var(--accent-danger-border)' },
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities: rawActivities, onViewAll }) => {
  const displayActivities: ActivityEntry[] = (Array.isArray(rawActivities) && rawActivities.length > 0)
    ? rawActivities.slice(0, 5).map((raw, idx) => {
        let icon: 'success' | 'warning' | 'danger' = 'success';
        const rawIcon = (raw.icon || raw.icon_type || '').toLowerCase();
        const type = (raw.activity_type || raw.activityType || '').toLowerCase();
        if (rawIcon === 'danger' || type.includes('block') || type.includes('danger')) icon = 'danger';
        else if (rawIcon === 'warning' || type.includes('threat') || type.includes('warn') || type.includes('intercept')) icon = 'warning';

        return {
          id: raw.id || `act-${idx}`,
          icon,
          label: raw.label || raw.activity_type || 'Security Action',
          detail: raw.detail || (raw.metadata ? JSON.stringify(raw.metadata) : 'Telemetry event'),
          time: raw.timestamp ? new Date(raw.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
        };
      })
    : DEFAULT_RECENT_ACTIVITIES;
  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[13px] font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Recent Activity
        </h3>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-[11px] font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)')}
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-1 flex-1">
        {displayActivities.map((entry) => {
          const cfg = iconConfig[entry.icon];
          const Icon = cfg.icon;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 cursor-default"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--surface-1)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} strokeWidth={2} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] font-medium leading-tight truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {entry.label}
                </p>
                <p
                  className="text-[11px] mt-0.5 truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {entry.detail}
                </p>
              </div>

              <span
                className="text-[10px] flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {entry.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
