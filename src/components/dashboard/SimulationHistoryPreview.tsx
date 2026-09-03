import React from 'react';
import type { SimulationHistoryItem } from '../../types/dashboard';
import { FlaskConical, CheckCircle, XCircle, Play, ArrowRight } from 'lucide-react';

interface SimulationHistoryPreviewProps {
  simulations: SimulationHistoryItem[];
  onViewAll: () => void;
}

export const SimulationHistoryPreview: React.FC<SimulationHistoryPreviewProps> = ({
  simulations,
  onViewAll,
}) => {
  const latest = simulations[0];

  const diffStyle = (diff: SimulationHistoryItem['difficulty']) => {
    switch (diff) {
      case 'Beginner':     return { bg: 'var(--accent-success-faint)', color: 'var(--accent-success)', border: 'var(--accent-success-border)' };
      case 'Intermediate': return { bg: 'var(--accent-info-faint)',    color: 'var(--accent-info)',    border: 'var(--accent-info-border)' };
      case 'Advanced':     return { bg: 'var(--accent-warning-faint)', color: 'var(--accent-warning)', border: 'var(--accent-warning-border)' };
      case 'Expert':       return { bg: 'var(--accent-primary-faint)', color: 'var(--accent-primary)', border: 'var(--accent-primary-border)' };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-primary-faint)', border: '1px solid var(--accent-primary-border)' }}>
            <FlaskConical className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Simulation Lab
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Most recent drill</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
            style={{ background: 'var(--accent-primary)', color: '#fff' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Play className="w-3 h-3 fill-white" strokeWidth={0} />
            Launch Drill
          </button>
        </div>
      </div>

      {/* Latest drill */}
      {latest ? (() => {
        const ds = diffStyle(latest.difficulty);
        return (
          <div
            className="p-3.5 rounded-xl mb-3"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{latest.simulationType}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{latest.date}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="badge" style={{ background: ds.bg, color: ds.color, borderColor: ds.border }}>{latest.difficulty}</span>
                <span className="text-[12px] font-bold" style={{ color: latest.score >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                  {latest.score}%
                </span>
                {latest.result === 'Passed'
                  ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-success)' }} />
                  : <XCircle    className="w-4 h-4" style={{ color: 'var(--accent-danger)' }} />
                }
              </div>
            </div>
            <div className="progress-track h-1 mt-3">
              <div className="h-full rounded-full" style={{ width: `${latest.completionPercentage}%`, background: 'var(--accent-primary)', opacity: 0.7 }} />
            </div>
          </div>
        );
      })() : (
        <div className="p-5 rounded-xl mb-3 text-center text-xs" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
          No simulation drills completed yet. Launch a drill to test your security instincts.
        </div>
      )}

      <button
        onClick={onViewAll}
        className="flex items-center gap-1 text-[11px] font-medium transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)')}
      >
        View full history <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
