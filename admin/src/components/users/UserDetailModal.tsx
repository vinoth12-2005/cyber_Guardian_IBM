import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  X,
  User,
  Shield,
  BookOpen,
  Award,
  Gamepad2,
  AlertTriangle,
  Clock,
  CheckCircle,
  Save,
  Flame,
  Trash2,
  Loader2,
} from 'lucide-react';

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, onClose, onUserUpdated }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [purging, setPurging] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const res = await adminApi.users.getById(userId);
      if (res.success && res.data) {
        setData(res.data);
        setSelectedRole(res.data.user.role);
        setSelectedStatus(res.data.user.status);
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving user profile...');
    try {
      if (selectedRole !== data.user.role) {
        await adminApi.users.updateRole(userId, selectedRole);
      }
      if (selectedStatus !== data.user.status) {
        await adminApi.users.updateStatus(userId, selectedStatus);
      }
      toast.success('User profile updated successfully', { id: toastId });
      onUserUpdated();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update user', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const toastId = toast.loading('Marking user as DELETED...');
    try {
      const res = await adminApi.users.delete(userId, true, false);
      if (res.success) {
        toast.success(`User status changed to DELETED`, { id: toastId });
        onUserUpdated();
        onClose();
      } else {
        toast.error(res.error?.message || 'Failed to delete user', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e.message || 'Error deleting user', { id: toastId });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handlePurge = async () => {
    setPurging(true);
    const toastId = toast.loading('Purging user from database...');
    try {
      const res = await adminApi.users.purge(userId);
      if (res.success) {
        toast.success(res.data?.message || `User permanently erased from database`, { id: toastId, duration: 5000 });
        onUserUpdated();
        onClose();
      } else {
        toast.error(res.error?.message || 'Failed to purge user', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e.message || 'Error purging user', { id: toastId });
    } finally {
      setPurging(false);
      setConfirmPurge(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
          Loading user intelligence & security telemetry...
        </div>
      </div>
    );
  }

  const u = data?.user || {};
  const stats = data?.stats || {};
  const beh = data?.securityBehaviour?.metrics || {};

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-mono font-bold text-sm border border-indigo-500/30">
              {u.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {u.name}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {u.role}
                </span>
              </h2>
              <div className="text-xs text-slate-400 font-mono">{u.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Identity & RBAC Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Assigned Role (RBAC)</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="SECURITY_ANALYST">SECURITY_ANALYST</option>
                <option value="FLOTBOT_SECURITY_ADMIN">FLOTBOT_SECURITY_ADMIN</option>
                <option value="COURSE_ADMIN">COURSE_ADMIN</option>
                <option value="USER_ADMIN">USER_ADMIN</option>
                <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Account Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="DELETED">DELETED</option>
              </select>
            </div>
            <div className="md:col-span-2 text-[11px] font-mono text-slate-500">
              Firebase UID: <span className="text-slate-400">{u.firebase_uid}</span> · Registered: {new Date(u.created_at || Date.now()).toLocaleString()}
            </div>
          </div>

          {/* Section 1: Learning Academy Activity */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              Learning Academy Activity (Real DB Records)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-lg font-bold text-white font-mono">{stats.stats?.enrolledCourses ?? 0}</div>
                <div className="text-[10px] text-slate-400">Enrolled Courses</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-lg font-bold text-cyan-400 font-mono">{stats.stats?.completedCourses ?? 0}</div>
                <div className="text-[10px] text-slate-400">Completed Courses</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-lg font-bold text-emerald-400 font-mono">{stats.stats?.completedSimulations ?? 0}</div>
                <div className="text-[10px] text-slate-400">Simulation Labs</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-lg font-bold text-amber-400 font-mono">{stats.stats?.earnedCertificates ?? 0}</div>
                <div className="text-[10px] text-slate-400">Certificates Earned</div>
              </div>
            </div>
          </div>

          {/* Section 2: FlotBot Security Telemetry & Behaviour */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-rose-400" />
              FlotBot Security Telemetry (Objective EDR Data)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-lg font-bold text-rose-400 font-mono">{beh.totalAlerts ?? 0}</div>
                <div className="text-[10px] text-slate-400">Associated Alerts</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-lg font-bold text-indigo-400 font-mono">{beh.aiExplanationsRequested ?? 0}</div>
                <div className="text-[10px] text-slate-400">AI Queries Asked</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-lg font-bold text-emerald-400 font-mono">{beh.securityActionsPerformed ?? 0}</div>
                <div className="text-[10px] text-slate-400">Mitigations Performed</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-lg font-bold text-cyan-400 font-mono">{beh.securityPostureScore ?? 80}/100</div>
                <div className="text-[10px] text-slate-400">Security Posture Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Permanent Purge Button */}
            {confirmPurge ? (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-rose-950/80 border border-rose-800/80">
                <span className="text-[11px] text-rose-300 font-medium">Permanently erase user & records?</span>
                <button
                  onClick={handlePurge}
                  disabled={purging}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors"
                >
                  {purging ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  <span>Confirm Purge</span>
                </button>
                <button
                  onClick={() => setConfirmPurge(false)}
                  className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : confirmDelete ? (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-[11px] text-amber-300 font-medium">Mark as DELETED?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition-colors"
                >
                  {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  <span>Confirm Soft Delete</span>
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {u.status !== 'DELETED' && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Soft Delete</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirmPurge(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-xs font-medium text-rose-300 border border-rose-800/50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Purge User (DB)</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
