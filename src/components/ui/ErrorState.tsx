import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <div
      className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 my-8"
      style={{ borderColor: 'rgba(239,68,68,0.20)' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.22)',
          color: 'var(--accent-red)',
        }}
      >
        <AlertOctagon className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Security Telemetry Disconnected
        </h3>
        <p className="text-xs font-mono leading-relaxed" style={{ color: 'var(--accent-red)' }}>
          ERR_SOCKET_C2_CONNECTION_FAILED: Unable to fetch live threat stream from AI Shield backend.
        </p>
      </div>

      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{
          background: 'var(--accent-red)',
          color: '#fff',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reconnect Neural Stream
      </button>
    </div>
  );
};
