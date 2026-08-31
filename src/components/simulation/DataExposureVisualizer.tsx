// ============================================================
// SE-LAB — Data Exposure Visualizer
// Real-time panel showing exactly what data hackers steal.
// Appears in AttackerPanel + as a modal overlay post-exposure.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Database, CreditCard, Key, User, Mail, Phone,
  Globe, Shield, AlertTriangle, Eye, EyeOff,
  Download, Server, Wifi, Lock, Unlock, Activity
} from 'lucide-react';

export interface StolenDataItem {
  type: 'credential' | 'payment' | 'pii' | 'session' | 'file' | 'network';
  label: string;
  value: string;
  riskLevel: 'critical' | 'high' | 'medium';
  timestamp?: string;
  note?: string;
}

interface DataExposureVisualizerProps {
  items: StolenDataItem[];
  attackerAlias?: string;
  serverLocation?: string;
  isLive?: boolean; // whether data is being added in real-time
  onClose?: () => void;
  compact?: boolean;
}

const typeConfig = {
  credential: { icon: Key, color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/60', label: 'Credentials' },
  payment: { icon: CreditCard, color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/60', label: 'Payment Data' },
  pii: { icon: User, color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/60', label: 'Personal Info' },
  session: { icon: Globe, color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800/60', label: 'Session Token' },
  file: { icon: Download, color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/60', label: 'File/Document' },
  network: { icon: Wifi, color: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/60', label: 'Network Data' },
};

const riskBadge = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-600 text-white',
  medium: 'bg-amber-600 text-white',
};

function maskValue(value: string): string {
  if (value.length <= 4) return '****';
  return value.slice(0, 4) + '•'.repeat(Math.min(value.length - 4, 12)) + value.slice(-2);
}

export function DataExposureVisualizer({
  items,
  attackerAlias = 'ThreatActor-7C2F',
  serverLocation = 'C2 Server: 185.220.101.48 (Tor Exit Node)',
  isLive = false,
  onClose,
  compact = false,
}: DataExposureVisualizerProps) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [animating, setAnimating] = useState<number | null>(null);
  const [totalRisk, setTotalRisk] = useState(0);

  useEffect(() => {
    const score = items.reduce((acc, item) => {
      return acc + (item.riskLevel === 'critical' ? 40 : item.riskLevel === 'high' ? 25 : 10);
    }, 0);
    setTotalRisk(Math.min(score, 100));
  }, [items]);

  useEffect(() => {
    if (isLive && items.length > 0) {
      setAnimating(items.length - 1);
      const t = setTimeout(() => setAnimating(null), 1500);
      return () => clearTimeout(t);
    }
  }, [items.length, isLive]);

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-col bg-slate-950 border border-red-900/60 rounded-xl overflow-hidden shadow-2xl ${compact ? 'text-[11px]' : 'text-xs'}`}>
      {/* Attacker C2 Header */}
      <div className="bg-red-950/80 border-b border-red-900/60 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono font-bold text-red-300 text-[11px]">⚠ ATTACKER C2 — LIVE DATA FEED</span>
        </div>
        <div className="flex items-center gap-2 text-red-400 text-[10px] font-mono">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>{isLive ? 'RECEIVING...' : 'CAPTURED'}</span>
          {onClose && (
            <button onClick={onClose} className="ml-2 text-red-300 hover:text-white transition text-[11px]">✕</button>
          )}
        </div>
      </div>

      {/* Attacker server info */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-3 py-1.5 flex items-center gap-3 flex-wrap text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1"><Server className="w-3 h-3 text-red-400" />{serverLocation}</span>
        <span className="flex items-center gap-1"><User className="w-3 h-3 text-orange-400" />Alias: {attackerAlias}</span>
        <span className="ml-auto text-red-400 font-bold">{items.length} item{items.length !== 1 ? 's' : ''} exfiltrated</span>
      </div>

      {/* Risk meter */}
      <div className="px-3 pt-2 pb-1">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-slate-400 font-mono">EXPOSURE DAMAGE SCORE</span>
          <span className={`font-bold font-mono ${totalRisk >= 70 ? 'text-red-400' : totalRisk >= 40 ? 'text-orange-400' : 'text-amber-400'}`}>
            {totalRisk}/100
          </span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${totalRisk >= 70 ? 'bg-red-500' : totalRisk >= 40 ? 'bg-orange-500' : 'bg-amber-500'}`}
            style={{ width: `${totalRisk}%` }}
          />
        </div>
      </div>

      {/* Stolen data items */}
      <div className={`flex-1 overflow-y-auto p-2 space-y-1.5 ${compact ? 'max-h-48' : 'max-h-72'}`}>
        {items.map((item, idx) => {
          const cfg = typeConfig[item.type];
          const Icon = cfg.icon;
          const isNew = animating === idx;

          return (
            <div
              key={idx}
              className={`relative flex items-start gap-2 p-2 rounded-lg border transition-all duration-300 ${cfg.bg} ${cfg.border} ${
                isNew ? 'ring-1 ring-red-500 shadow-lg shadow-red-900/40 scale-[1.01]' : ''
              }`}
            >
              {isNew && (
                <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-[shimmer_0.6s_ease_forwards]" />
              )}
              <div className={`flex-shrink-0 mt-0.5 ${cfg.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`font-bold ${cfg.color} text-[10px] uppercase tracking-wide`}>{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${riskBadge[item.riskLevel]}`}>{item.riskLevel.toUpperCase()}</span>
                    {isNew && <span className="text-[9px] bg-red-600 text-white px-1 rounded font-mono animate-pulse">NEW</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-slate-200 text-[11px] truncate">
                    {revealed[idx] ? item.value : maskValue(item.value)}
                  </span>
                  <button
                    onClick={() => setRevealed(r => ({ ...r, [idx]: !r[idx] }))}
                    className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition"
                    title={revealed[idx] ? 'Hide value' : 'Show full value'}
                  >
                    {revealed[idx] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                {item.note && (
                  <div className="text-[10px] text-slate-400 mt-0.5 italic">{item.note}</div>
                )}
                {item.timestamp && (
                  <div className="text-[9px] text-slate-600 font-mono mt-0.5">{item.timestamp}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer education note */}
      <div className="px-3 py-2 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-start gap-1.5">
          <Shield className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            This data is <strong className="text-cyan-400">simulated</strong>. In real attacks, this information is sold on dark web markets, used for identity theft, or held for ransom.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRESET STOLEN DATA SETS for common attack types
// ============================================================

export const STOLEN_DATA_PRESETS = {
  phishingCredentials: (brand: string): StolenDataItem[] => [
    { type: 'credential', label: 'Username', value: 'j.smith@northstar.corp', riskLevel: 'high', note: 'Corporate email account', timestamp: new Date().toLocaleTimeString() },
    { type: 'credential', label: 'Password (plaintext)', value: 'Northstar@2024!', riskLevel: 'critical', note: 'Will be used for credential stuffing', timestamp: new Date().toLocaleTimeString() },
    { type: 'session', label: 'Browser Fingerprint', value: 'Mozilla/5.0 Chrome/124 Win64', riskLevel: 'medium', note: 'Used to bypass MFA device checks' },
    { type: 'network', label: 'Victim IP Address', value: '203.0.113.42', riskLevel: 'medium', note: 'Geo-targeted for future attacks' },
  ],

  paymentCardTheft: (): StolenDataItem[] => [
    { type: 'payment', label: 'Card Number (PAN)', value: '4532 0151 1283 0366', riskLevel: 'critical', note: 'Visa card — will be sold for $40 on dark web', timestamp: new Date().toLocaleTimeString() },
    { type: 'payment', label: 'CVV2 Code', value: '847', riskLevel: 'critical', note: 'Enables card-not-present fraud' },
    { type: 'payment', label: 'Card Expiry', value: '09/27', riskLevel: 'high' },
    { type: 'pii', label: 'Billing Address', value: '123 Main St, Austin TX 78701', riskLevel: 'high', note: 'Used to bypass AVS checks' },
  ],

  piiHarvest: (): StolenDataItem[] => [
    { type: 'pii', label: 'Full Legal Name', value: 'Jordan Alexander Smith', riskLevel: 'high', note: 'Used in identity theft applications' },
    { type: 'pii', label: 'Date of Birth', value: '1989-03-14', riskLevel: 'critical', note: 'Core identity theft data point' },
    { type: 'pii', label: 'Social Security Number', value: '***-**-4821', riskLevel: 'critical', note: 'Enables tax fraud and credit applications' },
    { type: 'pii', label: 'Home Address', value: '742 Evergreen Terrace, Springfield', riskLevel: 'high' },
    { type: 'pii', label: 'Phone Number', value: '+1 (555) 0182', riskLevel: 'medium' },
  ],

  sessionHijack: (): StolenDataItem[] => [
    { type: 'session', label: 'Session Cookie (auth_token)', value: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyXzE4MjkiLCJpYXQiOjE3MjQ0MTE2MDB9.EXFIL', riskLevel: 'critical', note: 'Valid for 24 hours — immediate account takeover possible' },
    { type: 'session', label: 'CSRF Token', value: 'b3c8e2f1-a914-4d2c-b771-f8a3c1e2d9e4', riskLevel: 'high', note: 'Enables forged requests in victim\'s browser' },
    { type: 'credential', label: 'OAuth Refresh Token', value: '1//0gLmGKzFZM4j8CgYIARAAGBASNwF-L9Ir', riskLevel: 'critical', note: 'Survives password resets!' },
  ],

  mitmCapture: (): StolenDataItem[] => [
    { type: 'network', label: 'HTTP POST Body', value: 'username=jsmith&password=Pass123!&action=login', riskLevel: 'critical', note: 'Captured in plaintext — HTTP has NO encryption' },
    { type: 'network', label: 'Session Cookie (unencrypted)', value: 'PHPSESSID=abc123def456ghi789', riskLevel: 'critical', note: 'Intercepted mid-transit via ARP poisoning' },
    { type: 'network', label: 'DNS Query', value: 'bankofamerica.com → 185.220.x.x (POISONED)', riskLevel: 'critical', note: 'DNS cache poisoned — victim redirected to fake site' },
    { type: 'network', label: 'Client MAC Address', value: 'AA:BB:CC:12:34:56', riskLevel: 'medium' },
  ],

  ransomwareExfil: (): StolenDataItem[] => [
    { type: 'file', label: 'HR Records Archive', value: 'employees_Q4_2024.xlsx (2,847 records)', riskLevel: 'critical', note: 'Exfiltrated BEFORE encryption — double extortion leverage' },
    { type: 'file', label: 'Financial Reports', value: 'Q3_revenue_projections_CONFIDENTIAL.pdf', riskLevel: 'critical' },
    { type: 'credential', label: 'Active Directory Dump', value: 'NTLM Hash dump — 1,247 accounts', riskLevel: 'critical', note: 'Pass-the-hash attacks possible on entire domain' },
    { type: 'network', label: 'Network Topology Map', value: 'internal_subnets_10.x.x.x/24 (12 segments)', riskLevel: 'high', note: 'Enables lateral movement planning' },
  ],
};
