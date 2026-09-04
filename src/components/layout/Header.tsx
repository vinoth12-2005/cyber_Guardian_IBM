import React, { useState } from 'react';
import type { UserProfile, NotificationItem } from '../../types/dashboard';
import { NotificationsPopover } from './NotificationsPopover';
import { Bell, Moon, Sun, Menu, LogOut, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface HeaderProps {
  user: UserProfile;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onToggleSidebar: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user: defaultUserProps,
  notifications,
  onMarkAllAsRead,
  onToggleSidebar,
  onOpenSettings,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const displayName = authUser?.displayName || defaultUserProps.name;
  const displayEmail = authUser?.email || "alex.vance@cyberguardian.io";
  const avatarUrl = authUser?.avatarUrl || defaultUserProps.avatarUrl;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between gap-4 px-4 lg:px-6"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left — Mobile toggle & Brand title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            CyberGuardian Platform
          </span>
        </div>
      </div>

      {/* Right — Controls */}
      <div className="flex items-center gap-1">
        {/* Dual Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle visual theme"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200 border cursor-pointer group"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border-medium)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" style={{ color: 'var(--accent-warning)' }} strokeWidth={2} />
              <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--accent-warning)' }}>Dark</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 group-hover:-rotate-12 transition-transform duration-300" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
              <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--accent-primary)' }}>Light</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="relative p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Bell className="w-4 h-4" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--accent-danger)' }}
              />
            )}
          </button>

          {showNotifications && (
            <NotificationsPopover
              notifications={notifications}
              onMarkAllAsRead={onMarkAllAsRead}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* Quick Sign Out button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* Divider */}
        <div
          className="w-px h-5 mx-1"
          style={{ background: 'var(--border-default)' }}
        />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-6 h-6 rounded-lg object-cover"
              style={{ border: '1px solid var(--border-medium)' }}
            />
            <div className="hidden sm:block text-left">
              <span
                className="block text-[12px] font-semibold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {displayName}
              </span>
              <span
                className="block text-[10px]"
                style={{ color: 'var(--text-muted)' }}
              >
                {defaultUserProps.awarenessLevel}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 top-11 w-52 rounded-2xl p-1.5 z-50 animate-scale-in"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div
                className="px-3 py-3 mb-1"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {displayName}
                </p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {displayEmail}
                </p>
              </div>

              <button
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <User className="w-3.5 h-3.5" />
                Account Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-colors text-red-400 hover:text-red-300"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

