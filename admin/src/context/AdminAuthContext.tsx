import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi, getAdminToken, setAdminToken, generateAdminDevToken } from '../lib/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  permissions: string[];
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  switchRole: (newRole: string) => void;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const ROLE_DEFAULT_TAB: { [key: string]: string } = {
  SUPER_ADMIN: 'dashboard',
  PLATFORM_ADMIN: 'dashboard',
  USER_ADMIN: 'dashboard',
  COURSE_ADMIN: 'dashboard',
  SIMULATION_ADMIN: 'dashboard',
  CERTIFICATION_ADMIN: 'dashboard',
  FLOTBOT_SECURITY_ADMIN: 'dashboard',
  SECURITY_ANALYST: 'dashboard',
  ANALYST: 'dashboard',
};

export const TAB_ROLE_PERMISSIONS: { [key: string]: string[] } = {
  dashboard: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN', 'COURSE_ADMIN', 'SIMULATION_ADMIN', 'CERTIFICATION_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST', 'ANALYST'],
  users: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'],
  courses: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'],
  simulations: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SIMULATION_ADMIN'],
  certifications: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'CERTIFICATION_ADMIN'],
  assessments: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'],
  analytics: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ANALYST'],
  'flotbot-dashboard': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'],
  'flotbot-alerts': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'],
  'flotbot-threats': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'],
  'flotbot-monitoring': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'],
  'flotbot-iocs': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'],
  'flotbot-rules': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'],
  'flotbot-config': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'],
  'flotbot-ai': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'],
  'flotbot-behaviour': ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'],
  'flotbot-history': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'],
  'flotbot-reports': ['SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'ANALYST'],
  announcements: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
  roles: ['SUPER_ADMIN'],
  'audit-logs': ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FLOTBOT_SECURITY_ADMIN'],
  settings: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
};

// Default super admin session for developer console
const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'usr_superadmin_01',
  name: 'Security Operations Lead',
  email: 'admin@cyberguardian.local',
  role: 'SUPER_ADMIN',
  avatarUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
  permissions: ['*'],
};

export interface AdminAuthProviderProps {
  children: React.ReactNode;
  initialUser?: AdminUser | null;
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({
  children,
  initialUser,
  initialTab,
  onTabChange,
}) => {
  const [user, setUser] = useState<AdminUser | null>(initialUser || DEFAULT_SUPER_ADMIN);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTabState] = useState(initialTab || 'dashboard');

  // Keep user in sync if initialUser updates from parent auth context
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  // Keep tab in sync if initialTab updates from parent router / sidebar
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  useEffect(() => {
    // If initialUser was already supplied, do not overwrite with fallback checkAuth
    if (initialUser) return;

    // Attempt to verify existing token or URL session parameters from main application
    const checkAuth = async () => {
      let activeToken: string | null = null;
      let urlRole: string | null = null;
      let urlEmail: string | null = null;
      let urlName: string | null = null;

      if (typeof window !== 'undefined' && window.location.search) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const paramToken = urlParams.get('token');
          urlRole = urlParams.get('role');
          urlEmail = urlParams.get('email');
          urlName = urlParams.get('name');

          if (paramToken) {
            setAdminToken(paramToken);
            activeToken = paramToken;
            // Clean up query string without reloading
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (e) {
          console.warn('[AdminAuth] URL param parse error:', e);
        }
      }

      const token = activeToken || getAdminToken();
      if (token) {
        setLoading(true);
        try {
          const res = await adminApi.auth.sync(token);
          if (res.success && res.data?.user) {
            const syncRole = res.data.user.role || urlRole || 'SUPER_ADMIN';
            setUser({
              id: res.data.user.id,
              name: res.data.user.name || urlName || DEFAULT_SUPER_ADMIN.name,
              email: res.data.user.email || urlEmail || DEFAULT_SUPER_ADMIN.email,
              role: syncRole,
              avatarUrl: res.data.user.profilePicture || DEFAULT_SUPER_ADMIN.avatarUrl,
              permissions: res.data.permissions || ['*'],
            });
            setActiveTab('dashboard');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('[AdminAuth] Sync error:', e);
        }
        setLoading(false);
      }

      // If URL had explicit role/email/name but backend sync was offline
      if (urlRole) {
        setUser({
          id: 'usr_sso_' + (urlEmail ? urlEmail.replace(/[^a-zA-Z0-9]/g, '_') : 'admin'),
          name: urlName || 'System Administrator',
          email: urlEmail || 'admin@cyberguardian.local',
          role: urlRole,
          avatarUrl: DEFAULT_SUPER_ADMIN.avatarUrl,
          permissions: urlRole === 'SUPER_ADMIN' ? ['*'] : [urlRole.toLowerCase() + ':*'],
        });
        setActiveTab('dashboard');
      }
    };
    checkAuth();
  }, [initialUser]);

  const switchRole = async (newRole: string) => {
    const newToken = generateAdminDevToken(newRole);
    setAdminToken(newToken);
    const permissions = newRole === 'SUPER_ADMIN' ? ['*'] : [newRole.toLowerCase() + ':*'];
    setUser((prev) => prev ? {
      ...prev,
      role: newRole,
      permissions,
    } : {
      id: 'usr_admin_' + newRole.toLowerCase(),
      name: 'Security Operations Lead',
      email: 'admin@cyberguardian.local',
      role: newRole,
      avatarUrl: DEFAULT_SUPER_ADMIN.avatarUrl,
      permissions,
    });

    // Always navigate to the role's tailored dashboard view
    setActiveTab('dashboard');

    try {
      await adminApi.auth.sync(newToken);
    } catch (e) {}
  };

  const hasPermission = (requiredRoleOrPermission: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.permissions.includes('*')) return true;
    if (user.role === requiredRoleOrPermission) return true;
    return user.permissions.includes(requiredRoleOrPermission);
  };

  const logout = () => {
    setAdminToken(null);
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, activeTab, setActiveTab, switchRole, hasPermission, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth(): AdminAuthContextType {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
