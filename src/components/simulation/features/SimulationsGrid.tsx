import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCyberStore } from '@/store/cyber-store';
import { seScenarios } from '@/data/simulation/se-scenarios';
import {
  Search, Clock, CheckCircle2, ArrowRight, Shield, Target,
  Wifi, Lock, Mail, Phone, Globe, Database, Zap, AlertTriangle,
  Users, Cpu, ChevronDown, ChevronRight, Filter, Star
} from 'lucide-react';

// ── Attack type configuration ──────────────────────────────────────────────
const ATTACK_TYPES = [
  {
    key: 'All',
    label: 'All Attacks',
    icon: Target,
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-800/30',
    desc: 'Every simulation across all categories',
  },
  {
    key: 'phishing',
    label: 'Phishing & Email',
    icon: Mail,
    color: 'text-blue-400',
    bg: 'bg-blue-950/20',
    border: 'border-blue-800/30',
    desc: 'Email-based credential harvesting, BEC, spoofing',
    categories: ['Phishing', 'Impersonation', 'Business Email Compromise', 'Credential Theft'],
  },
  {
    key: 'social',
    label: 'Social Media',
    icon: Users,
    color: 'text-pink-400',
    bg: 'bg-pink-950/20',
    border: 'border-pink-800/30',
    desc: 'Fake profiles, giveaway scams, account takeover',
    categories: ['Social Media Attack'],
  },
  {
    key: 'mitm',
    label: 'MITM / Network',
    icon: Wifi,
    color: 'text-amber-400',
    bg: 'bg-amber-950/20',
    border: 'border-amber-800/30',
    desc: 'Evil Twin Wi-Fi, SSL stripping, ARP poisoning',
    categories: ['MITM Attack'],
  },
  {
    key: 'ransomware',
    label: 'Ransomware',
    icon: Lock,
    color: 'text-red-400',
    bg: 'bg-red-950/20',
    border: 'border-red-800/30',
    desc: 'File encryption, double extortion, ransom demands',
    categories: ['Ransomware'],
  },
  {
    key: 'mobile',
    label: 'Mobile & SMS',
    icon: Phone,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-800/30',
    desc: 'Smishing, vishing, QR phishing, mobile malware',
    categories: ['Smishing', 'Vishing', 'QR Phishing'],
  },
  {
    key: 'web',
    label: 'Web & Browser',
    icon: Globe,
    color: 'text-purple-400',
    bg: 'bg-purple-950/20',
    border: 'border-purple-800/30',
    desc: 'XSS, CSRF, clickjacking, credential stuffing',
    categories: ['Browser Attack', 'Web Attack'],
  },
  {
    key: 'cloud',
    label: 'Cloud & OAuth',
    icon: Database,
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-800/30',
    desc: 'Cloud phishing, OAuth abuse, MFA fatigue',
    categories: ['Cloud Phishing', 'MFA Attack'],
  },
  {
    key: 'advanced',
    label: 'Advanced Threats',
    icon: Cpu,
    color: 'text-rose-400',
    bg: 'bg-rose-950/20',
    border: 'border-rose-800/30',
    desc: 'Supply chain, deepfake, multi-stage campaigns',
    categories: ['Multi-Stage Campaign', 'Deepfake', 'Multi-Channel', 'Pretexting'],
  },
];

const DIFFICULTY_CONFIG = {
  Beginner:     { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Intermediate: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Advanced:     { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
};

const categoryColorMap: Record<string, string> = {
  'Phishing': 'text-blue-400',
  'Smishing': 'text-indigo-400',
  'Vishing': 'text-violet-400',
  'Impersonation': 'text-rose-400',
  'Pretexting': 'text-amber-400',
  'Credential Theft': 'text-red-400',
  'Business Email Compromise': 'text-orange-400',
  'Multi-Stage Campaign': 'text-cyan-400',
  'MITM Attack': 'text-amber-400',
  'Ransomware': 'text-red-400',
  'Social Media Attack': 'text-pink-400',
  'QR Phishing': 'text-purple-400',
  'Cloud Phishing': 'text-sky-400',
  'MFA Attack': 'text-yellow-400',
  'Deepfake': 'text-rose-400',
};

export function SimulationsGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [attackTypeKey, setAttackTypeKey] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const completedList = useCyberStore(s => s.completedList);

  const activeType = ATTACK_TYPES.find(t => t.key === attackTypeKey)!;

  const filteredSims = useMemo(() => seScenarios.filter(sim => {
    const matchesSearch = !searchTerm ||
      sim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sim.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sim.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || sim.difficulty === difficultyFilter;
    const matchesType = attackTypeKey === 'All' ||
      (activeType.categories ?? []).includes(sim.category);
    return matchesSearch && matchesDifficulty && matchesType;
  }), [searchTerm, difficultyFilter, attackTypeKey, activeType]);

  const stats = useMemo(() => ({
    total: seScenarios.length,
    completed: completedList.length,
    beginner: seScenarios.filter(s => s.difficulty === 'Beginner').length,
    intermediate: seScenarios.filter(s => s.difficulty === 'Intermediate').length,
    advanced: seScenarios.filter(s => s.difficulty === 'Advanced').length,
  }), [completedList]);

  return (
    <section id="simulations" className="w-full max-w-7xl mx-auto px-4 py-12 space-y-8 scroll-mt-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Cyber Range — Simulation Matrix</h2>
          </div>
          <p className="text-xs text-slate-400">
            {stats.total} interactive attack simulations •{' '}
            <span className="text-emerald-400 font-semibold">{stats.completed} completed</span>
          </p>
          {/* Difficulty counts */}
          <div className="flex items-center gap-3 mt-2">
            {([['Beginner', 'text-emerald-400', stats.beginner], ['Intermediate', 'text-amber-400', stats.intermediate], ['Advanced', 'text-red-400', stats.advanced]] as const).map(([label, color, count]) => (
              <button
                key={label}
                onClick={() => setDifficultyFilter(difficultyFilter === label ? 'all' : label)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition ${
                  difficultyFilter === label
                    ? `${color} border-current bg-current/10`
                    : 'text-slate-500 border-slate-800 hover:border-slate-600'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search simulations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 text-xs px-3 py-2.5 pl-9 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
          />
        </div>
      </div>

      {/* Attack Type Category Chips */}
      <div className="space-y-2">
        <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3 h-3" /> Filter by Attack Category
        </div>
        <div className="flex flex-wrap gap-2">
          {ATTACK_TYPES.map(type => {
            const Icon = type.icon;
            const isActive = attackTypeKey === type.key;
            const count = type.key === 'All' ? seScenarios.length :
              seScenarios.filter(s => (type.categories ?? []).includes(s.category)).length;
            if (count === 0 && type.key !== 'All') return null;
            return (
              <button
                key={type.key}
                onClick={() => setAttackTypeKey(type.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                  isActive
                    ? `${type.bg} ${type.border} ${type.color}`
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? type.color : 'text-slate-500'}`} />
                {type.label}
                <span className={`text-[9px] font-mono px-1 rounded ${isActive ? 'bg-slate-900/60' : 'bg-slate-800 text-slate-500'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Active type description */}
        {attackTypeKey !== 'All' && (
          <div className={`text-[11px] ${activeType.color} ${activeType.bg} border ${activeType.border} px-3 py-1.5 rounded-lg flex items-center gap-1.5`}>
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span><strong>{activeType.label}:</strong> {activeType.desc}</span>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-[11px] text-slate-500 font-mono">
        Showing {filteredSims.length} of {stats.total} simulations
        {searchTerm && <span className="text-cyan-400 ml-1">for "{searchTerm}"</span>}
      </div>

      {/* Simulation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSims.map(sim => {
          const completedNode = completedList.find(c => c.id === sim.id || c.numericId === sim.numericId);
          const isCompleted = !!completedNode;
          const diffStyle = DIFFICULTY_CONFIG[sim.difficulty];
          const catColor = categoryColorMap[sim.category] ?? 'text-slate-400';
          const isNew = sim.numericId >= 41;

          return (
            <div
              key={sim.id}
              className={`glass p-4 rounded-xl border flex flex-col justify-between space-y-3 relative group transition-all duration-300 hover:-translate-y-0.5 ${
                isCompleted
                  ? 'border-emerald-500/50 bg-emerald-950/10 shadow-lg shadow-emerald-950/20 hover:border-emerald-400'
                  : 'border-cyan-500/10 hover:border-cyan-500/25'
              }`}
            >
              {/* Status badges */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                {isCompleted && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5 bg-amber-950/60 border border-amber-500/50 px-1.5 py-0.5 rounded-full text-amber-400 text-[10px] font-bold">
                      {Array.from({ length: completedNode.stars || 3 }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold flex items-center gap-1 shadow-sm shadow-emerald-900/50">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-950" />
                      <span>✓ COMPLETED</span>
                    </div>
                  </div>
                )}
                {isNew && !isCompleted && (
                  <div className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                    NEW
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                {/* ID + category */}
                <div className="flex items-center gap-2 pr-24">
                  <span className="text-[10px] font-mono text-slate-500">{sim.id}</span>
                  <span className={`text-[10px] font-semibold ${catColor}`}>{sim.category}</span>
                </div>

                {/* Title with completed tick if completed */}
                <h3 className="text-sm font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors duration-200 flex items-start gap-1.5">
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                  <span>{sim.title}</span>
                </h3>

                {/* Goal */}
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{sim.goal}</p>
              </div>

              {/* Footer */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 ${diffStyle.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot} flex-shrink-0`} />
                    {sim.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />{sim.duration}m
                  </span>
                  <span className="text-cyan-400 font-mono font-bold">+{sim.xp} XP</span>
                </div>

                <Link
                  to={`/simulation/${sim.numericId}`}
                  className={`w-full text-center py-2 font-bold rounded-lg text-[11px] transition duration-200 flex items-center justify-center gap-1.5 font-mono tracking-wider cursor-pointer border ${
                    isCompleted
                      ? 'bg-emerald-950/60 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-800/60'
                      : 'bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 border-slate-800 group-hover:border-cyan-500/30'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>REPLAY SIM (PASSED)</span>
                    </>
                  ) : (
                    <>
                      <span>LAUNCH SIM</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredSims.length === 0 && (
        <div className="text-center py-16 glass rounded-xl border border-slate-800">
          <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No simulations match your current filters.</p>
          <button
            onClick={() => { setSearchTerm(''); setDifficultyFilter('all'); setAttackTypeKey('All'); }}
            className="mt-3 text-xs text-cyan-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Info footer */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800/60 text-[10px] text-slate-600">
        <span>Attack data sources:</span>
        {[
          { label: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' },
          { label: 'OWASP', url: 'https://owasp.org/' },
          { label: 'NIST', url: 'https://www.nist.gov/cyberframework' },
          { label: 'CISA', url: 'https://www.cisa.gov/cybersecurity' },
          { label: 'Verizon DBIR 2024', url: 'https://www.verizon.com/business/resources/reports/dbir/' },
        ].map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-400 transition hover:underline">
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
