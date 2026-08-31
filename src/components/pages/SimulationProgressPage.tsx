import React from 'react';
import { useCyberStore } from '@/store/cyber-store';
import { getLevel, getLevelProgress, getRank, formatDate } from '@/lib/utils';
import { ShieldCheck, Award, Zap, Target, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProgressPage() {
  const completedList = useCyberStore(s => s.completedList);
  const xp = useCyberStore(s => s.profile.xp);
  const totalXp = useCyberStore(s => s.profile.totalXp);
  // compute accuracy from completed list outcomes
  const accuracy = completedList.length === 0
    ? 0
    : Math.round((completedList.filter(c => c.outcome === 'safe').length / completedList.length) * 100);
  const rank = getRank(xp);
  const level = getLevel(xp);
  const progressPercent = Math.round(getLevelProgress(xp) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center">
          <span className="w-2.5 h-6 bg-cyberSecondary rounded-full mr-3 inline-block"></span>
          Academy Progress Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">Audit your cybersecurity awareness training completions, accuracy scores, and active level progression.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level card */}
        <div className="glass p-6 rounded-xl border border-cyan-500/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Current Level</h3>
            <Zap className="w-5 h-5 text-cyberPrimary" />
          </div>
          <div className="my-6">
            <p className="text-4xl font-extrabold text-white">Level {level}</p>
            <div className="mt-3.5 bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-cyberPrimary to-cyberSecondary rounded-full shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
              <span>{xp % 500} / 500 XP</span>
              <span>{progressPercent}% towards next level</span>
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="glass p-6 rounded-xl border border-cyan-500/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Simulation Accuracy</h3>
            <Target className="w-5 h-5 text-cyberDanger" />
          </div>
          <div className="my-6 space-y-2">
            <p className="text-4xl font-extrabold text-white">{accuracy}%</p>
            <p className="text-xs text-slate-400">Calculated based on decisions submitted during live interactive modules.</p>
          </div>
        </div>

        {/* Rank Card */}
        <div className="glass p-6 rounded-xl border border-cyan-500/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Security Rank</h3>
            <Award className="w-5 h-5 text-cyberAccent" />
          </div>
          <div className="my-6 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{rank.icon}</span>
              <span className="text-xl font-bold text-white">{rank.name}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Earn more XP to unlock the next system authorization rank.</p>
          </div>
        </div>
      </div>

      {/* Completion log and overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary Stats & Roadmap Checkmarks */}
        <div className="glass p-6 rounded-xl border border-cyan-500/10 space-y-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
            <BookOpen className="w-4 h-4 text-cyberPrimary mr-2" />
            Academy Milestones
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-300">Total Simulations Completed</span>
              <span className="text-xs font-mono font-bold text-cyberSecondary bg-cyberSecondary/10 px-2 py-0.5 rounded border border-cyberSecondary/20">
                {completedList.length} / 40
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-300">Total XP Accumulated</span>
              <span className="text-xs font-mono font-bold text-cyberPrimary bg-cyberPrimary/10 px-2 py-0.5 rounded border border-cyberPrimary/20">
                {totalXp} XP
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-center">
            <Link 
              to="/simulation"
              className="inline-flex items-center text-xs font-bold text-cyberPrimary hover:underline"
            >
              <span>Browse Active Modules</span>
              <Sparkles className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>

        {/* Right: History log */}
        <div className="glass p-6 rounded-xl border border-cyan-500/10 space-y-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
            <ShieldCheck className="w-4 h-4 text-cyberSecondary mr-2" />
            Completed Modules Ledger
          </h3>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-mono">Module Name</th>
                  <th className="pb-3 font-mono">Difficulty</th>
                  <th className="pb-3 font-mono">Stars Earned</th>
                  <th className="pb-3 font-mono">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {completedList.map((sim, index) => {
                  let diffClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  if (sim.difficulty === 'Intermediate') {
                    diffClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                  } else if (sim.difficulty === 'Advanced') {
                    diffClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                  }

                  return (
                    <tr key={index} className="text-slate-300 hover:bg-slate-900/30 transition">
                      <td className="py-3.5 font-semibold text-white">{sim.title}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${diffClass}`}>
                          {sim.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 text-cyberSecondary font-bold font-mono">
                        {Array.from({ length: sim.stars }).map((_, i) => (
                          <span key={i} className="mr-0.5">★</span>
                        ))}
                        {Array.from({ length: 3 - sim.stars }).map((_, i) => (
                          <span key={i} className="text-slate-700 mr-0.5">★</span>
                        ))}
                      </td>
                      <td className="py-3.5 text-slate-400 font-mono">{formatDate(sim.date)}</td>
                    </tr>
                  );
                })}

                {completedList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                      No simulations completed yet. Click below to launch your first challenge.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
