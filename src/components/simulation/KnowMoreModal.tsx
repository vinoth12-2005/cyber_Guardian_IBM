import React, { useState } from 'react';
import {
  BookOpen, Terminal, AlertTriangle, Shield, CheckCircle2,
  ExternalLink, Info, Lightbulb, X, Eye, Lock, Zap, Target, FileText
} from 'lucide-react';
import type { SESimulation } from '@/types';
import { getScenarioDetail } from '@/data/simulation/detailed-explanations';

export function KnowMoreModal({ sim, onClose }: { sim: SESimulation; onClose: () => void }) {
  const detail = getScenarioDetail(sim);
  const [activeTab, setActiveTab] = useState<'overview' | 'howit' | 'redflags' | 'prevent' | 'answers' | 'mitre'>('overview');

  const TABS = [
    { id: 'overview', label: '📖 Overview', color: 'text-cyan-400' },
    { id: 'howit',    label: '⚙️ How It Works', color: 'text-amber-400' },
    { id: 'redflags', label: '🚨 Red Flags', color: 'text-red-400' },
    { id: 'prevent',  label: '🛡 Prevention', color: 'text-emerald-400' },
    { id: 'answers',  label: '🔑 Q&A Guide', color: 'text-purple-400' },
    { id: 'mitre',    label: '🎯 MITRE', color: 'text-blue-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0d1117] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-cyan-400 font-bold">{sim.id}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{sim.category}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                  sim.difficulty === 'Beginner' ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' :
                  sim.difficulty === 'Intermediate' ? 'bg-amber-950/40 border-amber-800/60 text-amber-400' :
                  'bg-red-950/40 border-red-800/60 text-red-400'
                }`}>{sim.difficulty}</span>
              </div>
              <h2 className="text-sm font-bold text-white leading-tight mt-0.5">{sim.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto flex-shrink-0">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-3 py-2.5 border-b-2 text-[11px] font-semibold transition whitespace-nowrap ${
                activeTab === tab.id ? `border-current ${tab.color} bg-slate-900/60` : 'border-transparent text-slate-500 hover:text-slate-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-cyan-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Attack Vector
                </div>
                <div className="text-slate-200 text-sm font-semibold">{detail.attackVector}</div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{detail.detailedExplanation}</p>
              </div>

              {detail.conceptDiagramAlt && (
                <div className="bg-slate-950 border border-cyan-900/40 rounded-xl p-3">
                  <div className="text-[10px] text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> ATTACK FLOW DIAGRAM
                  </div>
                  <div className="bg-gradient-to-br from-slate-900 to-cyan-950/20 border border-slate-800 rounded-lg p-3 text-center">
                    <div className="text-[11px] text-slate-300 font-mono leading-loose">{detail.conceptDiagramAlt}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 space-y-2">
                  <div className="text-amber-400 font-bold uppercase text-[10px]">Psychological Triggers</div>
                  <div className="flex flex-wrap gap-1">
                    {detail.psychologicalTriggers.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-200 text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-3 space-y-2">
                  <div className="text-blue-400 font-bold uppercase text-[10px]">Real-World Impact</div>
                  <p className="text-blue-200 leading-relaxed">{detail.realWorldImpact}</p>
                </div>
              </div>

              {detail.realWorldCase && (
                <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-4 space-y-1.5">
                  <div className="text-red-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Real-World Case Study
                  </div>
                  <p className="text-red-200 leading-relaxed">{detail.realWorldCase}</p>
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="text-red-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Data Stolen in This Attack
                </div>
                <div className="space-y-1">
                  {(detail.dataStolen ?? ['Account credentials', 'Session tokens', 'PII']).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-1.5 bg-red-950/20 border border-red-900/30 rounded text-red-200">
                      <span className="text-red-500 font-bold flex-shrink-0">⚠</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HOW IT WORKS (step-by-step attack chain) ── */}
          {activeTab === 'howit' && (
            <div className="space-y-4">
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3">
                <div className="text-amber-400 font-bold uppercase text-[10px] mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Threat Level & Risk
                </div>
                <p className="text-amber-200 leading-relaxed">
                  Difficulty: <strong>{sim.difficulty}</strong> | Category: <strong>{sim.category}</strong> | Risk: <strong className="text-red-400">High if undetected</strong>
                </p>
                <p className="text-slate-400 mt-2 leading-relaxed">
                  This attack exploits <strong className="text-amber-300">{detail.attackVector}</strong>. Attackers use psychological manipulation to bypass technical controls. Without awareness training, success rates exceed 30% in corporate environments.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-slate-300 font-bold text-[10px] uppercase flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-red-400" /> Step-by-Step Attack Kill Chain
                </div>
                {(detail.attackChain ?? detail.defensivePlaybook.map((s, i) => `Step ${i+1}: ${s}`)).map((step, i, arr) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center gap-0 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-red-900/60 border border-red-700/60 flex items-center justify-center text-[10px] font-bold text-red-300">{i + 1}</div>
                      {i < arr.length - 1 && <div className="w-0.5 h-5 bg-slate-700 mt-0.5" />}
                    </div>
                    <div className={`flex-1 pb-2 ${i < arr.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                      <p className="text-slate-200 leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-400 flex items-start gap-1.5">
                <Info className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                Attackers can execute this chain in minutes. Early detection at Step 1 or 2 is critical. If you reach Step 3+, assume compromise and escalate immediately.
              </div>
            </div>
          )}

          {/* ── RED FLAGS ── */}
          {activeTab === 'redflags' && (
            <div className="space-y-3">
              <div className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Indicators of Compromise — Spot These Red Flags
              </div>
              <p className="text-slate-400 leading-relaxed">
                These are the exact warning signs that this attack is in progress. In the lab VM (right panel), you can observe these indicators. Identifying even ONE should trigger an incident report.
              </p>
              <div className="space-y-2">
                {detail.redFlags.map((flag, i) => (
                  <div key={i} className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 flex items-start gap-2.5 text-amber-200">
                    <span className="text-amber-500 font-bold flex-shrink-0 text-sm w-5">#{i+1}</span>
                    <div>
                      <p className="leading-relaxed">{flag}</p>
                      <p className="text-amber-400/70 text-[10px] mt-1 font-mono">→ Action: Immediately report to SOC or perform out-of-band verification.</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 text-[10px] text-red-300 flex items-start gap-1.5">
                <Info className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                <span><strong>🔑 Q1 Answer Hint:</strong> The primary spoofed indicator or attack technique is directly described by the <strong>attack vector</strong> above: <em>"{detail.attackVector}"</em>. Use this as your answer for Question 1.</span>
              </div>
            </div>
          )}

          {/* ── PREVENTION ── */}
          {activeTab === 'prevent' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4 space-y-3">
                <div className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Incident Response Playbook (Step-by-Step)
                </div>
                <p className="text-slate-400 leading-relaxed">Follow these steps in order when you detect this attack. This is what SOC analysts do in real incidents.</p>
                <div className="space-y-2">
                  {detail.defensivePlaybook.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-emerald-200">
                      <span className="w-5 h-5 rounded bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">{i + 1}</span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-cyan-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Enterprise & SOC Controls
                </div>
                <div className="space-y-1.5">
                  {detail.mitigationChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-xl p-3 text-[10px] text-cyan-300 flex items-start gap-1.5">
                <Info className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>🔑 Q2 Answer Hint:</strong> The primary defensive control is Step 1 of the playbook above: <em>"{detail.defensivePlaybook[0]}"</em>. Use this as your answer for Question 2.</span>
              </div>

              {detail.referralLinks && detail.referralLinks.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-cyan-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" /> Official Learning Resources
                  </div>
                  <div className="space-y-1.5">
                    {detail.referralLinks.map(link => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-cyan-700/60 hover:bg-cyan-950/20 transition group">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{link.org}</span>
                          <span className="text-slate-300 group-hover:text-cyan-300 transition">{link.label}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Q&A GUIDE (answers hidden here, users must read) ── */}
          {activeTab === 'answers' && (
            <div className="space-y-4">
              <div className="bg-purple-950/30 border border-purple-700/50 rounded-xl p-3">
                <div className="text-purple-300 font-bold uppercase text-[10px] flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5" /> Lab Q&A Guide — Read Carefully to Find Your Answers
                </div>
                <p className="text-slate-400 leading-relaxed">The answers to all lab questions are derived from the content across this modal. Read each section carefully, then type what you find into the answer boxes in the lab. Do NOT just copy — understand why each answer is correct.</p>
              </div>

              {[
                {
                  q: `Q1: What primary attack technique or spoofed indicator is exploited?`,
                  where: 'Overview tab → Attack Vector field',
                  answer: detail.attackVector,
                  tip: 'This is the core technical name of the attack. Write it in your own words based on what you see in the VM.',
                  color: 'border-cyan-800/50 bg-cyan-950/20',
                  labelColor: 'text-cyan-400',
                },
                {
                  q: `Q2: What primary defensive control or IoC mitigation prevents this threat?`,
                  where: 'Prevention tab → Step 1 of Incident Response Playbook',
                  answer: detail.defensivePlaybook[0],
                  tip: 'The first defensive step is always the most critical. In the VM, this is the action you take when you click the report/block button.',
                  color: 'border-emerald-800/50 bg-emerald-950/20',
                  labelColor: 'text-emerald-400',
                },
                {
                  q: `Q3: What is the most critical red flag (IoC) indicating this attack?`,
                  where: 'Red Flags tab → Red Flag #1',
                  answer: detail.redFlags[0],
                  tip: 'Look at what is visually different or suspicious in the VM. The first red flag is the most obvious indicator.',
                  color: 'border-amber-800/50 bg-amber-950/20',
                  labelColor: 'text-amber-400',
                },
                {
                  q: `Q4: What real-world data does the attacker steal?`,
                  where: 'Overview tab → Data Stolen section',
                  answer: (detail.dataStolen ?? ['Account credentials'])[0],
                  tip: 'Think about what information you entered or submitted in the VM during the attack scenario.',
                  color: 'border-red-800/50 bg-red-950/20',
                  labelColor: 'text-red-400',
                },
                {
                  q: `Q5: What is the attacker's first action in the kill chain?`,
                  where: 'How It Works tab → Kill Chain Step 1',
                  answer: (detail.attackChain ?? ['Attacker sends initial communication'])[0],
                  tip: 'The kill chain always starts with the attacker making initial contact or setting up infrastructure.',
                  color: 'border-blue-800/50 bg-blue-950/20',
                  labelColor: 'text-blue-400',
                },
                {
                  q: `Q6: What enterprise SOC control blocks this at the perimeter?`,
                  where: 'Prevention tab → Enterprise & SOC Controls',
                  answer: detail.mitigationChecklist[0],
                  tip: 'Enterprise controls are technical measures deployed by IT/security teams, not user actions.',
                  color: 'border-purple-800/50 bg-purple-950/20',
                  labelColor: 'text-purple-400',
                },
                {
                  q: `Q7: What MITRE ATT&CK technique ID is most associated with this attack?`,
                  where: 'MITRE tab → First technique listed',
                  answer: detail.mitreTechniques[0]?.id + ' — ' + detail.mitreTechniques[0]?.name,
                  tip: 'MITRE technique IDs start with "T" followed by numbers. Find the first one in the MITRE tab.',
                  color: 'border-blue-800/50 bg-blue-950/20',
                  labelColor: 'text-blue-300',
                },
                {
                  q: `Q8: Name the real-world security incident that demonstrates this attack.`,
                  where: 'Overview tab → Real-World Case Study',
                  answer: detail.realWorldCase?.split('.')[0] ?? 'See real-world case in Overview tab',
                  tip: 'Look for the case study box in the Overview tab. Write the name of the company or incident.',
                  color: 'border-red-800/50 bg-red-950/20',
                  labelColor: 'text-red-300',
                },
              ].map((item, i) => (
                <div key={i} className={`border rounded-xl p-3.5 space-y-2 ${item.color}`}>
                  <div className={`font-bold text-[11px] ${item.labelColor}`}>{item.q}</div>
                  <div className="text-[10px] text-slate-400 font-mono">📍 Where to find it: <span className="text-slate-300">{item.where}</span></div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-slate-200">
                    <span className="text-slate-500">Answer clue: </span>{item.answer}
                  </div>
                  <div className="text-[10px] text-slate-400 italic">💡 {item.tip}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── MITRE ATT&CK ── */}
          {activeTab === 'mitre' && (
            <div className="space-y-3">
              <p className="text-slate-400">MITRE ATT&CK techniques used in this scenario. The first technique ID is your Q7 answer.</p>
              <div className="space-y-2">
                {detail.mitreTechniques.map((tech, i) => (
                  <a key={tech.id}
                    href={`https://attack.mitre.org/techniques/${tech.id.replace('.', '/')}/`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-cyan-700/60 hover:bg-cyan-950/20 transition group">
                    <div>
                      <span className="font-mono text-cyan-400 font-bold mr-2">{tech.id}</span>
                      <span className="text-slate-200 font-semibold">{tech.name}</span>
                      {i === 0 && <span className="ml-2 text-[9px] bg-purple-900/60 text-purple-300 border border-purple-700/40 px-1.5 py-0.5 rounded font-mono">← Q7 Answer</span>}
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 text-center pt-1">
                Data source: <a href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">MITRE ATT&CK Framework</a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1117] flex justify-between items-center text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-600">Sources:</span>
            {['MITRE', 'NIST', 'OWASP', 'CISA', 'SANS'].map(src => (
              <span key={src} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-500">{src}</span>
            ))}
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition text-xs">Close</button>
        </div>
      </div>
    </div>
  );
}
