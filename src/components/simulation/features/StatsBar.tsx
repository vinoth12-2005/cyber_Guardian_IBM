import React from 'react';
import { useCyberStore } from '@/store/cyber-store';
import { seScenarios } from '@/data/simulation/se-scenarios';
import { getRank, getLevel } from '@/lib/utils';
import { ShieldCheck, Award, Target, Zap, Activity, CheckCircle2 } from 'lucide-react';

export function StatsBar() {
  const completedList = useCyberStore(s => s.completedList);
  const completedCount = completedList.length;
  const totalScenarios = seScenarios.length;
  const xp = useCyberStore(s => s.profile.xp);
  const accuracy = completedList.length === 0
    ? 0
    : Math.round((completedList.filter(c => c.outcome === 'safe').length / completedList.length) * 100);
  const rank = getRank(xp);
  const completionPct = Math.round((completedCount / totalScenarios) * 100);

  const stats = [
    {
      label: 'Range Modules Mastered',
      value: `${completedCount} / ${totalScenarios}`,
      sub: `${completionPct}% completed`,
      progress: completionPct,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      barColor: 'from-emerald-500 to-teal-400',
    },
    {
      label: 'Combat XP Earned',
      value: `${xp.toLocaleString()} XP`,
      sub: `Level ${getLevel(xp)} Specialist`,
      progress: Math.min(100, Math.round((xp % 500) / 5)),
      icon: Zap,
      color: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      barColor: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Defensive Accuracy',
      value: `${accuracy}%`,
      sub: accuracy >= 80 ? 'Optimal Response' : accuracy > 0 ? 'Threat Vulnerability' : 'Uncalibrated',
      progress: accuracy,
      icon: Target,
      color: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      barColor: 'from-rose-500 to-pink-500',
    },
    {
      label: 'Cyber Range Rank',
      value: rank.name,
      sub: 'Security Operations Tier',
      progress: 100,
      icon: Award,
      color: 'text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
      barColor: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="p-4 rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] hover:border-cyan-500/30 backdrop-blur-md relative overflow-hidden group"
              style={{
                background: 'var(--bg-card, rgba(12, 12, 18, 0.8))',
                borderColor: 'var(--border-default, rgba(255, 255, 255, 0.08))',
                boxShadow: 'var(--shadow-sm, 0 4px 20px rgba(0,0,0,0.3))',
              }}
            >
              {/* Subtle top indicator bar */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="overflow-hidden">
                  <p className="text-[11px] font-mono uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>
                    {stat.label}
                  </p>
                  <p className="text-xl font-black mt-0.5 tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300 ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Progress track */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(4, stat.progress)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  <span>{stat.sub}</span>
                  {stat.progress !== undefined && <span className={stat.color}>{stat.progress}%</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
