import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Terminal, ChevronRight, Crosshair, Zap, Radio, Lock } from 'lucide-react';
import { seScenarios } from '@/data/simulation/se-scenarios';

export function HeroSection() {
  const totalSims = seScenarios.length;
  const stats = [
    { label: 'Attack Simulations', value: `${totalSims}`, sub: 'Interactive combat scenarios' },
    { label: 'Threat Vectors', value: '15+', sub: 'Red-team exploit vectors' },
    { label: 'Safe Sandbox', value: '100%', sub: 'Zero-risk isolated range' },
  ];

  const scrollToSims = () => {
    const el = document.getElementById('simulations');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24 flex flex-col items-center justify-center text-center px-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.10] blur-[120px] pointer-events-none" style={{ background: '#38BDF8' }} />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 rounded-full opacity-[0.08] blur-[100px] pointer-events-none animate-pulse" style={{ background: '#7C3AED' }} />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full opacity-[0.06] blur-[90px] pointer-events-none" style={{ background: '#E11D6B' }} />

      {/* Live status tag */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono mb-8 backdrop-blur-md"
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          color: '#38BDF8',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)'
        }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-semibold tracking-wider">CYBER RANGE • THREAT COMBAT MATRIX ACTIVE</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl"
      >
        <span className="text-white">Adversary Threat &</span>
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500">
          Defense Simulation Range
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-slate-300 dark:text-slate-400 text-sm md:text-lg max-w-3xl mt-6 leading-relaxed"
      >
        Experience realistic phishing drills, ransomware attacks, MITM network intercepts, cloud breaches, and multi-stage adversary tactics in a safe, sandboxed Cyber Range. Master live defense through hands-on combat scenarios.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 mt-10 z-10"
      >
        <button
          onClick={scrollToSims}
          className="w-full sm:w-auto font-bold px-8 py-3.5 rounded-xl transition-all duration-300 font-mono tracking-wider flex items-center justify-center gap-2.5 cursor-pointer text-slate-950 shadow-lg group hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
            boxShadow: '0 8px 30px rgba(56, 189, 248, 0.35)',
          }}
        >
          <Crosshair className="w-4 h-4 stroke-[2.5] text-slate-950 group-hover:rotate-45 transition-transform duration-300" />
          <span>DEPLOY THREAT RANGE</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={scrollToSims}
          className="w-full sm:w-auto border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white px-8 py-3.5 rounded-xl transition-all duration-300 font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md hover:bg-cyan-500/10"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>EXPLORE ALL {totalSims} DRILLS</span>
        </button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl w-full"
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30"
            style={{
              background: 'rgba(12, 12, 18, 0.65)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {s.value}
            </div>
            <div className="text-xs text-slate-200 font-bold mt-1 tracking-wide">{s.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Safety notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-center gap-2 mt-8 text-xs text-slate-400 border border-emerald-500/20 bg-emerald-950/20 px-4 py-2 rounded-full backdrop-blur-sm"
      >
        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>All environments are strictly sandboxed & isolated. Zero real data collected. All targets use .test / .invalid TLDs.</span>
      </motion.div>
    </section>
  );
}
