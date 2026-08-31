import React from 'react';
import { Shield, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="mt-6 py-4 px-4 lg:px-8"
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
      }}
    >
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} strokeWidth={1.75} />
            <span
              className="text-[12px] font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              CyberGuardian AI
            </span>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-md"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            v1.0 Enterprise
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {['Privacy Policy', 'Support Portal', 'Security Docs'].map((label) => (
            <button
              key={label}
              className="transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div
          className="flex items-center gap-1.5 text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent-success)' }} strokeWidth={1.75} />
          All Defense Engines Operational
        </div>
      </div>
    </footer>
  );
};
