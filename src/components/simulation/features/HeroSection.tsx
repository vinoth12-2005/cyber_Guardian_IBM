import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Terminal, ChevronRight, Eye, AlertTriangle, Zap } from 'lucide-react';
import { seScenarios } from '@/data/simulation/se-scenarios';

export function HeroSection() {
  const totalSims = seScenarios.length;
  const stats = [
    { label: 'Simulations', value: `${totalSims}`, sub: 'Interactive scenarios' },
    { label: 'Attack Types', value: '15+', sub: 'Social engineering vectors' },
    { label: 'Safe Sandbox', value: '100%', sub: 'No real data used' },
  ];

  const scrollToSims = () => {
    const el = document.getElementById('simulations');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-28 flex flex-col items-center justify-center text-center px-4">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-[0.07] blur-[100px] pointer-events-none" style={{ background: '#00E5FF' }} />
      <div className="absolute top-2/3 left-1/4 w-60 h-60 rounded-full opacity-[0.05] blur-[80px] pointer-events-none animate-pulse" style={{ background: '#7C3AED' }} />

      {/* Live status tag */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono mb-8"
        style={{ background: 'rgba(0,229,255,0.05)', borderColor: 'rgba(0,229,255,0.2)', color: '#00E5FF' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        SE-LAB TRAINING ENVIRONMENT ACTIVE
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none max-w-4xl"
      >
        <span className="text-white">Social Engineering</span>
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
          Simulation Lab
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-slate-400 text-sm md:text-lg max-w-2xl mt-6 leading-relaxed"
      >
        Experience realistic phishing, vishing, smishing, ransomware, and social engineering attacks in a completely safe, sandboxed environment.
        Learn by doing — not by reading.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-3 mt-10 z-10"
      >
        <button
          onClick={scrollToSims}
          className="w-full sm:w-auto font-bold px-8 py-3.5 rounded-xl transition-all duration-300 font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer text-slate-950"
          style={{ background: 'linear-gradient(135deg,#00E5FF,#0EA5E9)', boxShadow: '0 8px 32px rgba(0,229,255,0.2)' }}
        >
          <span>START TRAINING</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={scrollToSims}
          className="w-full sm:w-auto border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-white px-8 py-3.5 rounded-xl transition-all duration-300 font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>VIEW ALL {totalSims} SIMS</span>
        </button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center justify-center gap-6 mt-14 flex-wrap"
      >
        {stats.map((s, i) => (
          <div key={i} className="text-center px-5 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,229,255,0.08)' }}>
            <div className="text-2xl font-black text-cyan-400">{s.value}</div>
            <div className="text-xs text-slate-300 font-semibold">{s.label}</div>
            <div className="text-[10px] text-slate-500">{s.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Safety notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-center gap-2 mt-8 text-[11px] text-slate-500"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        All environments are fully sandboxed. No real data collected. All domains use .test/.invalid TLDs.
      </motion.div>
    </section>
  );
}
