import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => {
  return (
    <div
      className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 my-8"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: 'rgba(6,182,212,0.08)',
          border: '1px solid rgba(6,182,212,0.22)',
          color: 'var(--accent-cyan)',
        }}
      >
        <ShieldCheck className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          No Security Activity Found
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          There are no threat logs or analysis records matching your active filters. All system shields are quiet and operational.
        </p>
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
        style={{
          background: 'var(--surface-2)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
      >
        <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />
        Reset Dashboard Filters
      </button>
    </div>
  );
};
