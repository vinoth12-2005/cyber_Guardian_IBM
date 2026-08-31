import React from 'react';
import type { AIRecommendationItem } from '../../types/dashboard';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Zap,
  Info,
} from 'lucide-react';

interface AIInsightPageProps {
  recommendations: AIRecommendationItem[];
  onExecuteRecommendation: (item: AIRecommendationItem) => void;
}

const priorityMeta = (priority: 'High' | 'Medium' | 'Low') =>
  ({
    High:   { color: 'var(--accent-danger)',   faint: 'var(--accent-danger-faint)',   border: 'var(--accent-danger-border)',   icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'High Priority' },
    Medium: { color: 'var(--accent-warning)',  faint: 'var(--accent-warning-faint)',  border: 'var(--accent-warning-border)',  icon: <Zap className="w-3.5 h-3.5" />,           label: 'Medium Priority' },
    Low:    { color: 'var(--accent-info)',     faint: 'var(--accent-info-faint)',     border: 'var(--accent-info-border)',     icon: <Info className="w-3.5 h-3.5" />,          label: 'Low Priority' },
  }[priority]);

export const AIInsightPage: React.FC<AIInsightPageProps> = ({
  recommendations,
  onExecuteRecommendation,
}) => {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div
        className="glass-card rounded-2xl p-5 flex items-center gap-3"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div
          className="p-2.5 rounded-xl"
          style={{ background: 'var(--accent-primary-faint)', border: '1px solid var(--accent-primary-border)' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        </div>
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
            AI Security Insights
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {recommendations.length} personalised recommendations from your AI guardian
          </p>
        </div>
      </div>

      {/* All recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendations.map((item) => {
          const meta = priorityMeta(item.priority);
          return (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-5 flex flex-col gap-4 animate-fade-in-up"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <h4
                  className="text-[13px] font-semibold leading-snug flex-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.title}
                </h4>
                <span
                  className="badge flex-shrink-0 flex items-center gap-1"
                  style={{
                    background: meta.faint,
                    color: meta.color,
                    borderColor: meta.border,
                  }}
                >
                  {meta.icon}
                  {meta.label}
                </span>
              </div>

              {/* Reason */}
              <p
                className="text-[12px] leading-relaxed flex-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item.reason}
              </p>

              {/* Action */}
              <button
                onClick={() => onExecuteRecommendation(item)}
                className="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200"
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {item.actionText}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
