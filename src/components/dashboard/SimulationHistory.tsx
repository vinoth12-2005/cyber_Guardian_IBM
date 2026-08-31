import React from 'react';
import type { SimulationHistoryItem } from '../../types/dashboard';
import { FlaskConical, CheckCircle, XCircle, Play } from 'lucide-react';

interface SimulationHistoryProps {
  simulations: SimulationHistoryItem[];
}

export const SimulationHistory: React.FC<SimulationHistoryProps> = ({ simulations }) => {
  const getDifficultyStyle = (diff: SimulationHistoryItem['difficulty']) => {
    switch (diff) {
      case 'Beginner':     return { bg: 'var(--accent-success-faint)', color: 'var(--accent-success)', border: 'var(--accent-success-border)' };
      case 'Intermediate': return { bg: 'var(--accent-info-faint)',    color: 'var(--accent-info)',    border: 'var(--accent-info-border)' };
      case 'Advanced':     return { bg: 'var(--accent-warning-faint)', color: 'var(--accent-warning)', border: 'var(--accent-warning-border)' };
      case 'Expert':       return { bg: 'var(--accent-primary-faint)', color: 'var(--accent-primary)', border: 'var(--accent-primary-border)' };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FlaskConical className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
            Simulation Lab History
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Phishing drills &amp; social engineering simulations
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: 'var(--accent-primary)',
            color: '#fff',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Play className="w-3 h-3 fill-white" strokeWidth={0} />
          Launch Drill
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr
              className="text-[10px] uppercase tracking-wider"
              style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              <th className="pb-3 px-3 font-medium">Drill Type</th>
              <th className="pb-3 px-3 font-medium">Difficulty</th>
              <th className="pb-3 px-3 font-medium">Result</th>
              <th className="pb-3 px-3 font-medium">Score</th>
              <th className="pb-3 px-3 font-medium">Progress</th>
              <th className="pb-3 px-3 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {simulations.map((item) => {
              const diffStyle = getDifficultyStyle(item.difficulty);
              return (
                <tr
                  key={item.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="py-3 px-3 font-semibold text-[11px]" style={{ color: 'var(--text-primary)' }}>
                    {item.simulationType}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="badge"
                      style={{ background: diffStyle.bg, color: diffStyle.color, borderColor: diffStyle.border }}
                    >
                      {item.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {item.result === 'Passed' ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--accent-success)' }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--accent-danger)' }}>
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-[11px]" style={{ color: item.score >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                    {item.score}%
                  </td>
                  <td className="py-3 px-3 min-w-[120px]">
                    <div className="space-y-1">
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {item.completionPercentage}%
                      </div>
                      <div className="progress-track h-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.completionPercentage}%`,
                            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-info))',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {item.date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
