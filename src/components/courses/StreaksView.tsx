import React from 'react';
import type { StreakData } from '../../types/courses';
import { Flame, Trophy, Shield, Star, CheckCircle2 } from 'lucide-react';

interface StreaksViewProps {
  streak: StreakData;
}

export const StreaksView: React.FC<StreaksViewProps> = ({ streak }) => {
  const { current, best, week } = streak;
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7;

  const milestones = [
    { n: 3, label: '3-Day Spark', icon: Flame, got: best >= 3 },
    { n: 7, label: 'Weekly Warrior', icon: Star, got: best >= 7 },
    { n: 14, label: 'Two-Week Titan', icon: Shield, got: best >= 14 },
    { n: 30, label: 'Monthly Master', icon: Trophy, got: best >= 30 },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400 block mb-1">
          Consistency & Badges
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Learning Streaks</h1>
        <p className="text-sm text-secondary mt-1">
          Train daily to maintain active defense skills and unlock streak milestones.
        </p>
      </div>

      {/* Main Flame Hero */}
      <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-amber-500/20">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-black flex items-center justify-center shadow-2xl shadow-orange-500/30 shrink-0 animate-pulse-slow">
          <Flame className="w-12 h-12" />
        </div>

        <div className="space-y-3 text-center md:text-left flex-1">
          <div>
            <div className="text-4xl font-extrabold text-primary">{current} Days</div>
            <div className="text-xs text-secondary mt-0.5">
              Active learning streak — your personal record is{' '}
              <span className="font-bold text-amber-400">{best} days</span>.
            </div>
          </div>

          {/* Week Check-in Strip */}
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            {dow.map((d, i) => {
              const active = week[i];
              const isToday = i === todayIdx;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-muted uppercase">{d}</span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                      active
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/20'
                        : isToday
                        ? 'border-purple-500/50 text-purple-400 bg-purple-500/10'
                        : 'border-white/5 bg-white/5 text-muted'
                    }`}
                  >
                    {active ? <Flame className="w-4 h-4" /> : <span className="text-xs">•</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m) => {
          const IconComp = m.icon;
          return (
            <div
              key={m.n}
              className={`glass-card rounded-2xl p-5 text-center space-y-3 transition-all ${
                m.got ? 'border-amber-500/30 shadow-lg' : 'opacity-50 grayscale'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                  m.got
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-muted'
                }`}
              >
                <IconComp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary">{m.label}</h4>
                <p className="text-[11px] text-muted">{m.n}-Day Streak</p>
              </div>
              {m.got && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Unlocked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
