import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
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
  Users,
  BookOpen,
  Gamepad2,
  HelpCircle,
  Flame,
  Database,
  Sliders,
  UserCheck,
  FileText,
  Settings2,
  Megaphone,
  UserCog,
  ScrollText,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
  badge?: string | number;
  roles?: string[];
}

interface NavSectionDef {
  label: string;
  items: NavItemDef[];
}

const ADMIN_NAV_SECTIONS: NavSectionDef[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Platform Management',
    items: [
      { id: 'users', label: 'Users Directory & RBAC', icon: Users, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'] },
      { id: 'courses', label: 'Courses & Curriculum', icon: BookOpen, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'] },
      { id: 'assessments', label: 'Quizzes & Assessments', icon: HelpCircle, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'] },
      { id: 'simulations', label: 'Simulation Cyber Range', icon: Gamepad2, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SIMULATION_ADMIN'] },
      { id: 'certifications', label: 'Credential Governance', icon: Award, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'CERTIFICATION_ADMIN'] },
      { id: 'analytics', label: 'Learning Analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ANALYST'] },
    ],
  },
  {
    label: 'FlotBot Security (EDR/XDR)',
    items: [
      { id: 'flotbot-dashboard', label: 'Security Dashboard', icon: Shield, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
      { id: 'flotbot-alerts', label: 'Threat Alerts', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
      { id: 'flotbot-threats', label: 'Threat Detections', icon: Flame, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
      { id: 'flotbot-monitoring', label: 'Live Telemetry', icon: Activity, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
      { id: 'flotbot-iocs', label: 'IOC Management', icon: Database, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
      { id: 'flotbot-rules', label: 'Threat Rules Engine', icon: Sliders, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'] },
      { id: 'flotbot-ai', label: 'AI Security Analysis', icon: Bot, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
      { id: 'flotbot-behaviour', label: 'User Behaviour', icon: UserCheck, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
      { id: 'flotbot-history', label: 'Alert History', icon: History, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
      { id: 'flotbot-reports', label: 'Security Reports', icon: FileText, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'ANALYST'] },
      { id: 'flotbot-config', label: 'FlotBot Config', icon: Settings2, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'] },
    ],
  },
  {
    label: 'Learner Preview',
    items: [
      { id: 'courses-training', label: 'Student Course View', icon: GraduationCap, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'] },
      { id: 'simulation', label: 'Student Lab View', icon: FlaskConical, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SIMULATION_ADMIN'] },
      { id: 'ai-assistant', label: 'AI Security Assistant', icon: Sparkles, roles: ['SUPER_ADMIN', 'SECURITY_ANALYST', 'FLOTBOT_SECURITY_ADMIN'] },
    ],
  },
  {
    label: 'System & Governance',
    items: [
      { id: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'] },
      { id: 'roles', label: 'Admin Roles & RBAC', icon: UserCog, roles: ['SUPER_ADMIN'] },
      { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FLOTBOT_SECURITY_ADMIN'] },
      { id: 'settings', label: 'Admin Settings', icon: Settings, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN', 'USER_ADMIN', 'SIMULATION_ADMIN', 'CERTIFICATION_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST', 'ANALYST'] },
    ],
  },
];

const navGroups: NavSectionDef[] = [
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

  const userRole = authUser?.role || 'EMPLOYEE';
  const isAdmin = [
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'COURSE_ADMIN',
    'USER_ADMIN',
    'SIMULATION_ADMIN',
    'CERTIFICATION_ADMIN',
    'FLOTBOT_SECURITY_ADMIN',
    'SECURITY_ANALYST',
    'ANALYST',
  ].includes(userRole);

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
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-semibold">
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
          {(() => {
            const activeSections = isAdmin
              ? ADMIN_NAV_SECTIONS.map((sec) => ({
                  label: sec.label,
                  items: sec.items.filter(
                    (item) => !item.roles || userRole === 'SUPER_ADMIN' || item.roles.includes(userRole)
                  ),
                })).filter((sec) => sec.items.length > 0)
              : navGroups;

            return activeSections.map((group) => (
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
                    const itemLabel = item.label;
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
                        <span className="flex-1 text-left text-[13px]">{itemLabel}</span>

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
            ));
          })()}
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

