import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';
import {
  LayoutDashboard,
  GraduationCap,
  FlaskConical,
  Bot,
  BarChart3,
  Settings,
  X,
  Lock,
  History,
  Shield,
  ShieldAlert,
  TrendingUp,
  Bell,
  Sparkles,
  Activity,
  Award,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Learn',
    items: [
      { id: 'courses-training', label: 'Courses & Training', icon: GraduationCap, badge: '50+ Courses' },
      { id: 'simulation-progress', label: 'Academy Progress', icon: Activity },
      { id: 'achievements', label: 'Achievements', icon: Award },
    ],
  },
  {
    label: 'Protect',
    items: [
      { id: 'simulation',   label: 'Simulation Lab', icon: FlaskConical },
      { id: 'ai-assistant', label: 'AI Assistant',   icon: Bot },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { id: 'reports',      label: 'Reports',              icon: BarChart3 },
      { id: 'history',      label: 'Analysis History',     icon: History },
      { id: 'threats',      label: 'Suspicious Activity',  icon: ShieldAlert },
      { id: 'trends',       label: 'Attack Trends',        icon: TrendingUp },
      { id: 'activity',     label: 'Recent Activity',      icon: Activity },
      { id: 'ai-insight',   label: 'AI Security Insight',  icon: Sparkles },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings',      label: 'Settings',      icon: Settings },
    ],
  },
];

// Flat list for external consumption (Header, etc.)
export const navItems = navGroups.flatMap((g) => g.items);

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isAdmin = authUser?.role && [
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'COURSE_ADMIN',
    'USER_ADMIN',
    'SIMULATION_ADMIN',
    'CERTIFICATION_ADMIN',
    'FLOTBOT_SECURITY_ADMIN',
    'SECURITY_ANALYST',
    'ANALYST',
  ].includes(authUser.role);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden modal-backdrop"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-60 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'var(--blur-heavy)',
          WebkitBackdropFilter: 'var(--blur-heavy)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Brand */}
        <div
          className="h-15 flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <img
              src={logoIcon}
              alt="CyberGuardian AI"
              className="w-11 h-11 rounded-xl flex-shrink-0 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/shield.svg';
              }}
            />
            <div>
              <span
                className="font-bold text-[14px] tracking-tight block leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                CyberGuardian
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {authUser?.role || 'EMPLOYEE'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5 mt-2">
          {isAdmin && (
            <div className="pb-2 mb-2 border-b border-indigo-900/30">
              <div
                className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-indigo-400 font-mono"
              >
                Enterprise Portal
              </div>
              <a
                href="http://localhost:5174"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-indigo-200 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[12px] font-bold">Admin Center</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  5174
                </span>
              </a>
            </div>
          )}
          {navGroups.map((group) => (
            <div key={group.label}>
              <div
                className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                {group.label}
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); onClose(); }}
                      className={`nav-item group ${isActive ? 'nav-item-active' : ''}`}
                    >
                      <Icon
                        className="w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200"
                        style={{
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                        }}
                        strokeWidth={isActive ? 2 : 1.75}
                      />
                      <span className="flex-1 text-left text-[13px]">{item.label}</span>

                      {'badge' in item && item.badge && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{
                            background: 'var(--accent-success-faint)',
                            color: 'var(--accent-success)',
                            border: '1px solid var(--accent-success-border)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Status footer & Log out */}
        <div
          className="p-4 space-y-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px]"
            style={{
              background: 'var(--accent-success-faint)',
              border: '1px solid var(--accent-success-border)',
            }}
          >
            <span
              className="flex items-center gap-2"
              style={{ color: 'var(--accent-success)' }}
            >
              <span className="glow-dot" style={{ width: '6px', height: '6px' }} />
              Shield Active
            </span>
            <Lock className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

