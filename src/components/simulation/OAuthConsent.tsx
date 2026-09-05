import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Flag, X, Eye } from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

interface OAuthPermission {
  label: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

interface OAuthConsentProps {
  appName: string;
  appPublisher: string;
  publisherVerified: boolean;
  appIcon?: string;
  permissions: OAuthPermission[];
  onAccept?: () => void;
  onDeny?: () => void;
}

export function OAuthConsent({ appName, appPublisher, publisherVerified, permissions, onAccept, onDeny }: OAuthConsentProps) {
  const [expandedPerms, setExpandedPerms] = useState<Set<number>>(new Set());
  const [allReviewed, setAllReviewed] = useState(false);
  const [publisherInspected, setPublisherInspected] = useState(false);
  const [reported, setReported] = useState(false);
  const { fireEvent } = useSimulationStore();

  const riskColors = {
    low: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40',
    medium: 'text-amber-400 bg-amber-950/30 border-amber-800/40',
    high: 'text-orange-400 bg-orange-950/30 border-orange-800/40',
    critical: 'text-red-400 bg-red-950/30 border-red-800/40',
  };

  const togglePerm = (idx: number) => {
    const next = new Set(expandedPerms);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setExpandedPerms(next);
    if (!allReviewed) {
      fireEvent('PERMISSION_VIEWED', {
        label: `Reviewed permission: ${permissions[idx].label}`,
        riskDelta: -2, scoreDelta: 3, isInvestigative: true,
        attackerSees: 'Victim reviewing OAuth permissions carefully',
      });
      if (next.size === permissions.length) {
        setAllReviewed(true);
        toast.info('All permissions reviewed!');
      }
    }
  };

  const handleInspectPublisher = () => {
    if (!publisherInspected) {
      setPublisherInspected(true);
      fireEvent('SENDER_INSPECTED', {
        label: `Inspected app publisher: ${appPublisher}`,
        riskDelta: publisherVerified ? 0 : -5,
        scoreDelta: 5, isInvestigative: true, isDefensive: false,
        attackerSees: 'Victim checking OAuth app publisher identity',
      });
      toast.info(publisherVerified ? 'Publisher is verified' : '⚠ Publisher is NOT verified');
    }
  };

  const handleAccept = () => {
    fireEvent('PERMISSION_ACCEPTED', {
      label: 'OAuth consent GRANTED — all permissions accepted',
      riskDelta: 30, scoreDelta: -20, isBranch: true,
      attackerSees: 'OAUTH CONSENT GRANTED — full access obtained',
      exposedData: permissions.map(p => p.label + ' (simulated)'),
      nextState: 'COMPROMISED',
    });
    toast.error('All permissions granted to suspicious app!');
    if (onAccept) onAccept();
  };

  const handleDeny = () => {
    fireEvent('PERMISSION_REJECTED', {
      label: 'OAuth consent DENIED — permissions rejected',
      riskDelta: -20, scoreDelta: 20, isDefensive: true, isBranch: true,
      attackerSees: 'Target denied OAuth permissions — attack failed',
      nextState: 'DEFENDED',
    });
    toast.success('Permissions denied — good choice!');
    if (onDeny) onDeny();
  };

  const handleReport = () => {
    if (reported) return;
    setReported(true);
    fireEvent('REPORT_FILED', {
      label: 'Reported suspicious OAuth application',
      riskDelta: -20, scoreDelta: 20, isDefensive: true, isBranch: true,
      attackerSees: 'Suspicious app reported — campaign flagged',
      nextState: 'DEFENDED',
    });
    toast.success('Suspicious app reported!');
    if (onDeny) onDeny();
  };

  const highRiskCount = permissions.filter(p => p.risk === 'high' || p.risk === 'critical').length;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 rounded-xl overflow-hidden border border-slate-800">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center gap-3">
        <Shield className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">Authorization Request</span>
        <div className="ml-auto">
          <button onClick={handleReport} disabled={reported}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition ${
              reported ? 'bg-green-900/40 border-green-800/40 text-green-400' : 'bg-rose-900/30 border-rose-800/40 text-rose-400 hover:bg-rose-900/60'
            }`}>
            <Flag className="w-3 h-3" />{reported ? 'Reported ✓' : 'Report App'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white text-gray-900 p-6">
        <div className="max-w-md mx-auto space-y-5">
          {/* App info */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto text-white text-2xl font-bold">
              {appName.charAt(0)}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{appName}</h2>
            <button onClick={handleInspectPublisher}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition">
              By: <span className="font-medium">{appPublisher}</span>
              {publisherInspected && (publisherVerified
                ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                : <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              )}
              <Eye className="w-3 h-3 text-gray-400" />
            </button>
            {publisherInspected && !publisherVerified && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                ⚠ This publisher has NOT been verified
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 text-center">
            <strong>{appName}</strong> wants to access your account. Review the permissions below:
          </p>

          {highRiskCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>This app requests <strong>{highRiskCount} high-risk permission{highRiskCount > 1 ? 's' : ''}</strong>. Review carefully before granting access.</span>
            </div>
          )}

          {/* Permissions list */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase">Requested Permissions ({permissions.length})</div>
            {permissions.map((perm, idx) => (
              <div key={idx} className={`border rounded-lg overflow-hidden ${
                perm.risk === 'critical' ? 'border-red-300' : perm.risk === 'high' ? 'border-orange-300' : 'border-gray-200'
              }`}>
                <button onClick={() => togglePerm(idx)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    perm.risk === 'critical' ? 'bg-red-500' : perm.risk === 'high' ? 'bg-orange-500' : perm.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span className="flex-1 text-sm font-medium text-gray-800">{perm.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${riskColors[perm.risk]}`}>{perm.risk}</span>
                  {expandedPerms.has(idx) ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                {expandedPerms.has(idx) && (
                  <div className="px-3 pb-2.5 text-xs text-gray-600 border-t border-gray-100 pt-2">{perm.description}</div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleAccept}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition">
              Allow Access
            </button>
            <button onClick={handleDeny}
              className="flex-1 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm transition">
              Deny
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center">SIMULATION — NO REAL OAUTH TOKENS</p>
        </div>
      </div>
    </div>
  );
}
