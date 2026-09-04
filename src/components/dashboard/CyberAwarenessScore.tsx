import React from 'react';
import type { AwarenessScoreData } from '../../types/dashboard';
import { TrendingUp, Shield } from 'lucide-react';

interface CyberAwarenessScoreProps {
  scoreData: AwarenessScoreData;
}

export const CyberAwarenessScore: React.FC<CyberAwarenessScoreProps> = ({ scoreData }) => {
  const { overallScore, maxScore, level, weeklyProgress, categoryScores } = scoreData;
  const percentage = (overallScore / maxScore) * 100;

  const radius = 64;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const gaugeColor = overallScore >= 80
    ? 'var(--accent-success)'
    : overallScore >= 50
    ? 'var(--accent-warning)'
    : 'var(--accent-danger)';

  const categories = [
    { label: 'Phishing Defense', value: categoryScores.phishingDefense, color: 'var(--accent-ai)' },
    { label: 'Password Hygiene', value: categoryScores.passwordHygiene, color: 'var(--accent-success)' },
    { label: 'Network Security', value: categoryScores.networkSecurity, color: 'var(--accent-primary)' },
    { label: 'Threat Detection', value: categoryScores.threatDetection, color: 'var(--accent-warning)' },
  ];

  return (
    <div className="glass-card glass-panel-hover rounded-2xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl"
            style={{ background: 'var(--accent-primary-faint)', border: '1px solid var(--accent-primary-border)' }}
          >
            <Shield className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Cyber Awareness
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Security Score & Resilience
            </p>
          </div>
        </div>

        <span
          className="badge font-mono"
          style={{
            background: overallScore >= 80 ? 'var(--accent-success-faint)' : overallScore >= 50 ? 'var(--accent-warning-faint)' : 'var(--accent-danger-faint)',
            color: gaugeColor,
            borderColor: gaugeColor,
          }}
        >
          {level}
        </span>
      </div>

      {/* Gauge row */}
      <div className="flex items-center gap-5 flex-1">
        {/* SVG donut with dynamic semantic score coloring */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg width="148" height="148" className="-rotate-90">
            <circle cx="74" cy="74" r={radius} stroke="var(--border-default)" strokeWidth={strokeWidth} fill="none" />
            <circle
              cx="74" cy="74" r={radius}
              stroke={gaugeColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold leading-none font-mono" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {overallScore}
            </span>
            <span className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
              / {maxScore}
            </span>
          </div>
        </div>

        {/* Right metrics */}
        <div className="flex-1 space-y-3">
          {/* Weekly progress */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--accent-success-faint)', border: '1px solid var(--accent-success-border)' }}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent-success)' }} strokeWidth={2} />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-success)' }}>
              +{weeklyProgress}% this week
            </span>
          </div>

          {/* Category bars with distinctive semantic colors */}
          <div className="space-y-2.5">
            {categories.map((cat) => (
              <div key={cat.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {cat.label}
                  </span>
                  <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {cat.value}%
                  </span>
                </div>
                <div className="progress-track h-1.5" style={{ background: 'var(--surface-2)' }}>
                  <div
                    className="h-full rounded-full animate-progress"
                    style={{ width: `${cat.value}%`, background: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
