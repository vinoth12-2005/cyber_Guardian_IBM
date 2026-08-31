// ============================================================
// SE-LAB — Master Victim OS Shell & In-Environment Security Tools
// Provides realistic OS frames (Windows 11, macOS, iPhone, Android, Linux, Cloud)
// and interactive in-environment SOC drawers (Replacing generic browser popups!)
// ============================================================

import React, { useState } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, Wifi, Battery, Clock,
  Terminal, Search, Globe, ChevronRight, X, Eye, CheckCircle2,
  AlertTriangle, Cpu, Lock, FileText, Server, Activity, ArrowRight,
  Radio, HardDrive, User, RefreshCw
} from 'lucide-react';
import { getVictimSpec, type VictimSpec, type VictimOSType } from '@/data/simulation/victim-environments';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

interface VictimOSWrapperProps {
  simId: string;
  simTitle: string;
  category: string;
  brand?: string;
  children: React.ReactNode;
  onDefend?: () => void;
}

// ------------------------------------------------------------
// IN-ENVIRONMENT SOC INCIDENT REPORT DRAWER
// ------------------------------------------------------------
function SOCReportDrawer({ spec, onClose }: { spec: VictimSpec; onClose: () => void }) {
  const session = useSimulationStore(s => s.session);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReport = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success(`SOC Ticket #INC-${Math.floor(1000 + Math.random() * 9000)} generated. Workstation isolated.`);
    }, 600);
  };

  return (
    <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-slate-900/95 backdrop-blur-md border-l border-slate-700 p-4 z-40 flex flex-col shadow-2xl text-xs modal-enter">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>SOC Incident Reporter</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Workstation telemetry card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="text-slate-400 text-[11px] font-mono uppercase font-bold flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" /> Host Telemetry
          </div>
          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <div className="flex justify-between"><span className="text-slate-500">Hostname:</span><span>{spec.hostname}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Host IP:</span><span>{spec.ipAddress}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">User:</span><span>{spec.userIdentity}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">EDR Agent:</span><span className="text-emerald-400">{spec.securityAgent}</span></div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 space-y-2">
          <div className="text-amber-400 text-[11px] font-bold uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Threat Analysis Payload
          </div>
          <div className="text-slate-300 text-xs">
            Suspicious social engineering activity flagged on {spec.appTitle}.
          </div>
          <div className="text-[10px] text-amber-300 font-mono bg-amber-950/40 p-2 rounded border border-amber-800/30">
            Action: Immediate SIEM correlation & DNS Sinkhole rule deployment requested.
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-emerald-300 font-bold text-sm">Incident Submitted to SOC</div>
            <p className="text-slate-400 text-[11px]">
              Workstation {spec.hostname} flagged safe. DNS sinkhole applied to domain.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSubmitReport}
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center gap-2 shadow-md shadow-cyan-900/30"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Transmitting to SOC…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Transmit Ticket to SOC
                </>
              )}
            </button>
            <div className="text-[10px] text-slate-500 text-center">
              Automated SIEM alert will trigger endpoint containment protocol.
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
        <span>SE-LAB SOC Console</span>
        <span className="font-mono text-cyan-400">Agent v7.14</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// MAIN VICTIM OS WRAPPER
// ------------------------------------------------------------
export function VictimOSWrapper({
  simId,
  simTitle,
  category,
  brand,
  children,
  onDefend,
}: VictimOSWrapperProps) {
  const spec = getVictimSpec(simId, simTitle, category, brand);
  const [showSocDrawer, setShowSocDrawer] = useState(false);
  const [showHostInfo, setShowHostInfo] = useState(false);

  const renderOSBar = () => {
    switch (spec.osType) {
      case 'windows11':
        return (
          <div className="bg-[#181825] border-t border-slate-800 h-10 px-3 flex items-center justify-between text-slate-300 text-xs flex-shrink-0 select-none">
            {/* Start Button & App shortcuts */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHostInfo(!showHostInfo)}
                className="w-7 h-7 rounded hover:bg-slate-700/60 flex items-center justify-center transition"
                title="Windows Start Menu — View Workstation Specs"
              >
                <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
                  <div className="bg-cyan-400 rounded-sm"></div>
                  <div className="bg-cyan-400 rounded-sm"></div>
                  <div className="bg-cyan-400 rounded-sm"></div>
                  <div className="bg-cyan-400 rounded-sm"></div>
                </div>
              </button>
              <div className="bg-slate-800/80 px-2.5 py-1 rounded-md text-[11px] text-slate-400 flex items-center gap-1.5 border border-slate-700/60">
                <Search className="w-3 h-3 text-slate-500" />
                <span className="truncate max-w-28">Type here to search</span>
              </div>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/40 px-2 py-1 rounded">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                <span className="font-mono text-[10px] text-slate-300">{spec.hostname}</span>
              </div>
            </div>

            {/* Title / App Center */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200 truncate">{spec.appTitle}</span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 font-mono">
                {spec.ipAddress}
              </span>
            </div>

            {/* System Tray */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setShowSocDrawer(true)}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60 transition"
                title="CrowdStrike EDR Status — Click to open SOC Incident Reporter"
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden md:inline font-mono">EDR: ACTIVE</span>
              </button>
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px] text-slate-400">10:42 AM</span>
            </div>
          </div>
        );

      case 'macos':
        return (
          <div className="bg-[#1e1e2e]/90 backdrop-blur-md border-b border-slate-800 h-7 px-3 flex items-center justify-between text-slate-300 text-[11px] select-none flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowHostInfo(!showHostInfo)} className="font-bold text-slate-100 hover:text-cyan-400"></button>
              <span className="font-bold text-slate-100">{spec.appBrand}</span>
              <span className="hidden sm:inline text-slate-400">File</span>
              <span className="hidden sm:inline text-slate-400">Edit</span>
              <span className="hidden sm:inline text-slate-400">View</span>
              <span className="hidden sm:inline text-slate-400">Window</span>
              <span className="hidden sm:inline text-slate-400">Help</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="font-mono text-cyan-400">{spec.hostname}</span>
              <button
                onClick={() => setShowSocDrawer(true)}
                className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300"
              >
                <ShieldCheck className="w-3 h-3" /> SentinelOne
              </button>
              <Wifi className="w-3 h-3 text-slate-400" />
              <Battery className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">Mon 10:42 AM</span>
            </div>
          </div>
        );

      case 'iphone':
      case 'android':
        return (
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span>09:41</span>
              <span className="text-[9px] bg-slate-800 px-1 rounded text-cyan-400">5G</span>
            </div>
            <div className="w-16 h-3 bg-black rounded-full border border-slate-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSocDrawer(true)} className="text-emerald-400 hover:text-emerald-300 text-[10px]" title="Mobile Security Shield">
                <ShieldCheck className="w-3 h-3 inline" />
              </button>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        );

      case 'linux':
        return (
          <div className="bg-[#0f172a] border-b border-slate-800 h-8 px-3 flex items-center justify-between text-xs text-slate-300 font-mono flex-shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 font-bold">root@{spec.hostname}:~#</span>
              <span className="text-slate-400 text-[11px] truncate max-w-40">{spec.appTitle}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <button onClick={() => setShowSocDrawer(true)} className="text-emerald-400 flex items-center gap-1 text-[10px]">
                <Activity className="w-3 h-3" /> Wazuh Active
              </button>
              <span className="text-slate-400">IP: {spec.ipAddress}</span>
              <span className="text-slate-400">UTC 10:42</span>
            </div>
          </div>
        );

      case 'cloud-console':
        return (
          <div className="bg-[#111827] border-b border-slate-800 h-9 px-3 flex items-center justify-between text-xs text-slate-300 flex-shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-xs">
                <Server className="w-4 h-4" />
                <span>Cloud Workspace</span>
              </div>
              <span className="text-slate-700">|</span>
              <span className="text-[11px] font-mono text-slate-400">Account: 8849-2041-9910</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">us-east-1</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSocDrawer(true)}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 hover:bg-cyan-900/60 transition font-mono"
              >
                <Shield className="w-3 h-3 text-cyan-400" /> SOC Inspector
              </button>
              <span className="text-slate-400 text-[11px]">{spec.userIdentity} ({spec.userRole})</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative h-full flex flex-col rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-gradient-to-b ${spec.wallpaperGrad}`}>
      {/* OS Top / Shell Bar */}
      {renderOSBar()}

      {/* Main Simulated Application Window */}
      <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </div>

      {/* Host Specs Overlay Modal */}
      {showHostInfo && (
        <div className="absolute top-10 left-4 z-40 bg-slate-900/95 border border-slate-700 rounded-xl p-4 w-72 shadow-2xl text-xs space-y-3 font-mono modal-enter">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-cyan-400 font-bold">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" /> Workstation Identity
            </div>
            <button onClick={() => setShowHostInfo(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div><span className="text-slate-500">Hostname: </span><span className="text-slate-100">{spec.hostname}</span></div>
            <div><span className="text-slate-500">IP Address: </span><span className="text-cyan-400">{spec.ipAddress}</span></div>
            <div><span className="text-slate-500">Assigned User: </span><span className="text-slate-100">{spec.userIdentity}</span></div>
            <div><span className="text-slate-500">Role: </span><span className="text-slate-300">{spec.userRole}</span></div>
            <div><span className="text-slate-500">Department: </span><span className="text-slate-300">{spec.department}</span></div>
            <div><span className="text-slate-500">Security Agent: </span><span className="text-emerald-400">{spec.securityAgent}</span></div>
          </div>
          {spec.uniqueFeatureBadge && (
            <div className="bg-cyan-950/40 border border-cyan-800/40 rounded p-2 text-[10px] text-cyan-300 font-sans font-medium">
              💡 {spec.uniqueFeatureBadge}
            </div>
          )}
        </div>
      )}

      {/* SOC Incident Report Drawer */}
      {showSocDrawer && (
        <SOCReportDrawer spec={spec} onClose={() => setShowSocDrawer(false)} />
      )}
    </div>
  );
}
