import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Gamepad2,
  Award,
  HelpCircle,
  BarChart3,
  Shield,
  AlertTriangle,
  Flame,
  Activity,
  Network,
  FolderTree,
  Database,
  Sliders,
  Bot,
  UserCheck,
  History,
  FileText,
  Settings2,
  Megaphone,
  UserCog,
  ScrollText,
  SlidersHorizontal,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<{ activeAlertCount?: number }> = ({ activeAlertCount = 3 }) => {
  const { activeTab, setActiveTab, user } = useAdminAuth();

  const sections: NavSection[] = [
    {
      title: 'ADMIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PLATFORM MANAGEMENT',
      items: [
        { id: 'users', label: 'Users', icon: Users, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'] },
        { id: 'courses', label: 'Courses', icon: BookOpen, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'] },
        { id: 'simulations', label: 'Simulations', icon: Gamepad2, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SIMULATION_ADMIN'] },
        { id: 'certifications', label: 'Certifications', icon: Award, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'CERTIFICATION_ADMIN'] },
        { id: 'assessments', label: 'Assessments / Quizzes', icon: HelpCircle, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'] },
        { id: 'analytics', label: 'Learning Analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ANALYST'] },
      ],
    },
    {
      title: 'FLOTBOT SECURITY (EDR/XDR)',
      items: [
        { id: 'flotbot-dashboard', label: 'Security Dashboard', icon: Shield, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
        { id: 'flotbot-alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertCount, badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30', roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
        { id: 'flotbot-threats', label: 'Threat Detections', icon: Flame, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
        { id: 'flotbot-monitoring', label: 'Live Telemetry (Process/Net/File)', icon: Activity, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
        { id: 'flotbot-iocs', label: 'IOC Management', icon: Database, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
        { id: 'flotbot-rules', label: 'Threat Rules', icon: Sliders, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'] },
        { id: 'flotbot-ai', label: 'AI Security Analysis', icon: Bot, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
        { id: 'flotbot-behaviour', label: 'User Security Behaviour', icon: UserCheck, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
        { id: 'flotbot-history', label: 'Alert Handling History', icon: History, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'] },
        { id: 'flotbot-reports', label: 'Security Reports', icon: FileText, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'ANALYST'] },
        { id: 'flotbot-config', label: 'FlotBot Configuration', icon: Settings2, roles: ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'] },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { id: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'] },
        { id: 'roles', label: 'Admin & Roles (RBAC)', icon: UserCog, roles: ['SUPER_ADMIN'] },
        { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FLOTBOT_SECURITY_ADMIN'] },
        { id: 'settings', label: 'Settings', icon: SlidersHorizontal, roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'] },
      ],
    },
  ];

  const userRole = user?.role || 'SUPER_ADMIN';

  return (
    <aside className="w-72 bg-slate-900/90 backdrop-blur-md border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              CyberGuardian <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">HQ</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Unified Admin Center</div>
          </div>
        </div>
      </div>

      {/* Navigation Links with ScrollArea */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => {
          // Filter items by role permission
          const visibleItems = section.items.filter(
            (item) => !item.roles || userRole === 'SUPER_ADMIN' || item.roles.includes(userRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-2">
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 text-[11px] font-medium">SOC Live (PostgreSQL)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
