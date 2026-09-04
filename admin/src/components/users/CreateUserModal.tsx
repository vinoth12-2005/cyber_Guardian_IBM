import React, { useState } from 'react';
import { adminApi } from '../../lib/api';
import {
  X,
  UserPlus,
  Shield,
  Mail,
  Building,
  FileText,
  Key,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const ROLES = [
  { value: 'EMPLOYEE', label: 'EMPLOYEE', desc: 'Standard workforce member with awareness training access' },
  { value: 'STUDENT', label: 'STUDENT', desc: 'Learning path access with basic threat simulations' },
  { value: 'SECURITY_ANALYST', label: 'SECURITY_ANALYST', desc: 'Threat intelligence, incident tracking & telemetry access' },
  { value: 'FLOTBOT_SECURITY_ADMIN', label: 'FLOTBOT_SECURITY_ADMIN', desc: 'Manages FlotBot AI, rules & host telemetry rules' },
  { value: 'COURSE_ADMIN', label: 'COURSE_ADMIN', desc: 'Curates courses, lessons, quizzes & study material' },
  { value: 'SIMULATION_ADMIN', label: 'SIMULATION_ADMIN', desc: 'Creates and publishes cyberattack simulations' },
  { value: 'CERTIFICATION_ADMIN', label: 'CERTIFICATION_ADMIN', desc: 'Issues, revokes and validates cybersecurity credentials' },
  { value: 'USER_ADMIN', label: 'USER_ADMIN', desc: 'Manages user accounts, statuses & team assignments' },
  { value: 'PLATFORM_ADMIN', label: 'PLATFORM_ADMIN', desc: 'Platform configurations, integrations & system settings' },
  { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN', desc: 'Full root privileges across all systems, users & policies' },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    organization: 'Enterprise CyberGuardian Organization',
    status: 'ACTIVE',
    bio: 'Enterprise workforce security member.',
    firebaseUid: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    role: string;
    firebaseStatus?: any;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = 'CG#';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Please provide the full name of the user.');
      return;
    }

    const effectivePassword = formData.password.trim() || 'TempPass@' + Math.floor(1000 + Math.random() * 9000);

    setLoading(true);
    setError(null);

    try {
      const res = await adminApi.users.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: effectivePassword,
        role: formData.role,
        organization: formData.organization.trim(),
        status: formData.status,
        bio: formData.bio.trim(),
        firebaseUid: formData.firebaseUid.trim() || undefined,
      });

      if (res.success) {
        setCreatedCredentials({
          email: formData.email.trim(),
          password: res.data?.tempPassword || effectivePassword,
          role: formData.role,
          firebaseStatus: res.data?.firebaseStatus,
        });
        onUserCreated();
      } else {
        setError(res.error?.message || 'Failed to create user account. Check backend database logs.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while creating the user.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `CyberGuardian AI Credentials:\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.password}\nRole: ${createdCredentials.role}\nLogin URL: http://localhost:5173`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleModalClose = () => {
    setCreatedCredentials(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'EMPLOYEE',
      organization: 'Enterprise CyberGuardian Organization',
      status: 'ACTIVE',
      bio: 'Enterprise workforce security member.',
      firebaseUid: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Provision New User</h2>
              <p className="text-xs text-slate-400">Create user login credentials & assign RBAC role permissions</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* If user was created, display credentials card */}
        {createdCredentials ? (
          <div className="p-6 space-y-5">
            {createdCredentials.firebaseStatus?.alreadyExisted ? (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-sm text-blue-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Existing Firebase Account Linked!</span>
                </div>
                <p className="text-xs text-blue-200/80">
                  This email already exists in Firebase Authentication (project: <strong>ibmhack-c98c2</strong>). The profile and role (<span className="font-mono text-indigo-300">{createdCredentials.role}</span>) have been linked in the unified database.
                </p>
              </div>
            ) : createdCredentials.firebaseStatus?.created ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-sm text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Account Created in Firebase Cloud & Database!</span>
                </div>
                <p className="text-xs text-emerald-200/80">
                  The account has been created in Firebase Authentication (project: <strong>ibmhack-c98c2</strong>) and synchronized with the database.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-sm text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Created as Local Database User</span>
                </div>
                <p className="text-xs text-amber-200/80">
                  Firebase Notice: {createdCredentials.firebaseStatus?.error || 'Could not provision to Firebase Auth'}. Account was saved in the local database.
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-900 text-slate-400">
                <span>Email Address:</span>
                <span className="text-white font-semibold">{createdCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900 text-slate-400">
                <span>Assigned Role:</span>
                <span className="text-indigo-400 font-semibold">{createdCredentials.role}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-slate-400">
                <span>Temporary Password:</span>
                <span className="text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  {createdCredentials.password}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Content Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-400" />
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. alex.morgan@enterprise.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Configuration */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-indigo-400" />
                  Initial Password
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Auto-generate Secure</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to auto-generate a temporary password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3.5 pr-9 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                The user can use this password to log in directly into the desktop or web app.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role Assignment */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-indigo-400" />
                  Role Assignment (RBAC) <span className="text-rose-400">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {ROLES.find((r) => r.value === formData.role)?.desc}
                </p>
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="ACTIVE">ACTIVE (Can log in immediately)</option>
                  <option value="INACTIVE">INACTIVE (Requires activation)</option>
                  <option value="SUSPENDED">SUSPENDED (Blocked)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Organization */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="h-3 w-3 text-slate-400" />
                  Organization / Department
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Enterprise Department"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Optional Firebase UID Mapping */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Key className="h-3 w-3 text-slate-400" />
                  Firebase UID <span className="text-slate-500 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="firebaseUid"
                  value={formData.firebaseUid}
                  onChange={handleChange}
                  placeholder="Leave empty to auto-generate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Bio / Administrative Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-slate-400" />
                Role Description / Notes
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={2}
                placeholder="Operational responsibilities or user details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Provisioning User...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Provision User</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
