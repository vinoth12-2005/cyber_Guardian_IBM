import React, { useState } from 'react';
import type { UserProfile, NotificationItem } from '../../types/dashboard';
import { NotificationsPopover } from './NotificationsPopover';
import {
  Bell,
  Moon,
  Sun,
  Menu,
  LogOut,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Globe,
  ArrowRight,
  AlertTriangle,
  X,
} from 'lucide-react';
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
  isQuizActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user: defaultUserProps,
  notifications,
  onMarkAllAsRead,
  searchQuery,
  setSearchQuery,
  onToggleSidebar,
  onOpenSettings,
  isQuizActive = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [navUrl, setNavUrl] = useState(searchQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

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

  // Real-time protocol & threat detection on typing
  const cleanInput = navUrl.trim().toLowerCase();
  const isInsecureHttp = cleanInput.startsWith('http://') || (cleanInput.startsWith('http:') && !cleanInput.startsWith('https:'));
  const isHttps = cleanInput.startsWith('https://');
  const hasTypoSquatting = cleanInput.includes('paypa1') || cleanInput.includes('micros0ft') || cleanInput.includes('.xyz') || cleanInput.includes('.top');

  const handleNavigateOrInspect = (targetUrl?: string) => {
    const urlToTest = (targetUrl || navUrl).trim();
    if (!urlToTest) {
      toast.error('Please enter a URL or search query');
      return;
    }

    setShowPresets(false);

    if (typeof (window as any).triggerUrlInterception === 'function') {
      (window as any).triggerUrlInterception(urlToTest);
    } else {
      window.dispatchEvent(new CustomEvent('flotbot-intercept-url', { detail: { url: urlToTest } }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNavigateOrInspect();
    }
  };

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left — Mobile toggle & Brand title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {!isQuizActive && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            CyberGuardian
          </span>
          {isQuizActive && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Exam Lockdown
            </span>
          )}
        </div>
      </div>

      {/* Center — Omnibar or Lockdown Banner */}
      {isQuizActive ? (
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono font-medium">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline">PROCTORED ASSESSMENT LOCKDOWN · NAVIGATION LOCKED</span>
            <span className="sm:hidden">LOCKDOWN ACTIVE</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-2xl mx-1 sm:mx-3 relative">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all duration-200 ${
              isInsecureHttp || hasTypoSquatting
                ? 'border-red-500/80 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                : isFocused
                ? 'border-cyan-500/70 bg-cyan-950/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
            style={{ background: 'var(--surface-2)' }}
          >
          {/* Live Protocol Shield Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isInsecureHttp ? (
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                <Unlock className="w-3 h-3 text-red-400" />
                <span className="hidden sm:inline">INSECURE HTTP</span>
              </span>
            ) : isHttps ? (
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">TLS SECURE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span className="hidden md:inline">WEB SHIELD ACTIVE</span>
              </span>
            )}
          </div>

          {/* Omnibar Input */}
          <div className="flex-1 flex items-center min-w-0">
            <input
              type="text"
              value={navUrl}
              onChange={(e) => {
                setNavUrl(e.target.value);
                if (setSearchQuery) setSearchQuery(e.target.value);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowPresets(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setShowPresets(false), 250);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search or enter URL (e.g. http://login.bank.top, paypa1.xyz)..."
              className="w-full bg-transparent text-[11px] sm:text-[12px] placeholder:text-slate-500 focus:outline-none text-slate-200 font-mono"
            />
            {navUrl && (
              <button
                type="button"
                onClick={() => setNavUrl('')}
                className="text-slate-400 hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Inspect / Browse Button */}
          <button
            type="button"
            onClick={() => handleNavigateOrInspect()}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 shrink-0 ${
              isInsecureHttp || hasTypoSquatting
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                : 'bg-cyan-600/90 hover:bg-cyan-500 text-white shadow-sm'
            }`}
          >
            {isInsecureHttp ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span className="hidden md:inline">Intercept HTTP</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" />
                <span className="hidden md:inline">Inspect & Scan</span>
              </>
            )}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick-Test Presets Dropdown */}
        {showPresets && (
          <div
            className="absolute left-0 right-0 top-full mt-1 rounded-xl p-2 z-50 animate-scale-in shadow-2xl border border-slate-800/90 backdrop-blur-xl"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 flex items-center justify-between border-b border-slate-800/60 pb-1.5 mb-1.5">
              <span>⚡ REAL-TIME DETECTION TEST PRESETS</span>
              <span className="text-[9px] text-cyan-400">CLICK TO TRIGGER LIVE ALERT</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button
                type="button"
                onMouseDown={() => {
                  setNavUrl('http://paypa1-security-update.xyz/login/verify');
                  handleNavigateOrInspect('http://paypa1-security-update.xyz/login/verify');
                }}
                className="flex items-start gap-2 p-2 rounded-lg text-left hover:bg-red-950/40 border border-transparent hover:border-red-800/50 transition-colors group"
              >
                <Unlock className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-semibold text-red-300 group-hover:text-red-200 flex items-center gap-1.5">
                    <span>Unencrypted HTTP + Typosquat</span>
                    <span className="px-1 py-0.2 rounded text-[9px] bg-red-900/60 text-red-300 font-bold">CRITICAL</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                    http://paypa1-security-update.xyz
                  </div>
                </div>
              </button>

              <button
                type="button"
                onMouseDown={() => {
                  setNavUrl('http://micros0ft-support-portal.top/signin');
                  handleNavigateOrInspect('http://micros0ft-support-portal.top/signin');
                }}
                className="flex items-start gap-2 p-2 rounded-lg text-left hover:bg-orange-950/40 border border-transparent hover:border-orange-800/50 transition-colors group"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-semibold text-orange-300 group-hover:text-orange-200 flex items-center gap-1.5">
                    <span>HTTP Credential Harvester</span>
                    <span className="px-1 py-0.2 rounded text-[9px] bg-orange-900/60 text-orange-300 font-bold">HIGH</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                    http://micros0ft-support-portal.top
                  </div>
                </div>
              </button>

              <button
                type="button"
                onMouseDown={() => {
                  setNavUrl('http://194.26.29.112/secure-banking/update.php');
                  handleNavigateOrInspect('http://194.26.29.112/secure-banking/update.php');
                }}
                className="flex items-start gap-2 p-2 rounded-lg text-left hover:bg-amber-950/40 border border-transparent hover:border-amber-800/50 transition-colors group"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-semibold text-amber-300 group-hover:text-amber-200 flex items-center gap-1.5">
                    <span>Raw IP Insecure HTTP Endpoint</span>
                    <span className="px-1 py-0.2 rounded text-[9px] bg-amber-900/60 text-amber-300 font-bold">HIGH</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                    http://194.26.29.112/update.php
                  </div>
                </div>
              </button>

              <button
                type="button"
                onMouseDown={() => {
                  setNavUrl('https://www.google.com/search?q=cybersecurity');
                  handleNavigateOrInspect('https://www.google.com/search?q=cybersecurity');
                }}
                className="flex items-start gap-2 p-2 rounded-lg text-left hover:bg-emerald-950/40 border border-transparent hover:border-emerald-800/50 transition-colors group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-semibold text-emerald-300 group-hover:text-emerald-200 flex items-center gap-1.5">
                    <span>Verified Official Domain</span>
                    <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-900/60 text-emerald-300 font-bold">CLEAN</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                    https://www.google.com
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Right — Controls */}
      <div className="flex items-center gap-1 shrink-0">
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
        {!isQuizActive && (
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
        )}

        {/* Quick Sign Out button */}
        {!isQuizActive && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}

        {/* Divider */}
        <div
          className="w-px h-5 mx-1"
          style={{ background: 'var(--border-default)' }}
        />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              if (isQuizActive) return;
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            disabled={isQuizActive}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors ${isQuizActive ? 'cursor-default' : ''}`}
            onMouseEnter={(e) => {
              if (!isQuizActive) e.currentTarget.style.background = 'var(--surface-2)';
            }}
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

          {!isQuizActive && showProfileMenu && (
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

