import React from 'react';
import { useCyberStore } from '@/store/cyber-store';
import { formatDate } from '@/lib/utils';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function AchievementsPage() {
  const achievements = useCyberStore(s => s.achievements);
  const completedCount = useCyberStore(s => s.completedList.length);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center">
            <span className="w-2.5 h-6 bg-cyberAccent rounded-full mr-3 inline-block"></span>
            Security Credentials & Achievements
          </h1>
          <p className="text-xs text-slate-400 mt-1">Unlock badges by successfully defending mock targets and gaining security experience points.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-center sm:text-right">
          <span className="text-slate-400">Unlocked:</span>{' '}
          <span className="text-cyberAccent font-bold font-sans text-sm">
            {achievements.filter(a => a.unlocked).length} / {achievements.length}
          </span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          const isUnlocked = ach.unlocked;
          
          // Resolve corresponding icon
          // @ts-ignore
          const Icon = LucideIcons[ach.icon] || Award;

          return (
            <div 
              key={ach.id}
              className={`glass p-5 rounded-xl border flex items-start space-x-4 relative transition-all duration-300 ${
                isUnlocked 
                  ? 'border-cyberAccent/30 bg-cyberAccent/5 shadow-[0_0_15px_rgba(124,58,237,0.06)]' 
                  : 'border-slate-800/80 opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                isUnlocked 
                  ? 'bg-cyberAccent/20 border-cyberAccent/30 text-cyberAccent' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}>
                {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>

              {/* Badge Details */}
              <div className="space-y-1.5 overflow-hidden">
                <div className="flex items-center space-x-2">
                  <h3 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                    {ach.title}
                  </h3>
                  {isUnlocked && (
                    <CheckCircle2 className="w-4 h-4 text-cyberSecondary flex-shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {ach.description}
                </p>
                {isUnlocked && ach.unlockedAt && (
                  <p className="text-[9px] text-slate-500 font-mono">
                    Unlocked: {formatDate(ach.unlockedAt)}
                  </p>
                )}
                {!isUnlocked && (
                  <p className="text-[9px] text-cyberPrimary font-mono">
                    {ach.simulationId ? 'Target: Complete simulation #' + ach.simulationId : ''}
                    {ach.simulationsRequired ? 'Target: Complete ' + ach.simulationsRequired + ' simulations' : ''}
                    {ach.xpRequired ? 'Target: Accumulate ' + ach.xpRequired + ' XP' : ''}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
