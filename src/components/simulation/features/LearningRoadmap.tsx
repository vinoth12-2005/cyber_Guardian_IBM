import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Cpu, Lock } from 'lucide-react';

export function LearningRoadmap() {
  const steps = [
    {
      title: 'Social & Identity Protection',
      desc: 'Understand phishing tactics, homograph spoofing, fake giveaways, and login forms.',
      icon: ShieldCheck,
      color: 'text-cyberSecondary',
      border: 'border-cyberSecondary/30',
      badge: 'Level 1',
    },
    {
      title: 'Browser & Session Defense',
      desc: 'Master the mechanics of cookies, extension permissions, session sniffing, and notifications.',
      icon: Cpu,
      color: 'text-cyberPrimary',
      border: 'border-cyberPrimary/30',
      badge: 'Level 2',
    },
    {
      title: 'Client-Side Exploits',
      desc: 'Learn about UI redress (clickjacking), Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF).',
      icon: ShieldAlert,
      color: 'text-cyberWarning',
      border: 'border-cyberWarning/30',
      badge: 'Level 3',
    },
    {
      title: 'Server & DB Security',
      desc: 'Defend backend systems from database injection, code exfiltration, credential stuffing, and OAuth scam scopes.',
      icon: Lock,
      color: 'text-cyberAccent',
      border: 'border-cyberAccent/30',
      badge: 'Level 4',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Academy Learning Pathway</h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">Follow this structured timeline to progress your security expertise systematically.</p>
      </div>

      <div className="relative max-w-4xl mx-auto pl-6 md:pl-0">
        {/* Vertical Timeline Divider Line */}
        <div className="absolute left-[17px] md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800" />

        <div className="space-y-12 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isEven = idx % 2 === 0;

            return (
              <div key={idx} className="flex flex-col md:flex-row items-start md:items-center">
                {/* Timeline node dot */}
                <div className="absolute left-0 md:left-1/2 -translate-x-[11px] md:-translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyberPrimary animate-pulse" />
                </div>

                {/* Left pane content */}
                <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-end md:pr-10' : 'md:order-2 md:pl-10'}`}>
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`glass p-5 rounded-xl border ${step.border} w-full max-w-md shadow-lg space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 ${step.color}`}>
                        {step.badge}
                      </span>
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{step.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{step.desc}</p>
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
