import React from 'react';
import type { NotificationItem } from '../../types/dashboard';
import { Bell, TrendingUp, ShieldAlert, FileText, Sparkles, CheckCheck } from 'lucide-react';

interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  onMarkAllAsRead,
  onClose,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'score':      return <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />;
      case 'simulation': return <Sparkles   className="w-3.5 h-3.5" style={{ color: 'var(--accent-purple)' }} />;
      case 'report':     return <FileText   className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />;
      case 'alert':      return <ShieldAlert className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />;
      default:           return <Bell       className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl z-50 overflow-hidden animate-scale-in"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="badge"
              style={{
                background: 'rgba(6,182,212,0.10)',
                color: 'var(--accent-cyan)',
                borderColor: 'rgba(6,182,212,0.22)',
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'var(--accent-cyan)' }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            No notifications right now.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 px-4 py-3 transition-colors cursor-default"
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: !item.read ? 'rgba(6,182,212,0.04)' : 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = !item.read
                  ? 'rgba(6,182,212,0.04)'
                  : 'transparent')
              }
            >
              <div
                className="p-1.5 rounded-lg flex-shrink-0 self-start mt-0.5"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                    {!item.read && (
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                        style={{ background: 'var(--accent-cyan)' }}
                      />
                    )}
                  </h4>
                  <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 text-center"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={onClose}
          className="text-xs font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Close
        </button>
      </div>
    </div>
  );
};
