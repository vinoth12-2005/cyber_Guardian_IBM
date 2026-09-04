import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

interface ActivityEntry {
  id: string;
  icon: 'success' | 'warning' | 'danger';
  label: string;
  detail: string;
  time: string;
  category: string;
}

const allActivities: ActivityEntry[] = [
  { id: '1',  icon: 'success', label: 'URL analysis completed',      detail: 'google.com',             time: '2 min ago',    category: 'Analysis' },
  { id: '2',  icon: 'success', label: 'Simulation completed',         detail: 'Phishing Awareness',     time: '18 min ago',   category: 'Simulation' },
  { id: '3',  icon: 'success', label: 'Course completed',              detail: 'Password Security',      time: '1 hour ago',   category: 'Learning' },
  { id: '4',  icon: 'warning', label: 'Suspicious email detected',    detail: 'invoice_2307.pdf',       time: '3 hours ago',  category: 'Threat' },
  { id: '5',  icon: 'danger',  label: 'Malware link blocked',         detail: 'auth-verify-login.net',  time: '5 hours ago',  category: 'Threat' },
  { id: '6',  icon: 'success', label: 'Email header scan passed',     detail: 'noreply@github.com',     time: '6 hours ago',  category: 'Analysis' },
  { id: '7',  icon: 'warning', label: 'Weak password detected',       detail: 'LinkedIn account',       time: '1 day ago',    category: 'Threat' },
  { id: '8',  icon: 'success', label: 'Two-factor auth enabled',      detail: 'Google account',         time: '1 day ago',    category: 'Settings' },
  { id: '9',  icon: 'danger',  label: 'Phishing attempt blocked',     detail: 'secure-bank-login.ru',   time: '2 days ago',   category: 'Threat' },
  { id: '10', icon: 'success', label: 'Security report generated',    detail: 'Weekly Summary',         time: '2 days ago',   category: 'Reports' },
  { id: '11', icon: 'success', label: 'Simulation completed',         detail: 'Ransomware Scenario',    time: '3 days ago',   category: 'Simulation' },
  { id: '12', icon: 'warning', label: 'Unknown device login attempt', detail: '192.168.12.44',          time: '4 days ago',   category: 'Threat' },
];

const iconConfig = {
  success: { icon: CheckCircle2, color: 'var(--accent-success)', bg: 'var(--accent-success-faint)', border: 'var(--accent-success-border)' },
  warning: { icon: AlertTriangle, color: 'var(--accent-warning)', bg: 'var(--accent-warning-faint)', border: 'var(--accent-warning-border)' },
  danger:  { icon: ShieldAlert,   color: 'var(--accent-danger)',  bg: 'var(--accent-danger-faint)',  border: 'var(--accent-danger-border)' },
};

const categories = ['All', 'Analysis', 'Simulation', 'Learning', 'Threat', 'Settings', 'Reports'];

export const ActivityPage: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');

  const filtered = filter === 'All'
    ? allActivities
    : allActivities.filter((a) => a.category === filter);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div
        className="glass-card rounded-2xl p-5 flex items-center gap-3"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div
          className="p-2.5 rounded-xl"
          style={{ background: 'var(--accent-activity-faint)', border: '1px solid var(--accent-activity-border)' }}
        >
          <Activity className="w-5 h-5" style={{ color: 'var(--accent-activity)' }} />
        </div>
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Recent Activity
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Full timeline of your security events and actions
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200"
            style={
              filter === cat
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
          const cfg = iconConfig[entry.icon];
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
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>No activity for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
