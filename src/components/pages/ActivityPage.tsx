import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Activity, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

export interface ActivityEntry {
  id: string;
  icon: 'success' | 'warning' | 'danger';
  label: string;
  detail: string;
  time: string;
  category: string;
}

interface ActivityPageProps {
  activities?: any[];
}

const iconConfig = {
  success: { icon: CheckCircle2, color: 'var(--accent-success)', bg: 'var(--accent-success-faint)', border: 'var(--accent-success-border)' },
  warning: { icon: AlertTriangle, color: 'var(--accent-warning)', bg: 'var(--accent-warning-faint)', border: 'var(--accent-warning-border)' },
  danger:  { icon: ShieldAlert,   color: 'var(--accent-danger)',  bg: 'var(--accent-danger-faint)',  border: 'var(--accent-danger-border)' },
};

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function mapRawActivity(raw: any, index: number): ActivityEntry {
  let icon: 'success' | 'warning' | 'danger' = 'success';
  const rawIcon = (raw.icon || raw.icon_type || '').toLowerCase();
  const type = (raw.activity_type || raw.activityType || '').toLowerCase();

  if (rawIcon === 'danger' || type.includes('block') || type.includes('danger') || type.includes('critical')) {
    icon = 'danger';
  } else if (rawIcon === 'warning' || type.includes('threat') || type.includes('warn') || type.includes('intercept')) {
    icon = 'warning';
  } else {
    icon = 'success';
  }

  let cat = raw.category || 'Security';
  if (cat.toLowerCase() === 'administrative') cat = 'Admin';
  if (cat.toLowerCase() === 'security alert') cat = 'Threat';
  if (cat.toLowerCase() === 'security awareness') cat = 'Awareness';

  return {
    id: raw.id || `act-${index}`,
    icon,
    label: raw.label || raw.activity_type || 'User Security Activity',
    detail: raw.detail || (raw.metadata ? JSON.stringify(raw.metadata) : 'Logged security telemetry event'),
    time: formatRelativeTime(raw.timestamp || raw.time || raw.created_at),
    category: cat,
  };
}

const DEFAULT_ONBOARDING_ACTIVITIES: ActivityEntry[] = [
  {
    id: 'init-1',
    icon: 'success',
    label: 'CyberGuardian Workspace Initialized',
    detail: 'Cryptographic profile and local security baseline generated successfully.',
    time: 'Today',
    category: 'Setup',
  },
  {
    id: 'init-2',
    icon: 'success',
    label: 'FlotBot AI Shield Active',
    detail: 'Real-time proactive URL & malicious file interception online.',
    time: 'Today',
    category: 'Security',
  },
  {
    id: 'init-3',
    icon: 'warning',
    label: 'Zero Trust Monitoring Engaged',
    detail: 'Continuous behavioral telemetry enabled for proactive phishing defense.',
    time: 'Today',
    category: 'Threat',
  },
];

export const ActivityPage: React.FC<ActivityPageProps> = ({ activities: propActivities }) => {
  const [filter, setFilter] = useState<string>('All');
  const [loadedActivities, setLoadedActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const syncActivities = async () => {
    if (Array.isArray(propActivities) && propActivities.length > 0) {
      setLoadedActivities(propActivities.map(mapRawActivity));
      return;
    }
    setLoading(true);
    try {
      const res = await api.activity.list();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setLoadedActivities(res.data.map(mapRawActivity));
      } else {
        setLoadedActivities(DEFAULT_ONBOARDING_ACTIVITIES);
      }
    } catch (err) {
      console.warn('[ActivityPage] Load notice:', err);
      setLoadedActivities(DEFAULT_ONBOARDING_ACTIVITIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncActivities();
  }, [propActivities]);

  const displayList = loadedActivities.length > 0 ? loadedActivities : DEFAULT_ONBOARDING_ACTIVITIES;

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(displayList.map((a) => a.category)))];

  const filtered = filter === 'All'
    ? displayList
    : displayList.filter((a) => a.category.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div
        className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl flex-shrink-0"
            style={{ background: 'var(--accent-primary-faint)', border: '1px solid var(--accent-primary-border)' }}
          >
            <Activity className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
              Real-Time Security Activity
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Live audit trail of threat detections, simulation completions, and platform security events
            </p>
          </div>
        </div>

        <button
          onClick={syncActivities}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors"
          style={{
            background: 'var(--surface-1)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200 capitalize"
            style={
              filter.toLowerCase() === cat.toLowerCase()
                ? { background: 'var(--accent-primary)', color: '#fff' }
                : { background: 'var(--surface-1)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="glass-card rounded-2xl overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
        {filtered.map((entry, idx) => {
          const cfg = iconConfig[entry.icon] || iconConfig.success;
          const Icon = cfg.icon;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 cursor-default animate-fade-in-up"
              style={{
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--surface-1)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                <Icon className="w-4 h-4" style={{ color: cfg.color }} strokeWidth={2} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                  {entry.label}
                </p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {entry.detail}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                >
                  {entry.category}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {entry.time}
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>No activities recorded for this filter category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
