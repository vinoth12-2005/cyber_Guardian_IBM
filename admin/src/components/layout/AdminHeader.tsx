import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Search,
  Bell,
  ShieldCheck,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
} from 'lucide-react';

export const AdminHeader: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const { user, switchRole } = useAdminAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles = [
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'FLOTBOT_SECURITY_ADMIN',
    'SECURITY_ANALYST',
    'USER_ADMIN',
    'COURSE_ADMIN',
    'SIMULATION_ADMIN',
    'CERTIFICATION_ADMIN',
    'ANALYST',
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users, courses, alerts, IOCs, audit logs..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Real DB Data"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg border border-slate-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {/* Live DB Connection Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-[11px] font-mono text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>PostgreSQL Live</span>
        </div>

        {/* Role Switcher for Testing RBAC */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300 font-mono hover:bg-indigo-900/40 transition-colors"
          >
            <span>Role: <strong className="text-indigo-200">{user?.role}</strong></span>
            <ChevronDown className="h-3 w-3 text-indigo-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-500">Switch Active Role (RBAC)</div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    user?.role === r
                      ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg border border-slate-800 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <img
            src={user?.avatarUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}
            alt="Admin Avatar"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
            }}
            className="h-8 w-8 rounded-full border border-indigo-500/40 object-cover bg-slate-800"
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
            <div className="text-[10px] font-mono text-slate-400 leading-tight">{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
