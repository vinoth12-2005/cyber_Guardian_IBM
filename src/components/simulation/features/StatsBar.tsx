import React from 'react';
import { useCyberStore } from '@/store/cyber-store';
import { seScenarios } from '@/data/simulation/se-scenarios';
import { getRank } from '@/lib/utils';
import { ShieldCheck, Award, Target, Zap } from 'lucide-react';

export function StatsBar() {
  const completedList = useCyberStore(s => s.completedList);
  const completedCount = completedList.length;
  const xp = useCyberStore(s => s.profile.xp);
  const accuracy = completedList.length === 0
    ? 0
    : Math.round((completedList.filter(c => c.outcome === 'safe').length / completedList.length) * 100);
  const rank = getRank(xp);

  const stats = [
    {
      label: 'Modules Completed',
      value: `${completedCount}/${seScenarios.length}`,
      icon: ShieldCheck,
      color: 'text-cyberSecondary',
      glow: 'shadow-cyberSecondary/5',
    },
    {
      label: 'Total XP Earned',
      value: `${xp} XP`,
      icon: Zap,
      color: 'text-cyberPrimary',
      glow: 'shadow-cyberPrimary/5',
    },
    {
      label: 'Overall Accuracy',
      value: `${accuracy}%`,
      icon: Target,
      color: 'text-cyberDanger',
      glow: 'shadow-cyberDanger/5',
    },
    {
      label: 'Academy Rank',
      value: rank.name,
      icon: Award,
      color: 'text-cyberAccent',
      glow: 'shadow-cyberAccent/5',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className={`glass p-4 rounded-xl flex items-center space-x-3.5 border border-cyan-500/10 shadow-lg ${stat.glow} transition-all duration-300`}
            >
              <div className={`w-10 h-10 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-sm md:text-lg font-bold text-white mt-0.5 truncate">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
