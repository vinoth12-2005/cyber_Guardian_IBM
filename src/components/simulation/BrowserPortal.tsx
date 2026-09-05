// ============================================================
// SE-LAB — Browser / Portal Environment Component
// Simulated browser with address bar, certificate indicator,
// branded portal pages, multi-field forms, and full interactivity
// Used by: SE-005–010, SE-012–017, SE-025–029, etc.
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  Globe, Lock, Unlock, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, Flag, Eye, ExternalLink,
  RefreshCw, Star, X, Shield, FileText, Search
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

// ---------- Types ----------
interface PortalField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[]; // for select
  required?: boolean;
  exposedLabel?: string; // label in attacker dashboard when submitted
}

interface PortalPage {
  id: string;
  title: string;
  subtitle?: string;
  content?: string; // HTML content
  fields?: PortalField[];
  submitLabel?: string;
  nextPageId?: string; // which page to go after submit
  isConfirmation?: boolean;
}

interface BrowserPortalProps {
  simulationId: string;
  url: string;
  urlIsSafe: boolean;
  siteTitle: string;
  brandName: string;
  brandColor: string;
  brandLogo?: string;
  certificateStatus: 'valid' | 'invalid' | 'missing';
  pages: PortalPage[];
  navItems?: string[];
  bookmarks?: { label: string; url: string; isLegitimate: boolean }[];
  onSubmitData?: () => void;
  onDefend?: () => void;
}

// ---------- Certificate Info Panel ----------
function CertificatePanel({ status, url, onClose }: { status: 'valid' | 'invalid' | 'missing'; url: string; onClose: () => void }) {
  const colors = {
    valid: { bg: 'bg-emerald-950/40', border: 'border-emerald-800/50', icon: <Lock className="w-4 h-4 text-emerald-400" />, text: 'text-emerald-400', label: 'Connection is secure' },
    invalid: { bg: 'bg-red-950/40', border: 'border-red-800/50', icon: <Unlock className="w-4 h-4 text-red-400" />, text: 'text-red-400', label: 'Certificate is invalid' },
    missing: { bg: 'bg-amber-950/40', border: 'border-amber-800/50', icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, text: 'text-amber-400', label: 'Not secure — HTTP only' },
  };
  const c = colors[status];

  return (
    <div className={`absolute top-full left-0 mt-1 w-72 rounded-xl ${c.bg} border ${c.border} p-3 z-30 shadow-xl text-xs space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {c.icon}
          <span className={`font-bold ${c.text}`}>{c.label}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="font-mono text-[10px] text-slate-400 break-all">{url}</div>
      {status === 'valid' && (
        <div className="text-emerald-300 text-[11px]">This connection uses TLS 1.3 encryption. The server identity has been verified.</div>
      )}
      {status === 'invalid' && (
        <div className="space-y-1">
          <div className="text-red-300">⚠ The certificate for this site is not valid.</div>
          <div className="text-slate-400">This may indicate a man-in-the-middle attack or a misconfigured server. Do NOT enter sensitive information.</div>
        </div>
      )}
      {status === 'missing' && (
        <div className="space-y-1">
          <div className="text-amber-300">This site does not use HTTPS encryption.</div>
          <div className="text-slate-400">Data transmitted to this site could be intercepted. Never enter passwords on HTTP-only sites.</div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Component ----------
export function BrowserPortal({
  simulationId,
  url,
  urlIsSafe,
  siteTitle,
  brandName,
  brandColor,
  certificateStatus,
  pages,
  navItems = [],
  bookmarks = [],
  onSubmitData,
  onDefend,
}: BrowserPortalProps) {
  const [currentPageId, setCurrentPageId] = useState(pages[0]?.id || '');
  const [showCert, setShowCert] = useState(false);
  const [urlInspected, setUrlInspected] = useState(false);
  const [certInspected, setCertInspected] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [reported, setReported] = useState(false);
  const [bookmarkCompared, setBookmarkCompared] = useState(false);
  const [pageHistory, setPageHistory] = useState<string[]>([pages[0]?.id || '']);
  const { fireEvent } = useSimulationStore();

  const currentPage = pages.find(p => p.id === currentPageId) || pages[0];

  const handleInspectUrl = () => {
    if (typeof (window as any).triggerUrlInterception === 'function') {
      (window as any).triggerUrlInterception(url);
    } else {
      window.dispatchEvent(new CustomEvent('flotbot-intercept-url', { detail: { url } }));
    }

    if (!urlInspected) {
      setUrlInspected(true);
      fireEvent('URL_INSPECTED', {
        label: 'Inspected browser address bar URL with Real-Time Detection Engine',
        riskDelta: urlIsSafe ? 0 : -5,
        scoreDelta: 5,
        isInvestigative: true,
        attackerSees: 'Victim checking URL in address bar',
      });
      toast.info('URL inspected across detection engines — check domain protocol carefully');
    }
  };

  const handleInspectCert = () => {
    if (!certInspected) {
      setCertInspected(true);
      fireEvent('URL_INSPECTED', {
        label: `Inspected certificate: ${certificateStatus}`,
        riskDelta: certificateStatus !== 'valid' ? -5 : 0,
        scoreDelta: 5,
        isInvestigative: true,
        isDefensive: certificateStatus !== 'valid',
        attackerSees: 'Victim examining site certificate status',
      });
    }
    setShowCert(!showCert);
  };

  const handleCompareBookmark = (bm: { label: string; url: string; isLegitimate: boolean }) => {
    if (!bookmarkCompared) {
      setBookmarkCompared(true);
      fireEvent('URL_INSPECTED', {
        label: `Compared URL with known-good bookmark: ${bm.label}`,
        riskDelta: bm.isLegitimate ? -10 : -5,
        scoreDelta: 8,
        isInvestigative: true,
        isDefensive: true,
        attackerSees: 'Victim comparing current URL with legitimate bookmark',
      });
      if (bm.isLegitimate && !urlIsSafe) {
        toast.warning(`Domain mismatch! Bookmark → ${bm.url} vs current → ${url}`);
      } else {
        toast.info(`Bookmark comparison: ${bm.label}`);
      }
    }
  };

  const handleFieldFocus = (field: PortalField) => {
    fireEvent('FORM_FIELD_FOCUSED', {
      label: `Focused on "${field.label}" field`,
      riskDelta: 3,
      scoreDelta: -2,
      attackerSees: `Victim focusing on ${field.label} field`,
    });
  };

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleFieldInput = (field: PortalField) => {
    fireEvent('SYNTHETIC_DATA_ENTERED', {
      label: `Entering data into "${field.label}" field`,
      riskDelta: urlIsSafe ? 0 : 8,
      scoreDelta: urlIsSafe ? 0 : -5,
      attackerSees: `Victim typing in ${field.label} field on suspicious portal`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;

    const currentFields = currentPage?.fields || [];
    const exposedItems = currentFields
      .filter(f => formValues[f.name]?.trim())
      .map(f => f.exposedLabel || `${f.label} (simulated)`);

    if (currentPage?.nextPageId) {
      // Multi-page form — go to next page
      fireEvent('FORM_SUBMITTED', {
        label: `Submitted "${currentPage.title}" page`,
        riskDelta: urlIsSafe ? 0 : 15,
        scoreDelta: urlIsSafe ? 0 : -10,
        isBranch: true,
        attackerSees: `Form page "${currentPage.title}" submitted`,
        exposedData: exposedItems,
      });
      setCurrentPageId(currentPage.nextPageId);
      setPageHistory(prev => [...prev, currentPage.nextPageId!]);
      setFormValues({});
    } else {
      // Final submit
      setSubmitted(true);
      fireEvent('FORM_SUBMITTED', {
        label: 'Final form submission — all data transmitted',
        riskDelta: urlIsSafe ? 0 : 30,
        scoreDelta: urlIsSafe ? 0 : -20,
        isBranch: true,
        attackerSees: 'FULL DATA PACKAGE SUBMITTED TO ATTACKER PORTAL',
        exposedData: exposedItems,
        nextState: urlIsSafe ? undefined : 'CREDENTIAL_CAPTURED',
      });
      if (!urlIsSafe) {
        fireEvent('CREDENTIAL_EXPOSED', {
          label: 'Synthetic data package transmitted to attacker',
          riskDelta: 0,
          scoreDelta: -5,
          attackerSees: 'Data package logged in attacker database',
          exposedData: ['Simulated session token', 'Simulated device fingerprint'],
        });
      }
      toast[urlIsSafe ? 'success' : 'error'](urlIsSafe ? 'Form submitted safely' : 'Data submitted to attacker portal!');
      if (onSubmitData) onSubmitData();
    }
  };

  const handleReport = () => {
    if (reported) return;
    setReported(true);
    fireEvent('REPORT_FILED', {
      label: 'Reported suspicious website',
      riskDelta: -20,
      scoreDelta: 20,
      isDefensive: true,
      isBranch: true,
      attackerSees: 'Victim reported suspicious portal — campaign may be flagged',
      nextState: 'DEFENDED',
    });
    toast.success('Site reported as suspicious!');
    if (onDefend) onDefend();
  };

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHist = [...pageHistory];
      newHist.pop();
      setCurrentPageId(newHist[newHist.length - 1]);
      setPageHistory(newHist);
    }
  };

  const certIcon = certificateStatus === 'valid'
    ? <Lock className="w-3.5 h-3.5 text-emerald-500" />
    : certificateStatus === 'invalid'
    ? <Unlock className="w-3.5 h-3.5 text-red-500" />
    : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 rounded-xl overflow-hidden border border-slate-800">
      {/* Tab bar */}
      <div className="bg-slate-800 flex items-center gap-0.5 px-2 pt-1.5">
        <div className="flex items-center gap-1.5 bg-slate-900 border-t border-x border-slate-700 rounded-t-lg px-3 py-1.5 text-[11px] text-slate-200 max-w-48">
          <Globe className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="truncate">{siteTitle}</span>
          <button className="text-slate-500 hover:text-slate-300 ml-auto"><X className="w-3 h-3" /></button>
        </div>
        <div className="text-slate-600 text-lg leading-none px-2 pb-0.5">+</div>
      </div>

      {/* Browser toolbar — address bar */}
      <div className="bg-slate-900 border-b border-slate-700 px-2 py-1.5 flex items-center gap-2">
        <button onClick={handleBack} className="text-slate-400 hover:text-slate-200 transition p-0.5"><ChevronLeft className="w-4 h-4" /></button>
        <button className="text-slate-500 p-0.5"><ChevronRight className="w-4 h-4" /></button>
        <button className="text-slate-500 hover:text-slate-200 transition p-0.5"><RefreshCw className="w-3.5 h-3.5" /></button>

        {/* Address bar */}
        <div className="relative flex-1">
          <button
            onClick={() => { handleInspectUrl(); handleInspectCert(); }}
            className="w-full flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-left hover:border-cyan-600 transition group"
          >
            {certIcon}
            <span className={`font-mono text-[12px] flex-1 truncate ${urlIsSafe ? 'text-slate-300' : 'text-red-400'}`}>
              {url}
            </span>
            {urlInspected && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                urlIsSafe ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' : 'bg-red-950/40 border-red-800/40 text-red-400'
              }`}>
                {urlIsSafe ? '✓ Verified' : '⚠ Suspicious'}
              </span>
            )}
          </button>
          {showCert && (
            <CertificatePanel status={certificateStatus} url={url} onClose={() => setShowCert(false)} />
          )}
        </div>

        {/* Report */}
        <button
          onClick={handleReport}
          disabled={reported}
          className={`flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-lg border transition ${
            reported ? 'bg-green-900/40 border-green-800/40 text-green-400' : 'bg-rose-900/30 border-rose-800/40 text-rose-400 hover:bg-rose-900/60'
          }`}
        >
          <Flag className="w-3 h-3" />
          {reported ? '✓' : 'Report'}
        </button>
      </div>

      {/* Bookmark bar */}
      {bookmarks.length > 0 && (
        <div className="bg-slate-900/60 border-b border-slate-800 px-3 py-1 flex items-center gap-2 overflow-x-auto">
          <Star className="w-3 h-3 text-slate-500 flex-shrink-0" />
          {bookmarks.map((bm, i) => (
            <button
              key={i}
              onClick={() => handleCompareBookmark(bm)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition px-1.5 py-0.5 rounded hover:bg-slate-800 flex-shrink-0"
            >
              <Globe className="w-2.5 h-2.5" />
              {bm.label}
            </button>
          ))}
        </div>
      )}

      {/* Portal content area */}
      <div className="flex-1 overflow-y-auto bg-white text-gray-900">
        {/* Site header/nav */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-3" style={{ borderTopColor: brandColor, borderTopWidth: 3 }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: brandColor }}>
            {brandName.charAt(0)}
          </div>
          <span className="font-bold text-gray-900 text-sm">{brandName}</span>
          {navItems.length > 0 && (
            <div className="hidden sm:flex items-center gap-3 ml-4 text-xs text-gray-500">
              {navItems.map(n => (
                <button key={n} className="hover:text-gray-900 transition">{n}</button>
              ))}
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">U</div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
          <div className="w-full max-w-md space-y-5">
            {/* Page title */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">{currentPage?.title}</h2>
              {currentPage?.subtitle && <p className="text-gray-500 text-sm mt-1">{currentPage.subtitle}</p>}
            </div>

            {/* Page HTML content */}
            {currentPage?.content && (
              <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentPage.content }} />
            )}

            {/* Confirmation page */}
            {currentPage?.isConfirmation && (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600 text-sm">Your information has been submitted successfully.</p>
              </div>
            )}

            {/* Form fields */}
            {currentPage?.fields && currentPage.fields.length > 0 && !submitted && (
              <form onSubmit={handleSubmit} className="space-y-3">
                {currentPage.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formValues[field.name] || ''}
                        onChange={e => { handleFieldChange(field.name, e.target.value); handleFieldInput(field); }}
                        onFocus={() => handleFieldFocus(field)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formValues[field.name] || ''}
                        onChange={e => { handleFieldChange(field.name, e.target.value); handleFieldInput(field); }}
                        onFocus={() => handleFieldFocus(field)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                      >
                        <option value="">{field.placeholder || 'Select...'}</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formValues[field.name] || ''}
                        onChange={e => { handleFieldChange(field.name, e.target.value); handleFieldInput(field); }}
                        onFocus={() => handleFieldFocus(field)}
                        placeholder={field.placeholder}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-bold text-white text-sm transition hover:opacity-90"
                  style={{ background: brandColor }}
                >
                  {currentPage.submitLabel || 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-3 text-center text-[10px] text-gray-400">
          © 2024 {brandName} — All rights reserved · SIMULATION — NO REAL DATA COLLECTED
        </div>
      </div>
    </div>
  );
}
