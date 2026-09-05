import React, { useState } from 'react';
import { Camera, ExternalLink, X, Shield, Flag, AlertTriangle, CheckCircle, QrCode } from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

interface QRScannerProps {
  qrLabel: string;
  decodedUrl: string;
  urlIsSafe: boolean;
  brandName?: string;
  onOpen?: () => void;
  onDefend?: () => void;
}

export function QRScanner({ qrLabel, decodedUrl, urlIsSafe, brandName = 'Unknown', onOpen, onDefend }: QRScannerProps) {
  const [phase, setPhase] = useState<'scan' | 'preview' | 'opened'>('scan');
  const [scanning, setScanning] = useState(false);
  const [urlInspected, setUrlInspected] = useState(false);
  const [reported, setReported] = useState(false);
  const { fireEvent } = useSimulationStore();

  const handleScan = () => {
    setScanning(true);
    fireEvent('QR_SCANNED', {
      label: 'QR code scanned — decoding URL',
      riskDelta: 5, scoreDelta: 0,
      attackerSees: 'Victim scanned QR code',
    });
    setTimeout(() => { setScanning(false); setPhase('preview'); }, 1200);
  };

  const handleInspectUrl = () => {
    if (!urlInspected) {
      setUrlInspected(true);
      fireEvent('URL_INSPECTED', {
        label: `Inspected decoded QR URL: ${decodedUrl}`,
        riskDelta: -5, scoreDelta: 8, isInvestigative: true, isDefensive: false,
        attackerSees: 'Victim inspecting QR destination URL',
      });
      toast.info('URL inspected — check domain carefully');
    }
  };

  const handleOpen = () => {
    setPhase('opened');
    fireEvent('LINK_OPENED', {
      label: `Opened QR destination: ${decodedUrl}`,
      riskDelta: urlIsSafe ? 0 : 25, scoreDelta: urlIsSafe ? 2 : -15, isBranch: true,
      attackerSees: urlIsSafe ? 'Victim opened safe URL' : 'Victim navigated to malicious QR destination',
      exposedData: urlIsSafe ? [] : ['Device ID (simulated)', 'Location (simulated)', 'Browser fingerprint (simulated)'],
      nextState: urlIsSafe ? undefined : 'COMPROMISED',
    });
    if (!urlIsSafe) toast.error('Navigated to suspicious site!');
    if (onOpen) onOpen();
  };

  const handleCancel = () => {
    fireEvent('DEFENSE_ACTION', {
      label: 'Cancelled QR navigation — did not open suspicious URL',
      riskDelta: -15, scoreDelta: 15, isDefensive: true, isBranch: true,
      attackerSees: 'Victim cancelled navigation — QR phishing failed',
      nextState: 'DEFENDED',
    });
    toast.success('Good choice — URL not opened');
    if (onDefend) onDefend();
  };

  const handleReport = () => {
    if (reported) return;
    setReported(true);
    fireEvent('REPORT_FILED', {
      label: 'Reported suspicious QR code',
      riskDelta: -20, scoreDelta: 20, isDefensive: true, isBranch: true,
      attackerSees: 'QR code reported — campaign flagged',
      nextState: 'DEFENDED',
    });
    toast.success('QR code reported!');
    if (onDefend) onDefend();
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 rounded-xl overflow-hidden border border-slate-800">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center gap-3">
        <QrCode className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">QR Scanner</span>
        <div className="ml-auto">
          <button onClick={handleReport} disabled={reported}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition ${
              reported ? 'bg-green-900/40 border-green-800/40 text-green-400' : 'bg-rose-900/30 border-rose-800/40 text-rose-400 hover:bg-rose-900/60'
            }`}>
            <Flag className="w-3 h-3" />{reported ? 'Reported ✓' : 'Report'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {phase === 'scan' && (
          <div className="text-center space-y-6 max-w-sm">
            <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-cyan-700 rounded-2xl flex items-center justify-center bg-slate-900/50">
              {scanning ? (
                <div className="animate-pulse text-cyan-400"><Camera className="w-12 h-12" /></div>
              ) : (
                <div className="space-y-2 text-center">
                  <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                  <div className="text-xs text-slate-400">{qrLabel}</div>
                </div>
              )}
              {scanning && <div className="absolute inset-x-4 h-0.5 bg-cyan-400 animate-bounce top-1/2" />}
            </div>
            <button onClick={handleScan} disabled={scanning}
              className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition disabled:opacity-50">
              {scanning ? 'Scanning…' : 'Scan QR Code'}
            </button>
          </div>
        )}

        {phase === 'preview' && (
          <div className="max-w-sm w-full space-y-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Scan Result
              </div>
              <div className={`font-mono text-sm p-3 rounded-lg border ${
                urlIsSafe ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-red-950/30 border-red-800/40 text-red-300'
              }`}>
                {decodedUrl}
              </div>
              <button onClick={handleInspectUrl}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs transition">
                {urlInspected ? <CheckCircle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                {urlInspected ? 'URL inspected ✓' : 'Inspect URL details'}
              </button>
              {urlInspected && !urlIsSafe && (
                <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-2.5 text-[11px] text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Warning: This URL does not match any known {brandName} domain. It may be a phishing attempt.</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleOpen}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                  urlIsSafe ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}>
                <ExternalLink className="w-4 h-4" /> Open URL
              </button>
              <button onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {phase === 'opened' && (
          <div className="text-center space-y-3 max-w-sm">
            {urlIsSafe ? (
              <><CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" /><p className="text-emerald-300">Safe page opened.</p></>
            ) : (
              <><AlertTriangle className="w-16 h-16 text-red-400 mx-auto" /><p className="text-red-300">You navigated to a suspicious site from the QR code.</p></>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
