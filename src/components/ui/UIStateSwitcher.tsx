import React from 'react';
import type { UIState } from '../../types/dashboard';
import { SlidersHorizontal, CheckCircle2, Loader2, FileQuestion, AlertCircle } from 'lucide-react';

interface UIStateSwitcherProps {
  uiState: UIState;
  setUiState: (state: UIState) => void;
}

export const UIStateSwitcher: React.FC<UIStateSwitcherProps> = ({ uiState, setUiState }) => {
  const states: { id: UIState; label: string; icon: React.ReactNode; activeStyle: React.CSSProperties }[] = [
    {
      id: 'normal',
      label: 'Normal',
      icon: <CheckCircle2 className="w-3 h-3" />,
      activeStyle: { background: 'var(--accent-cyan)', color: '#000' },
    },
    {
      id: 'loading',
      label: 'Loading',
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      activeStyle: { background: 'var(--accent-purple)', color: '#fff' },
    },
    {
      id: 'empty',
      label: 'Empty',
      icon: <FileQuestion className="w-3 h-3" />,
      activeStyle: { background: 'var(--accent-amber)', color: '#000' },
    },
    {
      id: 'error',
      label: 'Error',
      icon: <AlertCircle className="w-3 h-3" />,
      activeStyle: { background: 'var(--accent-red)', color: '#fff' },
    },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-default)',
      }}
    >
      <span
        className="text-[10px] font-mono font-semibold px-2 flex items-center gap-1.5"
        style={{ color: 'var(--text-muted)' }}
      >
        <SlidersHorizontal className="w-3 h-3" style={{ color: 'var(--accent-cyan)' }} />
        UI State:
      </span>

      {states.map((s) => (
        <button
          key={s.id}
          onClick={() => setUiState(s.id)}
          className="px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 text-[11px] font-mono"
          style={
            uiState === s.id
              ? { ...s.activeStyle, fontWeight: '700' }
              : { color: 'var(--text-muted)', background: 'transparent' }
          }
          onMouseEnter={(e) => { if (uiState !== s.id) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { if (uiState !== s.id) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        >
          {s.icon}
          {s.label}
        </button>
      ))}
    </div>
  );
};
