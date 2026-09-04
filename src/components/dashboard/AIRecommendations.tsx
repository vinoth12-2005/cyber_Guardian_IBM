import React from 'react';
import type { AIRecommendationItem } from '../../types/dashboard';
import { Sparkles, ArrowRight, AlertTriangle, Zap, Info, ChevronRight } from 'lucide-react';

interface AIRecommendationsProps {
  recommendations: AIRecommendationItem[];
  onExecuteRecommendation: (item: AIRecommendationItem) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  onExecuteRecommendation,
}) => {
  // Show only the highest-priority item on the home dashboard
  const topItem = recommendations.find((r) => r.priority === 'High') ?? recommendations[0];
  const total = recommendations.length;

  if (!topItem) return null;

  const priorityMeta = {
    High:   { color: 'var(--accent-danger)',   faint: 'var(--accent-danger-faint)',   border: 'var(--accent-danger-border)',   icon: <AlertTriangle className="w-3 h-3" />,  label: 'High Priority' },
    Medium: { color: 'var(--accent-warning)',  faint: 'var(--accent-warning-faint)',  border: 'var(--accent-warning-border)',  icon: <Zap className="w-3 h-3" />,           label: 'Medium Priority' },
    Low:    { color: 'var(--accent-info)',     faint: 'var(--accent-info-faint)',     border: 'var(--accent-info-border)',     icon: <Info className="w-3 h-3" />,          label: 'Low Priority' },
  }[topItem.priority];

  return (
    <div
      className="glass-card rounded-2xl p-5 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: 'var(--accent-ai-faint)', border: '1px solid var(--accent-ai-border)' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-ai)' }} />
          </div>
          <h3
            className="text-[13px] font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            AI Security Insight
          </h3>
        </div>

        <span
          className="badge"
          style={{
            background: priorityMeta.faint,
            color: priorityMeta.color,
            borderColor: priorityMeta.border,
          }}
        >
          {priorityMeta.icon}
          {priorityMeta.label}
        </span>
      </div>

      {/* Recommendation content */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-default)',
        }}
      >
        <h4
          className="text-sm font-semibold mb-1.5 leading-snug"
          style={{ color: 'var(--text-primary)' }}
        >
          {topItem.title}
        </h4>
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {topItem.reason}
        </p>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onExecuteRecommendation(topItem)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200"
          style={{
            background: 'var(--accent-primary)',
            color: '#fff',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {topItem.actionText}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          className="flex items-center gap-1.5 text-[12px] font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)')}
        >
          View all {total} recommendations
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
