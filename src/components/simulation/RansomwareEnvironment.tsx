// ============================================================
// SE-LAB — Ransomware Attack Simulator
// Shows file encryption process, ransom note, and decryption
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Lock, Unlock, File, FolderOpen, AlertTriangle, Terminal,
  Bitcoin, Clock, Shield, ShieldAlert, RefreshCw, CheckCircle2,
  FileText, Image, Database, X
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';
import { DataExposureVisualizer, STOLEN_DATA_PRESETS } from './DataExposureVisualizer';

interface FileItem {
  name: string;
  type: 'doc' | 'image' | 'db' | 'code' | 'pdf';
  size: string;
  encrypted: boolean;
  exfiltrated: boolean;
}

interface RansomwareEnvironmentProps {
  ransomFamily?: string;
  bitcoinAddress?: string;
  ransomAmount?: string;
  onComplete?: (outcome: 'safe' | 'compromised') => void;
}

const FILE_ICON = { doc: FileText, image: Image, db: Database, code: Terminal, pdf: FileText };
const FILE_COLOR = { doc: 'text-blue-400', image: 'text-green-400', db: 'text-orange-400', code: 'text-cyan-400', pdf: 'text-red-400' };

const INITIAL_FILES: FileItem[] = [
  { name: 'Q4_Financial_Report.xlsx', type: 'doc', size: '2.1 MB', encrypted: false, exfiltrated: false },
  { name: 'employee_records.csv', type: 'db', size: '8.4 MB', encrypted: false, exfiltrated: false },
  { name: 'product_roadmap_2025.pptx', type: 'doc', size: '4.7 MB', encrypted: false, exfiltrated: false },
  { name: 'company_logo_hires.png', type: 'image', size: '12.3 MB', encrypted: false, exfiltrated: false },
  { name: 'customer_database_backup.sql', type: 'db', size: '1.2 GB', encrypted: false, exfiltrated: false },
  { name: 'source_code_v2.zip', type: 'code', size: '347 MB', encrypted: false, exfiltrated: false },
  { name: 'legal_contracts_2024.pdf', type: 'pdf', size: '18.9 MB', encrypted: false, exfiltrated: false },
  { name: 'HR_Salary_data_private.xlsx', type: 'doc', size: '1.5 MB', encrypted: false, exfiltrated: false },
];

export function RansomwareEnvironment({
  ransomFamily = 'LockBit 3.0',
  bitcoinAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf' ,
  ransomAmount = '$85,000 USD (2.4 BTC)',
  onComplete,
}: RansomwareEnvironmentProps) {
  const { fireEvent } = useSimulationStore();
  const [phase, setPhase] = useState<'initial' | 'exfiltrating' | 'encrypting' | 'encrypted' | 'defended'>('initial');
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [encryptProgress, setEncryptProgress] = useState(0);
  const [exfilProgress, setExfilProgress] = useState(0);
  const [countdown, setCountdown] = useState(72 * 60 * 60); // 72 hours in seconds
  const [showNote, setShowNote] = useState(false);
  const [showDataViz, setShowDataViz] = useState(false);
  const [openedAttachment, setOpenedAttachment] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'encrypted') return;
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleOpenAttachment = () => {
    if (openedAttachment) return;
    setOpenedAttachment(true);
    fireEvent('LINK_OPENED', {
      label: 'Opened malicious email attachment — ransomware payload executing',
      riskDelta: 35,
      scoreDelta: -25,
      isBranch: true,
      attackerSees: 'Macro executed — dropper downloading LockBit payload',
      exposedData: ['System access (simulated)', 'Network shares mounted (simulated)'],
      nextState: 'MALWARE_EXECUTED',
    });
    toast.error('⚠ Malicious macro executed! Ransomware is loading...');

    // Phase: Exfiltrating
    setPhase('exfiltrating');
    setShowDataViz(true);

    // Simulate exfiltration
    let exfilIdx = 0;
    const exfilInterval = setInterval(() => {
      if (exfilIdx >= files.length) {
        clearInterval(exfilInterval);
        startEncryption();
        return;
      }
      setFiles(prev => prev.map((f, i) => i === exfilIdx ? { ...f, exfiltrated: true } : f));
      setExfilProgress(Math.round(((exfilIdx + 1) / files.length) * 100));
      exfilIdx++;
    }, 400);
  };

  const startEncryption = () => {
    setPhase('encrypting');
    let encIdx = 0;
    const encInterval = setInterval(() => {
      if (encIdx >= files.length) {
        clearInterval(encInterval);
        setPhase('encrypted');
        setShowNote(true);
        fireEvent('CREDENTIAL_EXPOSED', {
          label: 'All files encrypted — ransom note deployed',
          riskDelta: 0,
          scoreDelta: -10,
          attackerSees: 'Encryption complete — ransom note displayed on victim workstation',
        });
        toast.error(`All files encrypted by ${ransomFamily}! Check the ransom note.`);
        onComplete?.('compromised');
        return;
      }
      setFiles(prev => prev.map((f, i) => i === encIdx ? { ...f, name: f.name + '.lockbit', encrypted: true } : f));
      setEncryptProgress(Math.round(((encIdx + 1) / files.length) * 100));
      encIdx++;
    }, 300);
  };

  const handleBlockMacro = () => {
    fireEvent('REPORT_FILED', {
      label: 'Blocked macro execution — ransomware prevented',
      riskDelta: -30,
      scoreDelta: 30,
      isDefensive: true,
      isBranch: true,
      attackerSees: 'Macro blocked by user — attack failed',
    });
    setPhase('defended');
    toast.success('🎉 Excellent! Blocking the macro prevented ransomware execution! Now answer the lab questions on the left side to complete the lab!', { duration: 6000 });
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c] overflow-hidden font-mono">
      {/* Desktop taskbar */}
      <div className="bg-[#1a1a2e] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-sm" />
          <span className="text-slate-300 font-sans">File Explorer — C:\Users\jsmith\Documents</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          {phase === 'encrypting' && (
            <div className="flex items-center gap-1.5 text-red-400 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ENCRYPTING... {encryptProgress}%</span>
            </div>
          )}
          {phase === 'exfiltrating' && (
            <div className="flex items-center gap-1.5 text-amber-400 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>EXFILTRATING... {exfilProgress}%</span>
            </div>
          )}
          <span className="text-[10px]">Mon 10:42 AM</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* File Explorer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-[#1e1e2e] border-b border-slate-800 px-3 py-1 text-[10px] text-slate-400 flex items-center gap-3">
            <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
            <span>C:\Users\jsmith\Documents</span>
            {phase === 'initial' && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-amber-400">⚠ Email attachment: Invoice_Q4.xlsm — macros detected</span>
              </div>
            )}
          </div>

          {/* Initial attachment dialog */}
          {phase === 'initial' && (
            <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center p-4">
              <div className="bg-white text-gray-900 rounded-xl p-5 w-80 shadow-2xl space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold text-sm">Security Warning</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">Macros have been disabled</div>
                  <p className="text-xs text-gray-600 mt-1">This file contains macros. <strong>Invoice_Q4.xlsm</strong> wants to run code that could harm your computer.</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-800">
                  <strong>Attacker's email:</strong> "Please enable macros to view the invoice — this is urgent."
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBlockMacro}
                    className="flex-1 py-2 bg-slate-600 text-white rounded-lg font-bold text-sm hover:bg-slate-700 transition"
                  >
                    ✓ Keep Disabled
                  </button>
                  <button
                    onClick={handleOpenAttachment}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition"
                  >
                    Enable Macros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File list */}
          <div className="flex-1 overflow-y-auto bg-[#0d1117] p-2 space-y-0.5">
            {files.map((file, idx) => {
              const Icon = FILE_ICON[file.type];
              const color = FILE_COLOR[file.type];
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] transition ${
                    file.encrypted
                      ? 'bg-red-950/50 border border-red-800/60'
                      : file.exfiltrated
                      ? 'bg-amber-950/30 border border-amber-800/40'
                      : 'hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className={`flex-shrink-0 ${file.encrypted ? 'text-red-400' : color}`}>
                    {file.encrypted ? <Lock className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`flex-1 truncate ${file.encrypted ? 'text-red-300' : 'text-slate-300'}`}>{file.name}</span>
                  <span className="text-slate-600 text-[10px]">{file.size}</span>
                  {file.exfiltrated && !file.encrypted && (
                    <span className="text-[9px] text-amber-400 font-bold bg-amber-950/60 px-1 rounded">EXFILTRATED</span>
                  )}
                  {file.encrypted && (
                    <span className="text-[9px] text-red-400 font-bold bg-red-950/60 px-1 rounded">ENCRYPTED</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Defended state */}
          {phase === 'defended' && (
            <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-emerald-700 rounded-xl p-5 w-80 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="text-emerald-300 font-bold text-sm">Ransomware Prevented!</div>
                <p className="text-slate-400 text-[11px]">By keeping macros disabled and not enabling them from an untrusted source, you prevented the ransomware from executing.</p>
                <div className="text-[10px] text-slate-500 bg-slate-950 rounded p-2 font-mono">
                  Never enable macros in Office files received via email.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Data viz or ransom note */}
        <div className="w-56 flex flex-col border-l border-slate-800 overflow-hidden">
          {showDataViz && !showNote && (
            <DataExposureVisualizer
              items={STOLEN_DATA_PRESETS.ransomwareExfil()}
              compact
              attackerAlias={`${ransomFamily}-Operator`}
              serverLocation="45.142.212.x (Bulletproof Hosting)"
            />
          )}

          {showNote && (
            <div className="flex-1 overflow-y-auto bg-black p-3 text-[10px] font-mono text-red-400 space-y-2">
              <div className="text-red-300 font-bold text-[11px] text-center border border-red-800 p-1">
                !!!YOUR FILES HAVE BEEN ENCRYPTED!!!
              </div>
              <div className="text-slate-300">All your documents, databases, backups, and other important files have been encrypted with military-grade algorithms.</div>
              <div className="text-amber-300 font-bold">RANSOM DEMAND: {ransomAmount}</div>
              <div className="text-slate-400">Payment Address:<br /><span className="text-yellow-400 break-all">{bitcoinAddress}</span></div>
              <div className="flex items-center gap-1.5 text-red-300">
                <Clock className="w-3 h-3" />
                <span>Time remaining:</span>
              </div>
              <div className={`text-2xl font-bold text-center ${countdown < 3600 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                {formatCountdown(countdown)}
              </div>
              <div className="text-slate-500 text-[9px] leading-relaxed">
                Do not contact law enforcement. Do not use recovery tools. Your data has been exfiltrated — if you don't pay, we will publish it on our leak site.
              </div>
              <div className="text-[9px] text-slate-600">
                — {ransomFamily} Ransomware Group
              </div>
            </div>
          )}

          {!showDataViz && !showNote && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-slate-600 text-center p-3">
              Attacker panel will activate when the attack begins.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
