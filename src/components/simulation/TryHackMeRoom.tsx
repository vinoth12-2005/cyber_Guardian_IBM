// ============================================================
// SE-LAB — TryHackMe-Style Split-Screen Cyber Range Room
// Hands-on task questions, theory, flag submission & live VM sandbox
// ============================================================

import React, { useState } from 'react';
import {
  Terminal, Shield, Play, Power, RefreshCw, CheckCircle2,
  HelpCircle, Flag, ChevronRight, BookOpen, AlertTriangle,
  Lock, Eye, Cpu, Zap, Info, Server, ExternalLink, Star, Trophy,
  Copy, Key, Sparkles, ShieldCheck
} from 'lucide-react';
import type { SESimulation } from '@/types';
import { getScenarioDetail } from '@/data/simulation/detailed-explanations';
import { toast } from 'sonner';

import { useSimulationStore } from '@/store/simulation-store';

interface TryHackMeRoomProps {
  sim: SESimulation;
  children: React.ReactNode; // Embedded interactive VM machine
  onComplete: (outcome: 'safe' | 'compromised' | 'partial') => void;
  onOpenKnowMore: () => void;
}

export function TryHackMeRoom({ sim, children, onComplete, onOpenKnowMore }: TryHackMeRoomProps) {
  const scenarioDetail = getScenarioDetail(sim);
  const session = useSimulationStore(s => s.session);
  const riskScore = session?.riskScore ?? 15;
  const riskLevel = session?.riskLevel ?? (riskScore > 75 ? 'CRITICAL' : riskScore > 50 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW');
  const exposedDataCount = session?.exposedData?.length ?? 0;

  const [machineStatus, setMachineStatus] = useState<'OFFLINE' | 'STARTING' | 'ONLINE'>('ONLINE');
  const [ipAddress] = useState(`10.10.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 5)}`);

  // ── Difficulty-Based Question Bank ─────────────────────────────────────────
  // Easy = 3 questions | Medium = 5 questions | Hard = 8 questions
  // Answers are hidden in the Know More modal — users must read & discover them.
  const difficultyLevel = sim.difficulty?.toLowerCase() ?? 'beginner';
  const questionCount = difficultyLevel.includes('hard') || difficultyLevel.includes('advanced') ? 8
    : difficultyLevel.includes('intermediate') || difficultyLevel.includes('medium') ? 5 : 3;

  const questionBank = [
    // Q1: Core attack technique
    { id: 'q1', label: `What primary attack technique or spoofed indicator is exploited in "${sim.title}"?`, marks: 30,
      hint: '💡 Hint: Read the "Attack Breakdown" tab in Know More for the exact attack vector used.' },
    // Q2: Defensive control
    { id: 'q2', label: `What primary defensive control or IoC mitigation prevents this ${sim.category} threat?`, marks: 30,
      hint: '💡 Hint: Check the "Defense Playbook" tab in Know More — the first item is the key control.' },
    // Q3: Red Flag (easy+)
    { id: 'q3', label: `What is the most critical red flag (IoC) that indicates this attack is happening?`, marks: 20,
      hint: '💡 Hint: Open Know More → "Red Flags" tab. The first listed indicator is the most critical one.' },
    // Q4: Real world impact (medium+)
    { id: 'q4', label: `What real-world data or asset does the attacker steal or compromise in this attack?`, marks: 20,
      hint: '💡 Hint: Know More → "Data Stolen" tab shows exactly what is harvested in this attack.' },
    // Q5: Attack chain step (medium+)
    { id: 'q5', label: `Describe the first action an attacker takes in the kill chain for this attack.`, marks: 20,
      hint: '💡 Hint: Know More → "Attack Chain" tab — Step 1 is the attacker\'s first move.' },
    // Q6: Prevention method (hard)
    { id: 'q6', label: `What enterprise-level SOC control would have blocked this attack at the network perimeter?`, marks: 15,
      hint: '💡 Hint: Know More → "Defense" tab → Enterprise & SOC Controls section.' },
    // Q7: MITRE technique (hard)
    { id: 'q7', label: `What is the MITRE ATT&CK technique ID most associated with this attack?`, marks: 15,
      hint: '💡 Hint: Know More → "MITRE ATT&CK" tab. Check the first technique listed.' },
    // Q8: Real world case (hard)
    { id: 'q8', label: `Name the real-world security incident that demonstrates this attack at scale.`, marks: 15,
      hint: '💡 Hint: Know More → "Attack Breakdown" tab → "Real-World Case Study" section.' },
  ].slice(0, questionCount);

  // Per-question state arrays
  const [qAnswers, setQAnswers] = useState<string[]>(Array(questionCount).fill(''));
  const [qPassed, setQPassed] = useState<boolean[]>(Array(questionCount).fill(false));
  const [showHints, setShowHints] = useState<boolean[]>(Array(questionCount).fill(false));

  // Flag state
  const [flagAnswer, setFlagAnswer] = useState('');
  const [flagPassed, setFlagPassed] = useState(false);

  // Completion & retry modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);

  // Active task tab
  const [activeTab, setActiveTab] = useState<'tasks' | 'theory' | 'ioc'>('tasks');

  // Scoring & Wrong Attempt Tracking
  const [wrongAttempts, setWrongAttempts] = useState(0);
  // Per-question wrong attempt counter
  const [qWrongAttempts, setQWrongAttempts] = useState<number[]>(Array(questionCount).fill(0));

  // Shorthands
  const q1Passed = qPassed[0] ?? false;
  const q2Passed = qPassed[1] ?? false;
  const allQPassed = qPassed.every(Boolean);

  // Derive flag from sim ID
  const expectedFlag = `FLAG{${sim.id.toUpperCase()}_${sim.category.toUpperCase().replace(/\s+/g, '_')}_DEFENDED}`;

  const tasksCompleted = qPassed.filter(Boolean).length + (flagPassed ? 1 : 0);
  const totalTasks = questionCount + 1; // all questions + flag
  const progressPercent = Math.round((tasksCompleted / totalTasks) * 100);

  // Per-question mark values + flag = sum up to 200
  const questionMarkTotal = questionBank.reduce((s, q) => s + q.marks, 0);
  const totalMarks = Math.max(0,
    qPassed.reduce((s, p, i) => s + (p ? (questionBank[i]?.marks ?? 0) : 0), 0)
    + (flagPassed ? (200 - questionMarkTotal) : 0)
    - (wrongAttempts * 15)
  );

  // Dynamic Star Rating
  const earnedStars = (allQPassed && flagPassed && wrongAttempts === 0) ? 3
    : (allQPassed && flagPassed && wrongAttempts <= 2) ? 2 : 1;

  // Risk color configuration
  const riskConfig = {
    SAFE: { color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/40', badgeBg: 'bg-emerald-950/60' },
    LOW: { color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/40', badgeBg: 'bg-cyan-950/60' },
    MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/40', badgeBg: 'bg-amber-950/60' },
    HIGH: { color: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/40', badgeBg: 'bg-orange-950/60' },
    CRITICAL: { color: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/60', badgeBg: 'bg-red-950/80' },
  }[riskLevel] || { color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/40', badgeBg: 'bg-cyan-950/60' };

  // State tracking when defensive action was filed in VM & pop-up modal
  const [defensiveReportFiled, setDefensiveReportFiled] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);

  // React useEffect for VM defensive action detection bridge
  React.useEffect(() => {
    if (!session) return;
    const hasDefensiveAction = session.events.some(ev =>
      ['REPORT_FILED', 'BLOCK_APPLIED', 'VERIFICATION_PERFORMED', 'MFA_REPORTED', 'DEFENSE_ACTION', 'PERMISSION_REJECTED', 'SIMULATION_COMPLETED'].includes(ev.type) ||
      ev.isDefensive
    );

    if (hasDefensiveAction && !defensiveReportFiled) {
      setDefensiveReportFiled(true);
      setShowFlagModal(true);
      toast.success('🎉 Excellent defense! Incident reported! Copy your Root Defense Flag from the pop-up modal to complete Task 3!', { duration: 8000 });
    }
  }, [session?.events, defensiveReportFiled]);

  // Show retry modal when risk reaches HIGH or CRITICAL while lab is not complete
  React.useEffect(() => {
    if ((riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && !allQPassed && !flagPassed && !showCompletionModal) {
      setShowRetryModal(true);
    }
  }, [riskLevel, allQPassed, flagPassed, showCompletionModal]);

  const handleRestartMachine = () => {
    setMachineStatus('STARTING');
    toast.info('Restarting Target Sandbox Machine...');
    setTimeout(() => {
      setMachineStatus('ONLINE');
      toast.success('Machine Online! Target IP active: ' + ipAddress);
    }, 1200);
  };

  const handleQSubmit = (idx: number, e: React.FormEvent) => {
    e.preventDefault();
    const ans = qAnswers[idx]?.trim() ?? '';

    // Must type at least 3 characters — empty or 1-2 char answers are rejected
    if (ans.length < 3) {
      const qw = [...qWrongAttempts];
      qw[idx] = (qw[idx] ?? 0) + 1;
      setQWrongAttempts(qw);
      setWrongAttempts(w => w + 1);
      toast.error(`⚠️ Q${idx + 1}: Wrong or empty answer! -15 Penalty. Read Know More → find the answer → try again.`, { duration: 5000 });
      return;
    }

    const next = [...qPassed];
    next[idx] = true;
    setQPassed(next);
    toast.success(`✓ Question ${idx + 1} Correct! +${questionBank[idx]?.marks ?? 20} Marks Earned! ⭐`);
    checkRoomCompletion(next.every(Boolean), flagPassed);
  };

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagAnswer.trim()) {
      setWrongAttempts(w => w + 1);
      toast.error('⚠️ Warning! No flag entered (-15 Penalty Marks). Report the incident in the VM sandbox first.');
      return;
    }

    const normalizedInput = flagAnswer.trim().toUpperCase();
    const normalizedExpected = expectedFlag.trim().toUpperCase();

    if (normalizedInput === normalizedExpected || normalizedInput.includes(expectedFlag.split('{')[1]?.replace('}', '') || 'SAFE')) {
      setFlagPassed(true);
      toast.success('🎉 ROOT FLAG ACCEPTED! +' + (200 - questionBank.reduce((s, q) => s + q.marks, 0)) + ' Marks Earned! ⭐⭐⭐');
      checkRoomCompletion(qPassed.every(Boolean), true);
    } else {
      setWrongAttempts(w => w + 1);
      toast.error('⚠️ Invalid Flag! -15 Penalty. Report the incident in the VM sandbox to reveal the valid flag.');
    }
  };

  const checkRoomCompletion = (allQ: boolean, flag: boolean) => {
    if (allQ && flag) {
      setShowCompletionModal(true);
      setTimeout(() => { onComplete('safe'); }, 500);
    } else {
      const missing: string[] = [];
      qPassed.forEach((p, i) => { if (!p) missing.push(`Q${i + 1}`); });
      if (!flag) missing.push('Root Flag');
      toast.info(`Progress saved! Still need: ${missing.join(', ')}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f141d] text-slate-200 overflow-hidden font-sans">

      {/* ── TryHackMe Top Header Bar ────────────────────────────────────────── */}
      <header className="h-14 px-4 bg-[#141b26] border-b border-slate-800 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xs font-mono">
              LAB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 font-bold">{sim.id}</span>
                <span className="text-xs font-bold text-white">{sim.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  {sim.category}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                CYBER RANGE LAB • DIFFICULTY: <span className="text-amber-400 font-bold">{sim.difficulty.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Status Bar & Threat Critical Gauge */}
        <div className="flex items-center gap-3">

          {/* ⚡ Dynamic Critical Level Gauge Bar */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono transition-all duration-300 ${riskConfig.badgeBg} ${riskConfig.border}`}>
            <AlertTriangle className={`w-3.5 h-3.5 ${riskConfig.color} ${riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'animate-bounce' : ''}`} />
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[10px] gap-2 font-bold">
                <span className="text-slate-400">CRITICAL LEVEL:</span>
                <span className={`${riskConfig.color}`}>{riskLevel} ({riskScore}%)</span>
              </div>
              <div className="w-28 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-0.5">
                <div
                  className={`h-full ${riskConfig.bg} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(8, riskScore))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Target IP & VM Status */}
          <div className="flex items-center gap-2 bg-[#090d14] px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Target IP:</span>
            <span className="text-emerald-400 font-bold">{ipAddress}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            <span className="text-[10px] text-emerald-400 font-bold">{machineStatus}</span>
          </div>

          <button
            onClick={handleRestartMachine}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title="Restart Target Sandbox VM"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Reset VM</span>
          </button>

          {/* Know More Modal Trigger */}
          <button
            onClick={onOpenKnowMore}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition shadow-md font-mono"
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>Know More</span>
          </button>

          {/* Marks Score Pill */}
          <div className="flex items-center gap-2 bg-[#090d14] px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Score:</span>
            <span className="text-emerald-400 font-bold">{totalMarks} / 200 Marks</span>
            {wrongAttempts > 0 && (
              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/80 px-1.5 py-0.5 rounded font-bold">
                ⚠️ -{wrongAttempts * 15} Deducted
              </span>
            )}
          </div>

          {/* Progress Pill */}
          <div className="flex items-center gap-2 bg-[#090d14] px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Tasks:</span>
            <span className="text-cyan-400 font-bold">{tasksCompleted}/{totalTasks} ({progressPercent}%)</span>
          </div>
        </div>
      </header>

      {/* ── TryHackMe Split-Screen Main Body ──────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT PANEL: TryHackMe Room Tasks, Questions & Theory ──────────── */}
        <div className="w-full md:w-[480px] lg:w-[540px] xl:w-[580px] bg-[#111722] border-r border-slate-800 flex flex-col flex-shrink-0 overflow-hidden">

          {/* Left Panel Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0c1018] px-3 pt-2 gap-1 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3 py-2 rounded-t-lg font-bold flex items-center gap-1.5 transition border-t border-x ${
                  activeTab === 'tasks'
                    ? 'bg-[#111722] border-slate-700 text-emerald-400 border-b-transparent'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Room Tasks & Questions</span>
              </button>
              <button
                onClick={() => setActiveTab('theory')}
                className={`px-3 py-2 rounded-t-lg font-bold flex items-center gap-1.5 transition border-t border-x ${
                  activeTab === 'theory'
                    ? 'bg-[#111722] border-slate-700 text-cyan-400 border-b-transparent'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Attack Breakdown</span>
              </button>
              <button
                onClick={() => setActiveTab('ioc')}
                className={`px-3 py-2 rounded-t-lg font-bold flex items-center gap-1.5 transition border-t border-x ${
                  activeTab === 'ioc'
                    ? 'bg-[#111722] border-slate-700 text-amber-400 border-b-transparent'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>IoC & Defense</span>
              </button>
            </div>

            {/* Direct Know More option in Simulation Tab */}
            <button
              onClick={onOpenKnowMore}
              className="mb-1 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-extrabold flex items-center gap-1.5 transition text-[11px] font-mono shadow-sm flex-shrink-0"
              title="Open Know More educational guide and answer clues"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Know More</span>
            </button>
          </div>

          {/* Left Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-300 leading-relaxed">

            {/* TAB 1: ROOM TASKS & QUESTIONS */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">

                {/* Task 1: Room Overview Card */}
                <div className="bg-[#17202e] border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px] font-mono font-bold">1</span>
                      Task 1: Room Overview & Target System Specs
                    </h3>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">COMPLETE</span>
                  </div>
                  <p className="text-slate-300">{sim.summary}</p>

                  <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
                    <div className="text-emerald-400 font-bold mb-1">TARGET MACHINE INFORMATION:</div>
                    <div className="flex justify-between"><span className="text-slate-500">Target Host IP:</span> <span className="text-slate-200">{ipAddress}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Target Vector:</span> <span className="text-amber-400">{sim.category}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">MITRE Technique:</span> <span className="text-cyan-400">{scenarioDetail?.mitreTechniques?.[0]?.id || 'T1566'}</span></div>
                  </div>
                </div>

                {/* Task 2: Hands-On Questions & Flags */}
                <div className="bg-[#17202e] border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-[10px] font-mono font-bold">2</span>
                      Task 2: Interactive Hands-On Verification
                    </h3>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">{tasksCompleted}/3 Passed</span>
                  </div>

                  <p className="text-slate-400">
                    Interact with the live target machine on the right panel. Inspect headers, payload links, and network logs to answer the questions below.
                  </p>

                  {/* Expert Defender Suggestions Box */}
                  <div className="bg-[#0b1019] border border-cyan-800/40 rounded-lg p-3 space-y-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wide">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      SOC Expert Defender Tip & Suggestions
                    </div>
                    <div className="text-slate-300">
                      💡 <strong>Primary IoC Warning:</strong> {scenarioDetail?.redFlags?.[0] || `Inspect the sender address and domain spelling in ${sim.title}.`}
                    </div>
                    <div className="text-emerald-300 font-mono">
                      🛡️ <strong>Recommended Action:</strong> {scenarioDetail?.defensivePlaybook?.[0] || 'Perform out-of-band verification or submit an Incident Report in the VM panel.'}
                    </div>
                  </div>

                  {/* Defensive Action Celebration & Flag Banner */}
                  {defensiveReportFiled && (
                    <div className="bg-emerald-950/80 border-2 border-emerald-500/70 rounded-xl p-4 text-xs space-y-3 shadow-xl shadow-emerald-950/60 modal-enter">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold font-mono text-xs uppercase">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                          INCIDENT REPORTED SUCCESSFULLY!
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-mono font-bold">
                          FLAG REVEALED
                        </span>
                      </div>
                      <p className="text-emerald-100 text-xs leading-relaxed font-sans">
                        🎯 Great work defending the sandbox environment! Below is your <strong>Root Defense Flag</strong>. Copy and paste this flag into Task 3 below and answer Question 1 &amp; Question 2 to 100% complete the lab!
                      </p>

                      {/* Copyable Flag Box */}
                      <div className="bg-[#090d14] border border-emerald-500/60 rounded-lg p-3 flex items-center justify-between gap-3 font-mono">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs select-all overflow-x-auto">
                          <Key className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="bg-emerald-950/90 px-2.5 py-1 rounded border border-emerald-800 text-emerald-300 font-mono text-xs tracking-wider">
                            {expectedFlag}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(expectedFlag);
                            toast.success('Flag copied to clipboard! Now paste it in Task 3 below.');
                          }}
                          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 flex-shrink-0 shadow-md shadow-emerald-950/40"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Flag
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Dynamic Difficulty-Scaled Question Bank ── */}
                  {/* Answers are hidden in Know More modal — users must discover them hands-on */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>📋 {questionCount} Questions ({difficultyLevel.includes('hard') || difficultyLevel.includes('advanced') ? 'Hard' : difficultyLevel.includes('intermediate') || difficultyLevel.includes('medium') ? 'Medium' : 'Easy'} Mode)</span>
                      <button
                        type="button"
                        onClick={onOpenKnowMore}
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition border border-cyan-800/60 bg-cyan-950/30 px-2 py-0.5 rounded"
                      >
                        <BookOpen className="w-3 h-3" /> Know More — Find Answers Here
                      </button>
                    </div>

                    {questionBank.map((q, idx) => (
                      <form key={q.id} onSubmit={(e) => handleQSubmit(idx, e)} className={`rounded-lg p-3.5 space-y-2.5 border ${qPassed[idx] ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-[#0d121c] border-slate-800'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <label className="font-bold text-slate-200 text-xs flex-1">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded mr-1.5 text-[10px] font-mono font-bold ${qPassed[idx] ? 'bg-emerald-900 text-emerald-400 border border-emerald-700' : 'bg-slate-800 text-cyan-400 border border-slate-700'}`}>{idx + 1}</span>
                            {q.label}
                          </label>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-slate-500 font-mono">{q.marks}pts</span>
                            {qPassed[idx] && <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">✓ PASSED</span>}
                          </div>
                        </div>

                        {!qPassed[idx] && (
                          <>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Type your answer (read Know More to find it)..."
                                value={qAnswers[idx] ?? ''}
                                onChange={e => {
                                  const next = [...qAnswers];
                                  next[idx] = e.target.value;
                                  setQAnswers(next);
                                }}
                                className="flex-1 bg-[#141b28] border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition font-mono"
                              >
                                Submit
                              </button>
                            </div>

                            {/* Wrong attempt warning + Try Again indicator */}
                            {(qWrongAttempts[idx] ?? 0) > 0 && (
                              <div className="p-2 bg-red-950/60 border border-red-700/60 rounded text-[11px] text-red-300 font-mono flex items-center justify-between gap-2">
                                <span>⚠️ {qWrongAttempts[idx]} wrong attempt{(qWrongAttempts[idx] ?? 0) > 1 ? 's' : ''} (-{(qWrongAttempts[idx] ?? 0) * 15} pts). Read <strong className="text-cyan-300">Know More</strong> to find the answer, then try again.</span>
                                <button type="button" onClick={onOpenKnowMore} className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded font-bold hover:bg-cyan-800 transition flex-shrink-0">Know More →</button>
                              </div>
                            )}

                            {/* Hint — points to Know More tab */}
                            <div className="flex items-center justify-between text-[10px]">
                              <button type="button" onClick={() => { const next = [...showHints]; next[idx] = !next[idx]; setShowHints(next); }} className="text-cyan-400 hover:underline flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" /> {showHints[idx] ? 'Hide Hint' : 'Show Hint'}
                              </button>
                            </div>
                            {showHints[idx] && (
                              <div className="p-2 bg-slate-900 border border-cyan-900/50 rounded text-[11px] text-cyan-300 font-mono flex items-start gap-1.5">
                                <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-cyan-400" />
                                <span>{q.hint}</span>
                              </div>
                            )}
                          </>
                        )}

                        {qPassed[idx] && (
                          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-950" /> Answer accepted — +{q.marks} marks awarded
                          </div>
                        )}
                      </form>
                    ))}
                  </div>

                  {/* Task (questionCount+1): Submit Root Defense Flag */}
                  <form onSubmit={handleFlagSubmit} className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <label className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-emerald-400" />
                        Task {questionCount + 1}: Submit Root Defense Flag
                      </label>
                      {flagPassed && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded font-mono font-bold">✓ FLAG CAPTURED</span>}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Report the incident in the VM (right panel) to unlock the flag. Copy the flag from the pop-up, then paste it here to capture it and complete the lab.
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={flagPassed}
                        placeholder="FLAG{...}"
                        value={flagAnswer}
                        onChange={e => setFlagAnswer(e.target.value)}
                        className="flex-1 bg-[#090d14] border border-emerald-800/60 rounded px-3 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={flagPassed}
                        className="px-4 py-1.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition font-mono shadow-md"
                      >
                        Submit Flag
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            )}

            {/* TAB 2: THEORY & ATTACK BREAKDOWN */}
            {activeTab === 'theory' && (
              <div className="space-y-4">
                <div className="bg-[#17202e] border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Attack Vector Theory & Mechanics
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {scenarioDetail?.detailedExplanation || sim.summary}
                  </p>
                </div>

                {scenarioDetail?.attackChain && (
                  <div className="bg-[#17202e] border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Attack Kill Chain Stages</h4>
                    <div className="space-y-2">
                      {scenarioDetail.attackChain.map((step, idx) => (
                        <div key={idx} className="p-2.5 bg-[#0d121c] rounded-lg border border-slate-800 text-xs">
                          <div className="font-bold text-cyan-400 font-mono">Stage {idx + 1}</div>
                          <div className="text-slate-400 mt-1">{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: IOC & DEFENSE PLAYBOOK */}
            {activeTab === 'ioc' && (
              <div className="space-y-4">
                <div className="bg-[#17202e] border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Indicators of Compromise (IoCs)
                  </h3>
                  {scenarioDetail?.redFlags && (
                    <div className="space-y-2">
                      {scenarioDetail.redFlags.map((flag, idx) => (
                        <div key={idx} className="p-2.5 bg-[#0d121c] rounded-lg border border-amber-900/40 text-xs text-amber-200">
                          <strong>🚨 IoC #{idx + 1}:</strong> {flag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {scenarioDetail?.defensivePlaybook && (
                  <div className="bg-[#17202e] border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider">NIST / CISA Incident Response Playbook</h4>
                    <div className="space-y-1.5">
                      {scenarioDetail.defensivePlaybook.map((play, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{play}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Left Panel Footer / External Links */}
          <div className="p-3 border-t border-slate-800 bg-[#0c1018] flex items-center justify-between text-[11px] text-slate-500">
            <span>Official Framework:</span>
            <div className="flex items-center gap-3">
              <a href="https://attack.mitre.org" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                MITRE ATT&CK <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://cisa.gov" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                CISA <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Embedded Live Interactive VM Sandbox Machine ────── */}
        <div className="flex-1 bg-[#090d14] flex flex-col overflow-hidden relative">

          {/* VM Control Header */}
          <div className="h-9 px-4 bg-[#111722] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${riskConfig.bg} animate-pulse`} />
              <span className="text-white font-bold">LIVE TARGET MACHINE SANDBOX</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">OS: Windows 11 / Linux EDR Shell</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className={`${riskConfig.color} font-bold flex items-center gap-1`}>
                <Shield className="w-3 h-3" /> THREAT: {riskLevel} ({riskScore}%)
              </span>
              <span className="text-slate-600">|</span>
              <span className={exposedDataCount > 0 ? 'text-red-400 font-bold animate-pulse' : 'text-slate-400'}>
                EXFILTRATED: {exposedDataCount} ITEMS
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">FPS: 60</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">LATENCY: 12ms</span>
            </div>
          </div>

          {/* Live Machine Content (VictimOSWrapper / Custom Environment) */}
          <div className="flex-1 p-3 overflow-hidden">
            {children}
          </div>
        </div>

      </div>

      {/* ── FLAG UNLOCKED CONGRATULATIONS POP-UP MODAL ── */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95">
          <div className="bg-[#111722] border-2 border-emerald-500/80 rounded-2xl p-6 max-w-lg w-full text-center space-y-5 shadow-2xl shadow-emerald-950/80 modal-enter relative overflow-hidden">

            {/* Glowing Background Accent */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/30 blur-2xl rounded-full pointer-events-none" />

            {/* Icon Header */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-900/40">
                <ShieldCheck className="w-9 h-9 text-emerald-400 animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-md font-mono">
                <Sparkles className="w-3 h-3 fill-slate-950" /> UNLOCKED
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-wide uppercase">
                🎉 CONGRATULATIONS! THREAT CONTAINED!
              </h2>
              <p className="text-xs text-slate-300">
                SOC Incident Report verified for <span className="text-emerald-400 font-mono font-bold">{sim.title}</span>. Target machine is secure.
              </p>
            </div>

            {/* Flag Display Box */}
            <div className="bg-[#090d14] border-2 border-emerald-500/60 rounded-xl p-4 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Key className="w-3.5 h-3.5" /> ROOT DEFENSE FLAG:
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                  100% VERIFIED
                </span>
              </div>
              <div className="bg-emerald-950/70 border border-emerald-700/50 rounded-lg p-3 text-emerald-300 font-mono font-extrabold text-sm tracking-wider select-all break-all shadow-md">
                {expectedFlag}
              </div>
              <p className="text-[11px] text-slate-400 text-left pt-1">
                📌 <strong>Next Step:</strong> Copy this flag, paste it into <strong>Task 3</strong> on the left panel, and answer Question 1 &amp; Question 2 to complete the lab!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(expectedFlag);
                  toast.success('Flag copied to clipboard! Paste it into Task 3.');
                  setShowFlagModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 font-mono"
              >
                <Copy className="w-4 h-4" /> Copy Flag &amp; Paste in Task 3
              </button>
              <button
                onClick={() => setShowFlagModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── NOT AWARE / RETRY MODAL (fires on HIGH or CRITICAL risk while incomplete) ── */}
      {showRetryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in-95">
          <div className="bg-[#111722] border-2 border-red-500/70 rounded-2xl p-6 max-w-lg w-full text-center space-y-5 shadow-2xl shadow-red-950/80 relative overflow-hidden">

            {/* Red glow accent */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-red-500/25 blur-2xl rounded-full pointer-events-none" />

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border-2 border-red-500/80 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-9 h-9 text-red-400 animate-pulse" />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">⚠ SECURITY AWARENESS FAILURE</div>
              <h2 className="text-xl font-black text-white tracking-wide">You Are NOT Aware of This Threat!</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                The threat level has reached <span className="text-red-400 font-bold">{riskLevel}</span>. You did not identify and mitigate the attack in time. The target system is now at maximum risk.
              </p>
            </div>

            {/* What to do */}
            <div className="bg-[#090d14] border border-amber-800/60 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="text-amber-400 font-bold uppercase text-[10px] font-mono mb-1.5">📚 How to Pass This Lab:</div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-start gap-2"><span className="text-amber-400 font-bold flex-shrink-0">1.</span> Click <strong className="text-cyan-300">"Know More"</strong> in the top bar — read ALL tabs carefully.</div>
                <div className="flex items-start gap-2"><span className="text-amber-400 font-bold flex-shrink-0">2.</span> <span>Answers to all questions are <strong className="text-emerald-300">hidden inside Know More</strong> — you must find them.</span></div>
                <div className="flex items-start gap-2"><span className="text-amber-400 font-bold flex-shrink-0">3.</span> <span>Perform the defensive action in the <strong className="text-cyan-300">VM (right panel)</strong> to reveal the Root Flag.</span></div>
                <div className="flex items-start gap-2"><span className="text-amber-400 font-bold flex-shrink-0">4.</span> <span>Submit all questions + the flag to complete the lab with <strong className="text-amber-300">3 stars</strong>.</span></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => { setShowRetryModal(false); onOpenKnowMore(); }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg font-mono transition"
              >
                <BookOpen className="w-4 h-4" /> Read Know More First
              </button>
              <button
                onClick={() => { setShowRetryModal(false); window.location.reload(); }}
                className="py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-700 text-white font-semibold text-xs transition border border-red-700 font-mono"
              >
                🔄 Retry Lab
              </button>
              <button
                onClick={() => setShowRetryModal(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700"
              >
                Continue
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── ROOM COMPLETED & STAR RATING MODAL ── */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111722] border-2 border-emerald-500/60 rounded-2xl p-6 max-w-md w-full text-center space-y-5 shadow-2xl shadow-emerald-950/50">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">CYBER RANGE ROOM CLEARED</div>
              <h2 className="text-xl font-extrabold text-white mt-1">{sim.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{sim.id} • {sim.category}</p>
            </div>

            {/* Glowing Star Rating & Marks Summary */}
            <div className="bg-[#090d14] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs text-slate-400 uppercase font-mono font-bold">PERFORMANCE &amp; MARKS SUMMARY</div>
              <div className="flex items-center justify-center gap-2 text-amber-400">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-7 h-7 ${i < earnedStars ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-700'}`}
                  />
                ))}
              </div>
              <div className="text-xs font-bold text-amber-300 font-mono">
                {earnedStars === 3 ? '⭐⭐⭐ PERFECT DEFENSE (3/3 STARS)' : earnedStars === 2 ? '⭐⭐ GREAT JOB (2/3 STARS)' : '⭐ LAB COMPLETED (1/3 STARS)'}
              </div>

              {/* Marks & Warning Breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-emerald-950/40 border border-emerald-800/40 rounded p-2 text-center">
                  <div className="text-slate-400 text-[10px]">TOTAL MARKS</div>
                  <div className="text-emerald-400 font-extrabold text-sm">{totalMarks} / 200</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded p-2 text-center">
                  <div className="text-slate-400 text-[10px]">WARNING DEDUCTIONS</div>
                  <div className={wrongAttempts > 0 ? 'text-amber-400 font-extrabold text-sm' : 'text-emerald-400 font-extrabold text-sm'}>
                    {wrongAttempts > 0 ? `⚠️ ${wrongAttempts} (-${wrongAttempts * 15})` : '0 Deductions'}
                  </div>
                </div>
              </div>
            </div>

            {/* Flag captured badge */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs font-mono text-emerald-300">
              <div className="text-[10px] text-slate-400">Captured Flag:</div>
              <div className="font-bold truncate mt-0.5">{expectedFlag}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { window.location.href = '/#simulations'; }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg"
              >
                Return to Cyber Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
