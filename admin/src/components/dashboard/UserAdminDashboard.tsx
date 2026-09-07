import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminApi } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Plus,
  Search,
  CheckCircle2,
  Ban,
  ChevronRight,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface UserAdminDashboardProps {
  stats: any;
  users: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const UserAdminDashboard: React.FC<UserAdminDashboardProps> = ({
  stats,
  users,
  loading,
  onRefresh,
}) => {
  const { setActiveTab } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const activeUsers = users.filter((u) => u.status === 'ACTIVE');
  const suspendedUsers = users.filter((u) => u.status === 'SUSPENDED');
  const adminUsers = users.filter((u) => u.role.includes('ADMIN'));
  const employees = users.filter((u) => u.role === 'EMPLOYEE' || u.role === 'STUDENT');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.users.updateStatus(userId, newStatus);
      toast.success(`User marked as ${newStatus}`);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-8">
      {/* User Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Identity & Workforce Governance</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1 font-semibold">
              USER_ADMIN CONSOLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Workforce identity verification, access privileges, role hierarchy, and account lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create User</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Identity KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Workforce Users</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{users.length}</span>
            <span className="text-[11px] text-slate-400 font-mono">Accounts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Registered in Identity Store</div>
        </div>

        {/* Active Accounts */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Accounts</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{activeUsers.length}</span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {Math.round((activeUsers.length / (users.length || 1)) * 100)}% Verified
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Unrestricted system access</div>
        </div>

        {/* Suspended Accounts */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Suspended / Flagged</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{suspendedUsers.length}</span>
            <span className="text-[11px] text-slate-400 font-mono">Locked</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Security hold or terminated</div>
        </div>

        {/* Administrative Roles */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Staff & Admin Roles</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400 font-mono">{adminUsers.length}</span>
            <span className="text-[11px] text-slate-400 font-mono">Privileged</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Admins & Analysts</div>
        </div>
      </div>

      {/* Role Breakdown Bar */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Workforce Role Distribution</span>
          <span className="text-xs font-mono text-slate-400">{users.length} Total Users</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 flex overflow-hidden">
          <div
            style={{ width: `${(employees.length / (users.length || 1)) * 100}%` }}
            className="bg-indigo-500"
            title="Workforce Learners"
          />
          <div
            style={{ width: `${(adminUsers.length / (users.length || 1)) * 100}%` }}
            className="bg-purple-500"
            title="Administrative Staff"
          />
          <div
            style={{ width: `${(suspendedUsers.length / (users.length || 1)) * 100}%` }}
            className="bg-rose-500"
            title="Suspended"
          />
        </div>
        <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Learners: {employees.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Staff / Admins: {adminUsers.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Suspended: {suspendedUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Live Directory Table with Search & Status Toggle */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Workforce Directory Management</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950/70 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="STUDENT">STUDENT</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="COURSE_ADMIN">COURSE_ADMIN</option>
              <option value="SIMULATION_ADMIN">SIMULATION_ADMIN</option>
              <option value="SECURITY_ANALYST">SECURITY_ANALYST</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Organization</th>
                <th className="p-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.slice(0, 8).map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.profilePicture || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                        }}
                        className="h-7 w-7 rounded-full bg-slate-800 object-cover"
                      />
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">{u.organization || 'CyberGuardian'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.status)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                        u.status === 'ACTIVE'
                          ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
