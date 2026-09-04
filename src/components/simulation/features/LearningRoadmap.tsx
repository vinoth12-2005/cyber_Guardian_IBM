import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Fingerprint, Layers, Target, Terminal } from 'lucide-react';

export function LearningRoadmap() {
  const steps = [
    {
      title: 'Identity, Spear Phishing & Recon Defense',
      desc: 'Master detection of executive spoofing, homograph URLs, credential harvesting forms, and social reconnaissance lures.',
      icon: Fingerprint,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
      badge: 'Tier 1 • Tactical Recon',
    },
    {
      title: 'Network Intercepts & Session Security',
      desc: 'Analyze and defend against Evil Twin Wi-Fi, SSL certificate stripping, ARP spoofing, rogue extensions, and cookie sniffing.',
      icon: Cpu,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      badge: 'Tier 2 • Network Hardening',
    },
    {
      title: 'Client-Side Exploits & Social Engineering',
      desc: 'Neutralize UI redress (clickjacking), Cross-Site Scripting (XSS), token abuse, and weaponized attachment macros.',
      icon: ShieldAlert,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      badge: 'Tier 3 • Client Defense',
    },
    {
      title: 'Ransomware Containment & Cloud Breaches',
      desc: 'Mitigate active double-extortion ransomware payloads, OAuth illicit grants, MFA fatigue, and APT killchains in SOC real time.',
      icon: Lock,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10',
      badge: 'Tier 4 • Incident Containment',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>CYBER RANGE DEFENSE PATHWAY</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Adversary Defense Progression Tiers</h2>
        <p className="text-xs max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>Advance systematically through structured attack defense tiers to level up your combat capability.</p>
      </div>

      <div className="relative max-w-4xl mx-auto pl-6 md:pl-0">
        {/* Vertical Timeline Divider Line */}
        <div className="absolute left-[17px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-sky-500/30 to-cyan-500/40" />

        <div className="space-y-10 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isEven = idx % 2 === 0;

            return (
              <div key={idx} className="flex flex-col md:flex-row items-start md:items-center">
                {/* Timeline node dot */}
                <div
                  className="absolute left-0 md:left-1/2 -translate-x-[11px] md:-translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--accent-primary)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full animate-ping" style={{ background: 'var(--accent-primary)' }} />
                </div>

                {/* Left/Right pane content */}
                <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-end md:pr-10' : 'md:order-2 md:pl-10'}`}>
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="p-5 rounded-2xl border backdrop-blur-md w-full max-w-md shadow-lg space-y-3 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'var(--bg-card)',
                      borderColor: 'var(--border-default)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${step.border} ${step.bg} ${step.color}`}>
                        {step.badge}
                      </span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${step.border} ${step.bg}`}>
                        <Icon className={`w-4 h-4 ${step.color}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Spacer for layout */}
                <div className="hidden md:block w-1/2" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
