// ============================================================
// SE-LAB — SMS / Smishing Environment Component
// Threaded SMS view with link preview, sender inspection,
// block/report/reply, and 8+ distinct interactions
// ============================================================

import React, { useState } from 'react';
import {
  Phone, Flag, Ban, MessageSquare, AlertTriangle,
  ExternalLink, Info, ChevronDown, CheckCircle, X, Shield
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

interface SmsMessage {
  id: string;
  sender: string;
  senderNumber: string;
  senderType: 'shortcode' | 'unknown' | 'spoofed';
  text: string;
  time: string;
  link?: { displayText: string; realUrl: string; safe: boolean };
  isAttacker?: boolean;
}

interface SmsClientProps {
  messages: SmsMessage[];
  senderName: string;
  senderNumber: string;
  senderType: 'shortcode' | 'unknown' | 'spoofed';
  portalUrl?: string;
  portalLogo?: string;
  portalColor?: string;
  onLinkFollowed?: () => void;
  onDefend?: () => void;
  simulationId: string;
}

function SmsPortal({
  url,
  logoText = 'Delivery Portal',
  logoColor = '#2563eb',
  onSubmit,
  onBack,
}: {
  url: string;
  logoText?: string;
  logoColor?: string;
  onSubmit?: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const { fireEvent } = useSimulationStore();

  const handleFocus = (field: string) => {
    fireEvent('FORM_FIELD_FOCUSED', { label: `Focused ${field} field`, riskDelta: 5, scoreDelta: -3 });
  };

  const handleInput = () => {
    fireEvent('SYNTHETIC_DATA_ENTERED', {
      label: 'Entering personal data into smishing form',
      riskDelta: 10,
      scoreDelta: -5,
      attackerSees: 'Victim typing personal info into smishing portal',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fireEvent('FORM_SUBMITTED', {
      label: 'Personal data submitted to smishing portal',
      riskDelta: 30,
      scoreDelta: -20,
      isBranch: true,
      attackerSees: 'SMISHING SUCCESS — PII package received',
      exposedData: ['Full name (simulated)', 'Home address (simulated)', 'Phone number (simulated)'],
      nextState: 'CREDENTIAL_CAPTURED',
    });
    toast.error('Personal information submitted to attacker portal!');
    if (onSubmit) onSubmit();
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Fake mobile browser bar */}
      <div className="bg-gray-100 border-b border-gray-300 px-3 py-1.5 flex items-center gap-2 text-xs">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        <span className="font-mono text-red-600 flex-1 truncate text-[11px]">{url}</span>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-[10px] border border-gray-300 px-1.5 py-0.5 rounded">✕ Close</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center gap-5">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
              style={{ background: logoColor }}
            >
              <span className="text-white font-bold text-lg">{logoText.charAt(0)}</span>
            </div>
            <h2 className="font-bold text-lg text-gray-900">{logoText}</h2>
            <p className="text-gray-500 text-xs mt-1">Confirm your delivery details</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text" value={name}
                onChange={e => { setName(e.target.value); handleInput(); }}
                onFocus={() => handleFocus('Full Name')}
                placeholder="Your full name"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
              <input
                type="text" value={address}
                onChange={e => { setAddress(e.target.value); handleInput(); }}
                onFocus={() => handleFocus('Delivery Address')}
                placeholder="123 Main St"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel" value={phone}
                onChange={e => { setPhone(e.target.value); handleInput(); }}
                onFocus={() => handleFocus('Phone')}
                placeholder="+1 555-0000"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-bold text-white text-sm transition hover:opacity-90"
              style={{ background: logoColor }}
            >
              Confirm Delivery
            </button>
          </form>
          <p className="text-[10px] text-gray-400 text-center">SIMULATION — NO REAL DATA COLLECTED</p>
        </div>
      </div>
    </div>
  );
}

export function SmsClient({
  messages,
  senderName,
  senderNumber,
  senderType,
  portalUrl,
  portalLogo,
  portalColor,
  onLinkFollowed,
  onDefend,
}: SmsClientProps) {
  const [senderExpanded, setSenderExpanded] = useState(false);
  const [linkPreview, setLinkPreview] = useState<string | null>(null);
  const [showPortal, setShowPortal] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reported, setReported] = useState(false);
  const [linkTapped, setLinkTapped] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);
  const { fireEvent } = useSimulationStore();

  const senderTypeLabels: Record<string, { label: string; color: string; risk: string }> = {
    shortcode: { label: 'Short code (5-digit) — typically legitimate services', color: 'text-emerald-400', risk: 'lower' },
    unknown: { label: 'Unknown number — NOT a verified sender', color: 'text-amber-400', risk: 'medium' },
    spoofed: { label: 'Spoofed number — may appear legitimate but is not verified', color: 'text-red-400', risk: 'high' },
  };

  const stInfo = senderTypeLabels[senderType];

  const handleInspectSender = () => {
    if (!senderExpanded) {
      setSenderExpanded(true);
      fireEvent('SENDER_INSPECTED', {
        label: 'Inspected SMS sender number and type',
        riskDelta: -5,
        scoreDelta: 5,
        isInvestigative: true,
        isDefensive: true,
        attackerSees: 'Victim checking sender number identity',
      });
      toast.info('Sender details expanded');
    } else {
      setSenderExpanded(false);
    }
  };

  const handleLinkPreview = (url: string) => {
    if (!linkPreview) {
      setLinkPreview(url);
      fireEvent('LINK_HOVERED', {
        label: 'Tapped to preview link destination',
        riskDelta: 0,
        scoreDelta: 5,
        isInvestigative: true,
        attackerSees: 'Victim previewing link — may be cautious',
      });
      toast.info('Link preview shown — inspect URL before tapping');
    } else {
      setLinkPreview(null);
    }
  };

  const handleLinkTap = (link: { displayText: string; realUrl: string; safe: boolean }) => {
    if (linkTapped) return;
    setLinkTapped(true);
    fireEvent('LINK_OPENED', {
      label: `Tapped SMS link → ${link.realUrl}`,
      riskDelta: link.safe ? 0 : 20,
      scoreDelta: link.safe ? 2 : -10,
      isBranch: true,
      attackerSees: link.safe ? 'Victim opened safe URL' : `Victim followed smishing link: ${link.realUrl}`,
      exposedData: link.safe ? [] : ['Tap event', 'Simulated device ID', 'Simulated IP'],
      nextState: link.safe ? undefined : 'LINK_CLICKED',
    });
    if (!link.safe && portalUrl) {
      setShowPortal(true);
      fireEvent('FORM_OPENED', {
        label: 'Smishing portal opened',
        riskDelta: 5,
        scoreDelta: -5,
        attackerSees: 'Victim reached smishing credential portal',
      });
    }
    toast[link.safe ? 'success' : 'warning'](link.safe ? 'Safe link opened' : 'Navigating to suspicious site…');
  };

  const handleReport = () => {
    if (reported) return;
    setReported(true);
    fireEvent('REPORT_FILED', {
      label: 'SMS reported as spam/smishing',
      riskDelta: -20,
      scoreDelta: 20,
      isDefensive: true,
      isBranch: true,
      attackerSees: 'Victim reported smishing SMS — campaign flagged',
      nextState: 'DEFENDED',
    });
    toast.success('SMS reported as suspicious!');
    if (onDefend) onDefend();
  };

  const handleBlock = () => {
    if (blocked) return;
    setBlocked(true);
    fireEvent('BLOCK_APPLIED', {
      label: 'Sender blocked',
      riskDelta: -15,
      scoreDelta: 15,
      isDefensive: true,
      isBranch: true,
      attackerSees: 'Victim blocked sender — attack channel closed',
    });
    toast.success('Sender blocked!');
  };

  const handleReply = () => {
    if (!replyText.trim() || replySent) return;
    setReplySent(true);
    fireEvent('MESSAGE_REPLIED', {
      label: 'Replied to smishing SMS',
      riskDelta: 10,
      scoreDelta: -5,
      attackerSees: 'Victim replied — phone number confirmed active',
      exposedData: ['Phone number confirmed active (simulated)'],
    });
    setReplyText('');
    setReplying(false);
    toast.warning('Caution: replying confirms your number is active to the sender');
  };

  if (showPortal) {
    return (
      <SmsPortal
        url={portalUrl || 'http://delivery-confirm.track-packages.test/confirm'}
        logoText={portalLogo}
        logoColor={portalColor}
        onSubmit={onLinkFollowed}
        onBack={() => setShowPortal(false)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 rounded-xl overflow-hidden border border-slate-800">
      {/* Phone chrome header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
          <Phone className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={handleInspectSender}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-cyan-400 transition"
          >
            {senderName}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${senderExpanded ? 'rotate-180' : ''}`} />
          </button>
          <div className="text-[11px] text-slate-500 font-mono">{senderNumber}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBlock}
            disabled={blocked}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition ${
              blocked ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Ban className="w-3 h-3" />
            {blocked ? 'Blocked' : 'Block'}
          </button>
          <button
            onClick={handleReport}
            disabled={reported}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition ${
              reported ? 'bg-green-900/40 border-green-800/40 text-green-400' : 'bg-rose-900/30 border-rose-800/40 text-rose-400 hover:bg-rose-900/60'
            }`}
          >
            <Flag className="w-3 h-3" />
            {reported ? 'Reported ✓' : 'Report'}
          </button>
        </div>
      </div>

      {/* Sender expanded details */}
      {senderExpanded && (
        <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-3 space-y-2 text-xs font-mono">
          <div className="text-cyan-400 font-bold text-[11px] uppercase flex items-center gap-1.5">
            <Info className="w-3 h-3" /> Sender Analysis
          </div>
          <div className="flex gap-3">
            <span className="text-slate-400 w-24 flex-shrink-0">Number:</span>
            <span className="text-slate-200">{senderNumber}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-400 w-24 flex-shrink-0">Type:</span>
            <span className={stInfo.color}>{senderType.toUpperCase()}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-400 w-24 flex-shrink-0">Assessment:</span>
            <span className="text-slate-300">{stInfo.label}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-[10px] ${senderType === 'shortcode' ? 'text-emerald-400' : 'text-red-400'}`}>
            {senderType === 'shortcode' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            Risk: {stInfo.risk.toUpperCase()}
          </div>
        </div>
      )}

      {/* Messages thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isAttacker ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm space-y-2 ${
                msg.isAttacker
                  ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                  : 'bg-cyan-700 text-white rounded-tr-sm'
              }`}
            >
              <div className="leading-relaxed">{msg.text}</div>

              {/* Inline link card */}
              {msg.link && (
                <div className="bg-slate-700/60 border border-slate-600/60 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-slate-300 font-medium">{msg.link.displayText}</div>
                    {!msg.link.safe && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  </div>
                  {/* Preview toggle */}
                  <button
                    onClick={() => handleLinkPreview(msg.link!.realUrl)}
                    className="flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {linkPreview === msg.link.realUrl ? 'Hide URL preview' : 'Preview URL before opening'}
                  </button>
                  {linkPreview === msg.link.realUrl && (
                    <div className={`text-[11px] font-mono px-2 py-1.5 rounded border ${
                      msg.link.safe ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300' : 'bg-red-950/40 border-red-800/40 text-red-300'
                    }`}>
                      <span className="text-slate-500">→ </span>{msg.link.realUrl}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLinkTap(msg.link!)}
                      disabled={linkTapped}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                        linkTapped
                          ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          : msg.link.safe
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {linkTapped ? 'Link opened' : 'Open Link'}
                    </button>
                    {!msg.link.safe && (
                      <button
                        onClick={handleReport}
                        disabled={reported}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-800/60 hover:bg-rose-700 text-rose-300 text-[11px] transition"
                      >
                        <Shield className="w-3 h-3" />
                        Report
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-500 text-right">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply area */}
      <div className="border-t border-slate-800 bg-slate-900 px-3 py-2">
        {replying ? (
          <div className="flex gap-2">
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onFocus={() => fireEvent('FORM_FIELD_FOCUSED', { label: 'Started typing SMS reply', riskDelta: 3, scoreDelta: -2 })}
              placeholder="Type a reply…"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button onClick={handleReply} className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition">Send</button>
            <button onClick={() => setReplying(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReplying(true);
                fireEvent('MESSAGE_REPLIED', { label: 'Opened SMS reply field', riskDelta: 5, scoreDelta: -3, attackerSees: 'Victim considering replying to smishing message' });
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <MessageSquare className="w-4 h-4" />
              Reply
            </button>
            <span className="text-slate-700 text-xs">·</span>
            <button onClick={handleBlock} disabled={blocked} className="text-xs text-slate-400 hover:text-red-400 transition flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" /> Block
            </button>
            <span className="text-slate-700 text-xs">·</span>
            <button onClick={handleReport} disabled={reported} className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" /> Report Spam
            </button>
            <div className="ml-auto text-[10px] text-slate-600 italic">SIMULATION — NO REAL DATA</div>
          </div>
        )}
      </div>
    </div>
  );
}
