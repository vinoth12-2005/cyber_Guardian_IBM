import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCyberStore } from '@/store/cyber-store';
import { seScenarios } from '@/data/simulation/se-scenarios';
import {
  Search, Clock, CheckCircle2, ArrowRight, Shield, Target,
  Wifi, Lock, Mail, Phone, Globe, Database, Zap, AlertTriangle,
  Users, Cpu, ChevronDown, ChevronRight, Filter, Star, Crosshair,
  Layers, Sparkles, X, Smartphone, Fingerprint, Award, Flame, SlidersHorizontal
} from 'lucide-react';

// ── Attack vector & category configuration ──────────────────────────────────
const ATTACK_TYPES = [
  {
    key: 'All',
    label: 'All Attack Vectors',
    icon: Crosshair,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    activeBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]',
    desc: 'Full matrix of 47 interactive red-team attack & defense scenarios',
  },
  {
    key: 'phishing',
    label: 'Phishing & BEC Spoofing',
    icon: Mail,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    activeBg: 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    desc: 'Email-based credential harvesting, executive impersonation (BEC), spoofing & invoice fraud',
    categories: ['Phishing', 'Impersonation', 'Business Email Compromise', 'Credential Theft', 'Recruitment Scam'],
  },
  {
    key: 'identity',
    label: 'Identity & Social Recon',
    icon: Fingerprint,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    activeBg: 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.25)]',
    desc: 'OSINT profiling, impersonation, pretexting, employee targeting & profile hijacking',
    categories: ['Social Media Attack', 'Pretexting', 'Reconnaissance', 'Manipulation', 'Impersonation'],
  },
  {
    key: 'mitm',
    label: 'MITM & Network Exploits',
    icon: Wifi,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    activeBg: 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    desc: 'Evil Twin Wi-Fi, SSL stripping, ARP cache poisoning & gateway packet sniffing',
    categories: ['MITM Attack'],
  },
  {
    key: 'ransomware',
    label: 'Ransomware & Malware',
    icon: Lock,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    activeBg: 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    desc: 'Payload execution, file encryption, double extortion & incident containment drills',
    categories: ['Ransomware'],
  },
  {
    key: 'mobile',
    label: 'Smishing & Mobile Vectors',
    icon: Smartphone,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    activeBg: 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    desc: 'SMS phishing (smishing), voice phishing (vishing), QR code quishing & rogue mobile apps',
    categories: ['Smishing', 'Vishing', 'QR Phishing'],
  },
  {
    key: 'web',
    label: 'Web & Browser Exploits',
    icon: Globe,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    activeBg: 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    desc: 'Cross-Site Scripting (XSS), CSRF, clickjacking, rogue browser extensions & cookie theft',
    categories: ['Browser Attack', 'Web Attack', 'Extension Attack'],
  },
  {
    key: 'cloud',
    label: 'Cloud & OAuth Breaches',
    icon: Database,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    activeBg: 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]',
    desc: 'Cloud identity phishing, malicious OAuth application scopes & MFA fatigue exploits',
    categories: ['Cloud Phishing', 'OAuth Attack', 'MFA Attack'],
  },
  {
    key: 'advanced',
    label: 'APT & Advanced Threats',
    icon: Cpu,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    activeBg: 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    desc: 'AI deepfake impersonation, supply chain compromise & multi-channel coordinated killchains',
    categories: ['Multi-Stage Campaign', 'Deepfake', 'Multi-Channel'],
  },
];

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; dot: string; border: string }> = {
  Beginner:     { label: 'Beginner',     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', border: 'border-emerald-500/30' },
  Intermediate: { label: 'Intermediate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',     dot: 'bg-amber-400',   border: 'border-amber-500/30' },
  Advanced:     { label: 'Advanced',     color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',         dot: 'bg-rose-400',    border: 'border-rose-500/30' },
};

const categoryColorMap: Record<string, string> = {
  'Phishing': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Smishing': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Vishing': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'Impersonation': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Pretexting': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Credential Theft': 'text-red-400 bg-red-500/10 border-red-500/20',
  'Business Email Compromise': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Multi-Stage Campaign': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'MITM Attack': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Ransomware': 'text-red-400 bg-red-500/10 border-red-500/20',
  'Social Media Attack': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'QR Phishing': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Cloud Phishing': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'MFA Attack': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'OAuth Attack': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'Extension Attack': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  'Deepfake': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Manipulation': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Reconnaissance': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  'Recruitment Scam': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

type StatusFilter = 'all' | 'uncompleted' | 'completed';
type SortOption = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'xp-desc' | 'duration-asc';

export function SimulationsGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [attackTypeKey, setAttackTypeKey] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const completedList = useCyberStore(s => s.completedList);

  const activeType = ATTACK_TYPES.find(t => t.key === attackTypeKey)!;

  // Filter and sort simulations
  const filteredSims = useMemo(() => {
    let list = seScenarios.filter(sim => {
      const isCompleted = completedList.some(c => c.id === sim.id || c.numericId === sim.numericId);

      const matchesSearch = !searchTerm ||
        sim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDifficulty = difficultyFilter === 'all' || sim.difficulty === difficultyFilter;

      const matchesType = attackTypeKey === 'All' ||
        (activeType.categories ?? []).includes(sim.category);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && isCompleted) ||
        (statusFilter === 'uncompleted' && !isCompleted);

      return matchesSearch && matchesDifficulty && matchesType && matchesStatus;
    });

    // Sorting
    const diffWeights: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
    if (sortBy === 'difficulty-asc') {
      list = [...list].sort((a, b) => (diffWeights[a.difficulty] || 0) - (diffWeights[b.difficulty] || 0));
    } else if (sortBy === 'difficulty-desc') {
      list = [...list].sort((a, b) => (diffWeights[b.difficulty] || 0) - (diffWeights[a.difficulty] || 0));
    } else if (sortBy === 'xp-desc') {
      list = [...list].sort((a, b) => b.xp - a.xp);
    } else if (sortBy === 'duration-asc') {
      list = [...list].sort((a, b) => a.duration - b.duration);
    }

    return list;
  }, [searchTerm, difficultyFilter, attackTypeKey, statusFilter, sortBy, activeType, completedList]);

  const stats = useMemo(() => ({
    total: seScenarios.length,
    completed: completedList.length,
    beginner: seScenarios.filter(s => s.difficulty === 'Beginner').length,
    intermediate: seScenarios.filter(s => s.difficulty === 'Intermediate').length,
    advanced: seScenarios.filter(s => s.difficulty === 'Advanced').length,
  }), [completedList]);

  const hasActiveFilters = searchTerm !== '' || difficultyFilter !== 'all' || attackTypeKey !== 'All' || statusFilter !== 'all' || sortBy !== 'default';

  const resetFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('all');
    setAttackTypeKey('All');
    setStatusFilter('all');
    setSortBy('default');
  };

  return (
    <section id="simulations" className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6 scroll-mt-20">

      {/* Main Header & Matrix Stats */}
      <div className="p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden"
        style={{
          background: 'var(--bg-card, rgba(12, 12, 18, 0.85))',
          borderColor: 'var(--border-default, rgba(255, 255, 255, 0.08))',
          boxShadow: 'var(--shadow-md, 0 8px 30px rgba(0,0,0,0.4))',
        }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Cyber Range — Attack & Defense Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>{stats.total} interactive red-team attack simulations</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{stats.completed} mastered</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">{stats.total - stats.completed} available</span>
            </p>
          </div>

          {/* Quick Search & Clear */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by attack name, vector, goal..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 text-xs px-3.5 py-2.5 pl-10 pr-9 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-500 transition shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Difficulty Quick Chips & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Difficulty:
            </span>
            <button
              onClick={() => setDifficultyFilter('all')}
              className={`text-xs font-semibold px-3 py-1 rounded-lg border transition ${
                difficultyFilter === 'all'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              All Tiers ({stats.total})
            </button>
            {([
              ['Beginner', 'text-emerald-400', 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]', stats.beginner],
              ['Intermediate', 'text-amber-400', 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]', stats.intermediate],
              ['Advanced', 'text-rose-400', 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]', stats.advanced]
            ] as const).map(([label, color, activeStyle, count]) => (
              <button
                key={label}
                onClick={() => setDifficultyFilter(difficultyFilter === label ? 'all' : label)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                  difficultyFilter === label
                    ? activeStyle
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${difficultyFilter === label ? 'bg-current' : 'bg-slate-500'}`} />
                <span>{label}</span>
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              </button>
            ))}
          </div>

          {/* Status filter: All / Active / Completed */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {(['all', 'uncompleted', 'completed'] as StatusFilter[]).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition capitalize ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'All Drills' : st === 'uncompleted' ? 'Uncompleted' : 'Mastered'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Attack Vector & Category Options (Simulation Options) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5 font-semibold">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Threat Vector & Scenario Category:</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <X className="w-3 h-3" /> Reset All Filters
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {ATTACK_TYPES.map(type => {
            const Icon = type.icon;
            const isActive = attackTypeKey === type.key;
            const count = type.key === 'All' ? seScenarios.length :
              seScenarios.filter(s => (type.categories ?? []).includes(s.category)).length;

            return (
              <button
                key={type.key}
                onClick={() => setAttackTypeKey(type.key)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl text-center border transition-all duration-200 cursor-pointer relative group ${
                  isActive
                    ? type.activeBg
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                  isActive ? 'bg-white/10' : type.bg
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-current' : type.color}`} />
                </div>
                <span className="text-[11px] font-bold leading-tight line-clamp-1">{type.label}</span>
                <span className={`text-[9px] font-mono mt-1 px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-black/30 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Vector Briefing Card */}
        <div className="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs backdrop-blur-md"
          style={{
            background: 'rgba(15, 23, 42, 0.4)',
            borderColor: 'rgba(56, 189, 248, 0.2)',
          }}
        >
          <div className="flex items-center gap-2.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              <strong className="text-white font-mono uppercase">{activeType.label}:</strong> {activeType.desc}
            </span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-slate-900 border border-slate-800 text-xs px-2.5 py-1 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="default">Default Order</option>
              <option value="difficulty-asc">Difficulty (Low → High)</option>
              <option value="difficulty-desc">Difficulty (High → Low)</option>
              <option value="xp-desc">XP Bounty (High → Low)</option>
              <option value="duration-asc">Fastest Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center text-xs font-mono text-slate-400 px-1">
        <span>
          Displaying <strong className="text-cyan-400">{filteredSims.length}</strong> of {stats.total} combat scenarios
          {searchTerm && <span className="text-slate-400 ml-1.5">matching "{searchTerm}"</span>}
        </span>
        {filteredSims.length > 0 && (
          <span className="text-[11px] text-slate-500">Live Sandboxed Threat Environment</span>
        )}
      </div>

      {/* ── Scenario Cards Matrix ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSims.map(sim => {
          const completedNode = completedList.find(c => c.id === sim.id || c.numericId === sim.numericId);
          const isCompleted = !!completedNode;
          const diffStyle = DIFFICULTY_CONFIG[sim.difficulty] || DIFFICULTY_CONFIG.Beginner;
          const catColor = categoryColorMap[sim.category] ?? 'text-slate-300 bg-slate-800 border-slate-700';
          const isNew = sim.numericId >= 41;

          return (
            <div
              key={sim.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 relative group transition-all duration-300 hover:-translate-y-1 backdrop-blur-md ${
                isCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/15 shadow-lg shadow-emerald-950/20 hover:border-emerald-400'
                  : 'border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(56,189,248,0.12)]'
              }`}
              style={{
                background: isCompleted ? 'rgba(6, 78, 59, 0.15)' : 'var(--bg-card, rgba(12, 12, 18, 0.75))',
              }}
            >
              {/* Top Row: ID, Category & Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-cyan-400">
                      {sim.id}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border truncate max-w-[130px] ${catColor}`}>
                      {sim.category}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isCompleted ? (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 bg-amber-950/70 border border-amber-500/50 px-1.5 py-0.5 rounded-full text-amber-400 text-[10px] font-bold">
                        {Array.from({ length: completedNode.stars || 3 }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>PASSED</span>
                      </div>
                    </div>
                  ) : isNew ? (
                    <div className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                      NEW VECTOR
                    </div>
                  ) : null}
                </div>

                {/* Scenario Title */}
                <div>
                  <h3
                    className="text-sm font-extrabold leading-snug transition-colors duration-200 line-clamp-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {sim.title}
                  </h3>
                  {sim.brand && (
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>Target: {sim.brand}</p>
                  )}
                </div>

                {/* Goal Briefing */}
                <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {sim.goal}
                </p>
              </div>

              {/* Card Footer: Metadata & Launch Button */}
              <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className={`px-2 py-0.5 rounded border flex items-center gap-1.5 ${diffStyle.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
                    {sim.difficulty}
                  </span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> {sim.duration}m
                  </span>
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>
                    +{sim.xp} XP
                  </span>
                </div>

                <Link
                  to={`/simulation/${sim.numericId}`}
                  className={`w-full text-center py-2.5 font-bold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 font-mono tracking-wider cursor-pointer border ${
                    isCompleted
                      ? 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border-emerald-500/30'
                      : 'hover:opacity-90'
                  }`}
                  style={!isCompleted ? {
                    background: 'var(--accent-primary)',
                    color: '#FFFFFF',
                    borderColor: 'var(--accent-primary-border)',
                  } : undefined}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>REPLAY DRILL (MASTERED)</span>
                    </>
                  ) : (
                    <>
                      <span>LAUNCH DRILL</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSims.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-3">
          <Shield className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-300 text-sm font-semibold">No simulation scenarios match your current filters.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting your search terms, difficulty levels, or attack categories.</p>
          <button
            onClick={resetFilters}
            className="mt-2 text-xs font-mono font-bold px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Framework & Standards Reference Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Simulations benchmarked against global cybersecurity frameworks:</span>
        </div>
        <div className="flex flex-wrap gap-3 font-mono">
          {[
            { label: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' },
            { label: 'NIST CSF 2.0', url: 'https://www.nist.gov/cyberframework' },
            { label: 'OWASP Top 10', url: 'https://owasp.org/' },
            { label: 'CISA Guidelines', url: 'https://www.cisa.gov/cybersecurity' },
            { label: 'Verizon DBIR', url: 'https://www.verizon.com/business/resources/reports/dbir/' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
