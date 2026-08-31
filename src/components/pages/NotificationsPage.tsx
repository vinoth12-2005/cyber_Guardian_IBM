import React, { useState } from 'react';
import {
  Bell,
  TrendingUp,
  FlaskConical,
  BarChart3,
  Sparkles,
  ShieldAlert,
  CheckCheck,
  Trash2,
  Filter,
} from 'lucide-react';
import type { NotificationItem } from '../../types/dashboard';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_META: Record<
  NotificationItem['type'],
  { icon: React.ElementType; colorVar: string; bgVar: string }
> = {
  score:          { icon: TrendingUp,   colorVar: 'var(--accent-primary)',  bgVar: 'var(--accent-primary-faint)' },
  simulation:     { icon: FlaskConical, colorVar: 'var(--accent-warning)',  bgVar: 'var(--accent-warning-faint)' },
  report:         { icon: BarChart3,    colorVar: 'var(--accent-success)',  bgVar: 'var(--accent-success-faint)' },
  recommendation: { icon: Sparkles,     colorVar: 'var(--accent-primary)',  bgVar: 'var(--accent-primary-faint)' },
  alert:          { icon: ShieldAlert,  colorVar: 'var(--accent-danger)',   bgVar: 'var(--accent-danger-faint)'  },
};

const FILTERS = ['All', 'Unread', 'score', 'simulation', 'report', 'recommendation', 'alert'] as const;
type FilterKey = typeof FILTERS[number];

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkAllAsRead,
  onMarkRead,
  onDelete,
}) => {
  const [filter, setFilter] = useState<FilterKey>('All');

  const filtered = notifications.filter((n) => {
    if (filter === 'All')    return true;
    if (filter === 'Unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">

      {/* Header row */}
      <div
        className="glass-card rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-primary-faint)', border: '1px solid var(--accent-primary-border)' }}
          >
            <Bell className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up — no unread notifications'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: 'var(--accent-primary)',
              background: 'var(--accent-primary-faint)',
              border: '1px solid var(--accent-primary-border)',
            }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-[11px] font-medium transition-all capitalize"
              style={{
                background: active ? 'var(--accent-primary)' : 'var(--bg-card)',
                color:      active ? '#fff' : 'var(--text-secondary)',
                border:     active ? '1px solid transparent' : '1px solid var(--border-default)',
              }}
            >
              {f === 'All' && unreadCount > 0 && !active
                ? `All (${unreadCount})`
                : f}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div
          className="glass-card rounded-2xl p-12 text-center"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            No notifications here
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Try a different filter or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className="glass-card rounded-xl px-4 py-3 flex items-start gap-3 group transition-all"
                style={{
                  borderColor: n.read ? 'var(--border-subtle)' : 'var(--accent-primary-border)',
                  background:  n.read ? 'var(--bg-card)' : 'var(--accent-primary-faint)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: meta.bgVar, border: `1px solid ${meta.colorVar}30` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: meta.colorVar }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-[13px] leading-snug ${n.read ? '' : 'font-semibold'}`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                        style={{ background: 'var(--accent-primary)' }}
                      />
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {n.description}
                  </p>
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {n.timestamp}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg transition-colors hover:bg-black/10"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(n.id)}
                    title="Dismiss"
                    className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
