import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { UserDetailModal } from './UserDetailModal';
import { CreateUserModal } from './CreateUserModal';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  Shield,
  MoreVertical,
  Edit,
  UserCheck,
  RefreshCw,
  UserPlus,
  Trash2,
  RotateCcw,
} from 'lucide-react';

export const UserListView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to mark user "${email}" as DELETED?`)) {
      return;
    }
    const toastId = toast.loading('Deleting user account...');
    try {
      const res = await adminApi.users.delete(userId);
      if (res.success) {
        toast.success(`User ${email} status changed to DELETED`, { id: toastId });
        fetchUsers();
      } else {
        toast.error(res.error?.message || 'Failed to delete user', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e.message || 'Error deleting user', { id: toastId });
    }
  };

  const handleRestoreUser = async (userId: string, email: string) => {
    const toastId = toast.loading('Restoring user account...');
    try {
      const res = await adminApi.users.updateStatus(userId, 'ACTIVE');
      if (res.success) {
        toast.success(`User ${email} restored to ACTIVE status`, { id: toastId });
        fetchUsers();
      } else {
        toast.error(res.error?.message || 'Failed to restore user', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e.message || 'Error restoring user', { id: toastId });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.users.list({
        search,
        role: roleFilter,
        status: statusFilter,
      });
      if (res.success && res.data) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">User Administration</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage authenticated users, assign RBAC permissions, and review security posture metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, org..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="">All Roles</option>
            <option value="EMPLOYEE">EMPLOYEE (Workforce)</option>
            <option value="SECURITY_ANALYST">SECURITY_ANALYST</option>
            <option value="FLOTBOT_SECURITY_ADMIN">FLOTBOT_SECURITY_ADMIN</option>
            <option value="COURSE_ADMIN">COURSE_ADMIN</option>
            <option value="USER_ADMIN">USER_ADMIN</option>
            <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="DELETED">DELETED</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">XP & Level</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No users matching search filters found in PostgreSQL.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-mono text-xs">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className={u.status === 'DELETED' ? 'line-through text-slate-400' : ''}>{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-normal">{u.id}</div>
                      </div>
                    </td>
                    <td className={`py-3 px-4 font-mono ${u.status === 'DELETED' ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.status === 'ACTIVE' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                          ACTIVE
                        </span>
                      )}
                      {u.status === 'SUSPENDED' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/50 text-rose-400 border border-rose-800/50">
                          SUSPENDED
                        </span>
                      )}
                      {u.status === 'INACTIVE' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/50 text-amber-400 border border-amber-800/50">
                          INACTIVE
                        </span>
                      )}
                      {u.status === 'DELETED' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/90 text-slate-400 border border-slate-700 line-through">
                          DELETED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      Lvl {u.level} · <span className="text-amber-400 font-bold">{u.xp} XP</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            title="Mark User as DELETED"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-[11px] font-medium text-rose-300 border border-rose-800/60 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        )}
                        {u.status === 'DELETED' && (
                          <button
                            onClick={() => handleRestoreUser(u.id, u.email)}
                            title="Restore User to ACTIVE"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-[11px] font-medium text-emerald-300 border border-emerald-800/60 transition-colors"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Restore</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedUserId(u.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail & Edit Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUserUpdated={fetchUsers}
        />
      )}

      {/* Provision New User Modal */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={fetchUsers}
      />
    </div>
  );
};
