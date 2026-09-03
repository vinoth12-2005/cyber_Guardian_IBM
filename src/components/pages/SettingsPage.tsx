import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../lib/authService';
import type { UserProfile } from '../../types/dashboard';
import toast from 'react-hot-toast';
import {
  User, Mail, Shield, Key, Bell, CheckCircle,
  Save, Camera, Lock, Upload, X,
} from 'lucide-react';

interface SettingsPageProps {
  userProfile: UserProfile;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ userProfile, onUpdateProfile }) => {
  const { user: authUser, updateAvatar, updateDisplayName } = useAuth();

  // ── Profile fields ────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(authUser?.displayName || userProfile.name || '');
  const [email] = useState(authUser?.email || userProfile.email || '');
  const [role, setRole] = useState(authUser?.role || userProfile.role || 'EMPLOYEE');
  const [bio, setBio] = useState(authUser?.bio || userProfile.bio || 'Enterprise workforce security member.');

  // Sync with authUser when user account is loaded from PostgreSQL
  React.useEffect(() => {
    if (authUser) {
      if (authUser.displayName) setDisplayName(authUser.displayName);
      if (authUser.role) setRole(authUser.role);
      if (authUser.bio) setBio(authUser.bio);
      if (authUser.avatarUrl) setAvatarPreview(authUser.avatarUrl);
    }
  }, [authUser]);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Show Google photo (or local override) as default
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    authUser?.avatarUrl ?? userProfile.avatarUrl
  );
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // ── Password fields ───────────────────────────────────────────────────────
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [desktopNotifs, setDesktopNotifs] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  // ── Initials fallback ─────────────────────────────────────────────────────
  const initials = (displayName || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  // ── File picker ───────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      setPendingDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCancelAvatar = () => {
    setAvatarPreview(authUser?.avatarUrl ?? userProfile.avatarUrl);
    setPendingDataUrl(null);
  };

  const handleSaveAvatar = async () => {
    if (!pendingDataUrl) return;
    setSavingAvatar(true);
    try {
      updateAvatar(pendingDataUrl);
      setPendingDataUrl(null);
      toast.success('Profile photo updated!');
    } finally {
      setSavingAvatar(false);
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) { toast.error('Name cannot be empty'); return; }
    try {
      await updateDisplayName(displayName.trim());
      try {
        const { api } = await import('../../lib/api');
        await api.auth.sync({ name: displayName.trim(), bio: bio.trim() });
      } catch (e) {}
      if (onUpdateProfile) onUpdateProfile({ name: displayName.trim(), email, role, bio });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  // ── Save password ─────────────────────────────────────────────────────────
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) { toast.error('Enter your current password'); return; }
    if (newPass.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPass !== confirmPass) { toast.error('New passwords do not match'); return; }
    setSavingPass(true);
    try {
      await changePassword(currentPass, newPass);
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      toast.success('Password updated successfully!');
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect');
      } else if (code === 'auth/requires-recent-login') {
        toast.error('Please sign out and sign back in before changing your password');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Account Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage your personal details, security preferences, and notification options.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { id: 'profile',       label: 'Profile Details',         icon: User },
          { id: 'security',      label: 'Security & Password',      icon: Key  },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
              style={isActive ? {
                background:   'var(--accent-primary-faint)',
                color:        'var(--accent-primary)',
                border:       '1px solid var(--accent-primary-border)',
              } : {
                color:        'var(--text-secondary)',
                border:       '1px solid transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: Profile card ── */}
        <div className="lg:col-span-4">
          <div className="glass-card rounded-2xl p-6 text-center space-y-4">

            {/* Avatar */}
            <div className="relative inline-block mx-auto">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={displayName}
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                  }}
                  className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-md bg-slate-800"
                  style={{ border: '1px solid var(--border-medium)' }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center shadow-md"
                  style={{ background: 'var(--surface-3)', border: '1px solid var(--border-medium)' }}
                >
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {initials}
                  </span>
                </div>
              )}

              {/* Camera button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg text-white transition-all hover:brightness-110 shadow-sm"
                style={{ background: 'var(--accent-primary)' }}
                title="Change profile photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Pending save/cancel buttons */}
            {pendingDataUrl && (
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleCancelAvatar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={savingAvatar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  <Upload className="w-3 h-3" />
                  {savingAvatar ? 'Saving…' : 'Save Photo'}
                </button>
              </div>
            )}

            {/* Hint text */}
            {!pendingDataUrl && (
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {authUser?.avatarUrl
                  ? '✓ Using Google profile photo — click camera to change'
                  : 'Click the camera icon to upload a photo'}
              </p>
            )}

            {/* Name + email */}
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{displayName}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{email}</p>
              <span
                className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-md text-[11px] font-medium"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <Shield className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
                {userProfile.awarenessLevel || 'Advanced'} Security User
              </span>
            </div>

            {/* Info rows */}
            <div className="pt-4 text-left space-y-2 text-xs" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Account Status:</span>
                <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--accent-success)' }}>
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Role:</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{role}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Sign-in:</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {authUser?.avatarUrl?.includes('googleusercontent') ? 'Google' : 'Email'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Active tab ── */}
        <div className="lg:col-span-8">

          {/* Profile Details */}
          {activeSubTab === 'profile' && (
            <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-6">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} /> Personal Details
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Update your display name and role.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs input-base"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs input-base opacity-60 cursor-not-allowed"
                        title="Email cannot be changed here"
                      />
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Email changes require identity verification.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Enterprise Role (RBAC)</label>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                      <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-mono font-bold text-xs">{role}</span>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Assigned via Enterprise CyberGuardian Policy.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Organization / Department</label>
                    <input
                      type="text"
                      value={authUser?.organization || userProfile.organization || 'Enterprise CyberGuardian Organization'}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl text-xs input-base opacity-75 cursor-default"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Bio / Operational Summary</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs input-base resize-none"
                    placeholder="Brief description about your security focus"
                  />
                </div>

                <div className="pt-3 flex justify-end" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg text-xs font-medium text-white flex items-center gap-2 transition-all hover:brightness-110"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    <Save className="w-4 h-4" /> Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security & Password */}
          {activeSubTab === 'security' && (
            <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-6">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Lock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} /> Change Password
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Ensure your account uses a strong, unique password.
                </p>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs input-base"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs input-base"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs input-base"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="submit"
                    disabled={savingPass}
                    className="px-5 py-2.5 rounded-lg text-xs font-medium text-white flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-60"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    <Key className="w-4 h-4" />
                    {savingPass ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications */}
          {activeSubTab === 'notifications' && (
            <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-6">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Bell className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} /> Security Alerts & Notifications
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Choose how and when you receive security reports and real-time alerts.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Real-Time Threat Email Alerts',     desc: 'Immediate notifications for critical vulnerabilities.', value: emailAlerts,   setter: setEmailAlerts },
                  { label: 'Weekly Security Digest',            desc: 'Weekly summary of training progress and threat scores.', value: weeklyDigest,  setter: setWeeklyDigest },
                  { label: 'Browser Desktop Push Notifications',desc: 'Browser popups when AI scans flag high-risk links.',    value: desktopNotifs, setter: setDesktopNotifs },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}
                  >
                    <div>
                      <h4 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</h4>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.value}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: 'var(--accent-primary)' }}
                    />
                  </div>
                ))}

                <div className="pt-3 flex justify-end" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => toast.success('Notification preferences saved!')}
                    className="px-5 py-2.5 rounded-lg text-xs font-medium text-white flex items-center gap-2 transition-all hover:brightness-110"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
