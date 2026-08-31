import React, { useState } from 'react';
import { Puzzle, Star, Shield, Flag, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Eye, Download, X, User } from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

interface ExtPermission { label: string; risk: 'low' | 'medium' | 'high' | 'critical'; description: string; }
interface Review { user: string; stars: number; text: string; suspicious?: boolean; }

interface ExtensionMarketplaceProps {
  extensionName: string;
  publisher: string;
  publisherVerified: boolean;
  description: string;
  rating: number;
  reviewCount: number;
  permissions: ExtPermission[];
  reviews: Review[];
  onInstall?: () => void;
  onDefend?: () => void;
}

export function ExtensionMarketplace({ extensionName, publisher, publisherVerified, description, rating, reviewCount, permissions, reviews, onInstall, onDefend }: ExtensionMarketplaceProps) {
  const [expandedPerms, setExpandedPerms] = useState(false);
  const [publisherChecked, setPublisherChecked] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [permsReviewed, setPermsReviewed] = useState(false);
  const [reported, setReported] = useState(false);
  const [installed, setInstalled] = useState(false);
  const { fireEvent } = useSimulationStore();

  const handleCheckPublisher = () => {
    if (!publisherChecked) {
      setPublisherChecked(true);
      fireEvent('SENDER_INSPECTED', {
        label: `Checked extension publisher: ${publisher}`,
        riskDelta: publisherVerified ? 0 : -5, scoreDelta: 5, isInvestigative: true,
        attackerSees: 'Victim checking extension publisher verification',
      });
      toast.info(publisherVerified ? 'Publisher is verified ✓' : '⚠ Publisher is NOT verified');
    }
  };

  const handleExpandPerms = () => {
    setExpandedPerms(!expandedPerms);
    if (!permsReviewed) {
      setPermsReviewed(true);
      fireEvent('PERMISSION_VIEWED', {
        label: 'Reviewed extension permissions list',
        riskDelta: -5, scoreDelta: 8, isInvestigative: true,
        attackerSees: 'Victim reviewing extension permissions',
      });
    }
  };

  const handleExpandReviews = () => {
    setReviewsExpanded(!reviewsExpanded);
    if (!reviewsExpanded) {
      fireEvent('URL_INSPECTED', {
        label: 'Read extension reviews',
        riskDelta: 0, scoreDelta: 3, isInvestigative: true,
        attackerSees: 'Victim reading reviews (investigating)',
      });
    }
  };

  const handleInstall = () => {
    if (installed) return;
    setInstalled(true);
    const highRisk = permissions.filter(p => p.risk === 'high' || p.risk === 'critical');
    fireEvent('PERMISSION_ACCEPTED', {
      label: `Installed extension "${extensionName}" with ${highRisk.length} high-risk permissions`,
      riskDelta: 30, scoreDelta: -20, isBranch: true,
      attackerSees: 'EXTENSION INSTALLED — full browser access granted',
      exposedData: permissions.map(p => `${p.label} access (simulated)`),
      nextState: 'COMPROMISED',
    });
    toast.error('Extension installed with dangerous permissions!');
    if (onInstall) onInstall();
  };

  const handleCancel = () => {
    fireEvent('PERMISSION_REJECTED', {
      label: 'Cancelled extension installation',
      riskDelta: -15, scoreDelta: 15, isDefensive: true, isBranch: true,
      attackerSees: 'Victim cancelled extension install — attack failed',
      nextState: 'DEFENDED',
    });
    toast.success('Installation cancelled!');
    if (onDefend) onDefend();
  };

  const handleReport = () => {
    if (reported) return;
    setReported(true);
    fireEvent('REPORT_FILED', {
      label: 'Reported suspicious extension',
      riskDelta: -20, scoreDelta: 20, isDefensive: true, isBranch: true,
      attackerSees: 'Extension reported — listing may be removed',
      nextState: 'DEFENDED',
    });
    toast.success('Extension reported!');
    if (onDefend) onDefend();
  };

  const highRiskCount = permissions.filter(p => p.risk === 'high' || p.risk === 'critical').length;
  const riskDot: Record<string, string> = { low: 'bg-emerald-500', medium: 'bg-amber-500', high: 'bg-orange-500', critical: 'bg-red-500' };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 rounded-xl overflow-hidden border border-slate-800">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center gap-3">
        <Puzzle className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold">Extension Marketplace</span>
        <div className="ml-auto">
          <button onClick={handleReport} disabled={reported}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition ${
              reported ? 'bg-green-900/40 border-green-800/40 text-green-400' : 'bg-rose-900/30 border-rose-800/40 text-rose-400 hover:bg-rose-900/60'
            }`}>
            <Flag className="w-3 h-3" />{reported ? 'Reported ✓' : 'Report'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white text-gray-900 p-6">
        <div className="max-w-lg mx-auto space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {extensionName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{extensionName}</h2>
              <button onClick={handleCheckPublisher} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
                <User className="w-3 h-3" /> {publisher}
                {publisherChecked && (publisherVerified
                  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                )}
              </button>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                </div>
                <span className="text-xs text-gray-500">{rating.toFixed(1)} ({reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">{description}</p>

          {publisherChecked && !publisherVerified && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>This publisher has NOT been verified. Exercise caution.</span>
            </div>
          )}

          {/* Permissions */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={handleExpandPerms} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition text-left">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="flex-1 text-sm font-semibold text-gray-800">Permissions ({permissions.length})</span>
              {highRiskCount > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{highRiskCount} high-risk</span>}
              {expandedPerms ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedPerms && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                {permissions.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${riskDot[p.risk]}`} />
                    <div><span className="font-medium text-gray-800">{p.label}</span><div className="text-gray-500 mt-0.5">{p.description}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={handleExpandReviews} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition text-left">
              <Star className="w-4 h-4 text-gray-500" />
              <span className="flex-1 text-sm font-semibold text-gray-800">Reviews</span>
              {reviewsExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {reviewsExpanded && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                {reviews.map((r, i) => (
                  <div key={i} className={`text-xs space-y-1 ${r.suspicious ? 'bg-amber-50 border border-amber-200 rounded-lg p-2' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{r.user}</span>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} className={`w-2.5 h-2.5 ${n <= r.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}</div>
                    </div>
                    <p className="text-gray-600">{r.text}</p>
                    {r.suspicious && <div className="text-amber-600 text-[10px] font-medium">⚠ This review looks potentially fake</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleInstall} disabled={installed}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50">
              <Download className="w-4 h-4" /> {installed ? 'Installed' : 'Add to Browser'}
            </button>
            <button onClick={handleCancel}
              className="flex-1 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
