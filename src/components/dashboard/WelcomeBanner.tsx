import React from 'react';
import type { UserProfile } from '../../types/dashboard';
import { ShieldCheck, Clock, Zap } from 'lucide-react';

interface WelcomeBannerProps {
  user: UserProfile;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ user }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 sm:p-7"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left — Welcome + status */}
        <div className="space-y-4">
          <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {currentDate} · {currentTime}
          </p>

          <div className="space-y-1">
            <h1
              className="text-2xl sm:text-[26px] font-bold tracking-tight leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Welcome back, {user.name}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Your CyberGuardian shield is active and all systems operational.
            </p>
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge" style={{ background: 'var(--accent-success-faint)', color: 'var(--accent-success)', borderColor: 'var(--accent-success-border)' }}>
              <ShieldCheck className="w-3 h-3" /> Protected
            </span>
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
              <Clock className="w-3 h-3" /> Last scan: 2 min ago
            </span>
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
              <Zap className="w-3 h-3" /> {user.awarenessLevel}
            </span>
          </div>
        </div>

        {/* Right — Shield status */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 flex items-center justify-center rounded-2xl relative group transition-transform"
            style={{
              background: 'var(--accent-success-faint)',
              border: '1px solid var(--accent-success-border)',
              boxShadow: 'var(--glow-success)',
            }}
          >
            <ShieldCheck
              className="w-8 h-8 transition-transform group-hover:scale-105"
              style={{ color: 'var(--accent-success)' }}
              strokeWidth={1.75}
            />
          </div>
          <div className="text-center">
            <span className="block text-[11px] font-bold tracking-tight" style={{ color: 'var(--accent-success)' }}>
              All Systems
            </span>
            <span className="block text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Protected & Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
