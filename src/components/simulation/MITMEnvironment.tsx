// ============================================================
// SE-LAB — MITM (Man-in-the-Middle) Attack Simulator
// Shows real-time packet interception with visual network tap
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, AlertTriangle, Eye, Lock, Unlock, Activity, Server, Monitor, Shield, CheckCircle2, X } from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';
import { DataExposureVisualizer, STOLEN_DATA_PRESETS } from './DataExposureVisualizer';

// ---- MITM Packet Visualizer ----
interface Packet {
  id: string;
  type: 'HTTP' | 'HTTPS' | 'DNS' | 'ARP';
  from: string;
  to: string;
  payload: string;
  intercepted: boolean;
  timestamp: string;
  dangerous: boolean;
}

interface MITMEnvironmentProps {
  attackType: 'evil-twin' | 'arp-poisoning' | 'ssl-strip' | 'dns-spoof';
  networkName?: string;
  onComplete?: (outcome: 'safe' | 'compromised') => void;
}

const attackerNode = 'Attacker (185.220.101.48)';
const victimNode = 'Your Device (192.168.1.100)';
const routerNode = 'Wi-Fi Router (192.168.1.1)';
const serverNode = 'Bank Server (104.18.x.x)';

function packetFlow(type: Packet['type'], payload: string, dangerous: boolean): Packet {
  return {
    id: Math.random().toString(36).slice(2, 8),
    type,
    from: victimNode,
    to: serverNode,
    payload,
    intercepted: dangerous,
    timestamp: new Date().toLocaleTimeString(),
    dangerous,
  };
}

export function MITMEnvironment({ attackType, networkName = 'FREE_Airport_WiFi', onComplete }: MITMEnvironmentProps) {
  const { fireEvent } = useSimulationStore();
  const [phase, setPhase] = useState<'initial' | 'connected' | 'attacked' | 'captured' | 'defended'>('initial');
  const [packets, setPackets] = useState<Packet[]>([]);
  const [stolenData, setStolenData] = useState(STOLEN_DATA_PRESETS.mitmCapture());
  const [showDataViz, setShowDataViz] = useState(false);
  const [siteLocked, setSiteLocked] = useState(false);
  const packetsRef = useRef<Packet[]>([]);
  packetsRef.current = packets;

  const addPacket = (p: Packet) => {
    setPackets(prev => [p, ...prev].slice(0, 12));
  };

  const handleConnect = () => {
    setPhase('connected');
    fireEvent('FORM_FIELD_FOCUSED', { label: 'Connected to unsecured Wi-Fi network', riskDelta: 10, scoreDelta: -5 });
    toast.warning(`Connected to "${networkName}" — This network is UNENCRYPTED`);

    // Simulate background traffic
    setTimeout(() => {
      addPacket(packetFlow('DNS', 'Query: bank.northstar.test', false));
      addPacket(packetFlow('HTTP', 'GET / HTTP/1.1 Host: bank.northstar.test', true));
    }, 800);

    setTimeout(() => {
      setPhase('attacked');
      toast.error('⚠ MITM Attack Detected! Attacker inserted between you and the router!');
      fireEvent('LINK_OPENED', { label: 'MITM attack initiated by rogue AP', riskDelta: 25, scoreDelta: -15, isBranch: true, attackerSees: 'Victim connected to attacker-controlled AP — traffic interception active' });
    }, 2000);
  };

  const handleTypeCredentials = () => {
    if (phase !== 'attacked') return;
    addPacket(packetFlow('HTTP', 'POST /login HTTP/1.1\nusername=jsmith&password=MyBank@2024', true));
    setShowDataViz(true);
    setPhase('captured');
    fireEvent('FORM_SUBMITTED', { label: 'Login credentials transmitted over HTTP — intercepted by MITM', riskDelta: 40, scoreDelta: -25, isBranch: true, attackerSees: 'PLAINTEXT CREDENTIALS CAPTURED: username=jsmith password=MyBank@2024', exposedData: ['Username (simulated)', 'Password (simulated)', 'Session cookie (simulated)'], nextState: 'CREDENTIAL_CAPTURED' });
    toast.error('Credentials intercepted! Attacker captured your plaintext login!');
    setTimeout(() => onComplete?.('compromised'), 3000);
  };

  const handleCheckHTTPS = () => {
    setSiteLocked(true);
    fireEvent('URL_INSPECTED', { label: 'Verified HTTPS before submitting credentials', riskDelta: -20, scoreDelta: 20, isDefensive: true, isInvestigative: true, attackerSees: 'Victim checking TLS status — likely will detect SSL stripping' });
    toast.success('Smart! You checked for HTTPS. The padlock is MISSING — this is HTTP!');
    if (phase === 'attacked') {
      setPhase('defended');
      fireEvent('REPORT_FILED', { label: 'Detected MITM via missing HTTPS — refused to submit credentials', riskDelta: -30, scoreDelta: 30, isDefensive: true, isBranch: true, attackerSees: 'Victim detected SSL stripping — refused to enter credentials' });
      toast.success('🎉 Excellent! You detected the SSL Strip attack and reported it. Now answer the lab questions on the left side to complete the lab!', { duration: 6000 });
    }
  };

  const attackDescriptions = {
    'evil-twin': { name: 'Evil Twin Wi-Fi Attack', desc: 'Attacker creates a fake Wi-Fi hotspot with the same name as a legitimate network. All your traffic routes through the attacker\'s device.' },
    'arp-poisoning': { name: 'ARP Poisoning / Cache Poisoning', desc: 'Attacker sends fake ARP packets to associate their MAC address with your router\'s IP, redirecting all traffic through their machine.' },
    'ssl-strip': { name: 'SSL Stripping Attack', desc: 'Attacker intercepts HTTPS requests and downgrades them to HTTP, removing encryption while proxying your traffic.' },
    'dns-spoof': { name: 'DNS Spoofing / Cache Poisoning', desc: 'Attacker corrupts DNS cache to redirect legitimate domain lookups to malicious IP addresses.' },
  };

  const attackInfo = attackDescriptions[attackType];

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Network topology visualization */}
      <div className="bg-slate-900 border-b border-slate-800 p-3">
        <div className="text-[11px] text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> {attackInfo.name} — Network Topology
        </div>
        <div className="flex items-center justify-between gap-1 text-[10px]">
          {/* Victim */}
          <div className="flex flex-col items-center gap-1">
            <Monitor className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400 text-center max-w-14">Your Device</span>
          </div>
          {/* Arrow */}
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-600 via-red-500 to-transparent" />
            <span className="text-[9px] text-red-400 font-mono">INTERCEPTED</span>
          </div>
          {/* Attacker */}
          <div className={`flex flex-col items-center gap-1 ${phase !== 'initial' ? 'opacity-100' : 'opacity-30'}`}>
            <div className="relative">
              <Wifi className="w-5 h-5 text-red-400" />
              <Eye className="w-2.5 h-2.5 text-red-300 absolute -top-1 -right-1" />
            </div>
            <span className="text-red-400 text-center max-w-14 font-bold">ATTACKER</span>
            <span className="text-[9px] font-mono text-red-400">{networkName}</span>
          </div>
          {/* Arrow */}
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-slate-600" />
            <span className="text-[9px] text-slate-500 font-mono">proxied</span>
          </div>
          {/* Server */}
          <div className="flex flex-col items-center gap-1 opacity-50">
            <Server className="w-5 h-5 text-slate-500" />
            <span className="text-slate-500 text-center max-w-14">Bank Server</span>
          </div>
        </div>
      </div>

      {/* Main content split */}
      <div className="flex flex-1 min-h-0 gap-0">
        {/* Left: Simulated browser */}
        <div className="flex-1 flex flex-col border-r border-slate-800 overflow-hidden">
          {/* Browser chrome */}
          <div className="bg-slate-800 border-b border-slate-700 px-2 py-1.5 flex items-center gap-2 text-[11px]">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <button
              onClick={handleCheckHTTPS}
              className={`flex items-center gap-1.5 flex-1 px-2 py-1 rounded text-[10px] font-mono border transition ${
                siteLocked
                  ? 'bg-emerald-950/40 border-emerald-700 text-emerald-400'
                  : 'bg-slate-900 border-slate-700 text-amber-400 hover:border-amber-600'
              }`}
              title="Click to inspect the SSL/HTTPS status of this site"
            >
              {siteLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
              {phase === 'attacked' ? (
                <span>http://bank.northstar.test/login <span className="text-red-400">(NO HTTPS!)</span></span>
              ) : (
                <span>http://bank.northstar.test/login</span>
              )}
            </button>
          </div>

          {/* Simulated bank page */}
          <div className="flex-1 overflow-y-auto bg-white text-gray-900 p-4">
            <div className="max-w-xs mx-auto space-y-4 mt-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">🏦</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Northstar Bank</h2>
                <p className="text-xs text-gray-500">Online Banking Portal</p>
              </div>

              {phase === 'initial' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <strong>You're at:</strong> {networkName} (Public Wi-Fi)<br />
                    Do you want to connect and check your account?
                  </div>
                  <button onClick={handleConnect} className="w-full py-2 bg-blue-700 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition">
                    Connect to Public Wi-Fi & Continue
                  </button>
                </div>
              )}

              {(phase === 'connected' || phase === 'attacked') && (
                <form onSubmit={e => { e.preventDefault(); handleTypeCredentials(); }} className="space-y-3">
                  {phase === 'attacked' && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-700 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                      Notice the address bar says <strong>http://</strong> (NOT https) — there is NO padlock! Your data will travel UNENCRYPTED.
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                    <input type="text" placeholder="jsmith" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-blue-700 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition">
                    Log In
                  </button>
                </form>
              )}

              {phase === 'defended' && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-emerald-800">Attack Detected & Prevented!</div>
                  <p className="text-xs text-emerald-700">You noticed the missing HTTPS padlock and refused to submit credentials. You successfully defended against a MITM SSL Strip attack.</p>
                </div>
              )}

              {phase === 'captured' && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-center space-y-1">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                  <div className="font-bold text-red-800">Credentials Captured!</div>
                  <p className="text-xs text-red-700">Your plaintext login was intercepted by the MITM attacker. In a real attack, your account would now be compromised.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Packet capture panel */}
        <div className="w-56 flex flex-col bg-slate-900 overflow-hidden">
          <div className="px-2 py-1.5 border-b border-slate-800 flex items-center gap-1.5 text-[10px] text-red-400 font-bold font-mono">
            <Eye className="w-3 h-3" /> ATTACKER'S PACKET SNIFFER
          </div>
          {packets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[11px] text-slate-600 text-center p-3">
              No packets captured yet.<br />Connect to Wi-Fi to begin.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {packets.map(p => (
                <div key={p.id} className={`p-1.5 rounded border text-[10px] font-mono ${p.dangerous ? 'bg-red-950/40 border-red-800/60' : 'bg-slate-800 border-slate-700'}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-bold ${p.type === 'HTTP' ? 'text-red-400' : p.type === 'HTTPS' ? 'text-emerald-400' : 'text-cyan-400'}`}>{p.type}</span>
                    <span className="text-slate-600 text-[9px]">{p.timestamp}</span>
                  </div>
                  <div className={`text-[10px] leading-relaxed break-all ${p.dangerous ? 'text-red-200' : 'text-slate-400'}`}>{p.payload}</div>
                  {p.intercepted && <div className="text-[9px] text-red-400 mt-0.5">⚠ INTERCEPTED</div>}
                </div>
              ))}
            </div>
          )}

          {/* Stolen data */}
          {showDataViz && (
            <div className="border-t border-red-900/60 max-h-48 overflow-y-auto">
              <DataExposureVisualizer items={stolenData} compact attackerAlias="evilTwin-7F2A" serverLocation="185.220.101.48 (Tor)" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom instruction bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-3 py-1.5 text-[10px] text-slate-400 flex items-center gap-2">
        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
        <span><strong className="text-amber-400">Key lesson:</strong> {attackInfo.desc} Always use a VPN on public Wi-Fi and check for HTTPS before entering credentials.</span>
      </div>
    </div>
  );
}
