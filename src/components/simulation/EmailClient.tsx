// ============================================================
// SE-LAB — Email Client Environment Component
// Fully interactive simulated email client for phishing sims
// ============================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Flag, Trash2, Reply, Forward, Eye, ExternalLink, Paperclip, AlertTriangle, CheckCircle, Info, Mail, Search, Star } from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

interface EmailMessage {
  from: string;
  fromAddress: string;
  replyTo?: string;
  subject: string;
  timestamp: string;
  body: string;
  spfStatus: 'pass' | 'fail' | 'none';
  dkimStatus: 'pass' | 'fail' | 'none';
  links?: { text: string; destination: string; safe: boolean }[];
  attachments?: { name: string; size: string; safe: boolean }[];
  unread?: boolean;
}

interface PhishingPortalProps {
  url: string;
  logoText?: string;
  logoColor?: string;
  onSubmit?: (user: string, pass: string) => void;
}

function PhishingPortal({ url, logoText = 'Secure Portal', logoColor = '#1a73e8', onSubmit }: PhishingPortalProps) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const { fireEvent } = useSimulationStore();

  const handleFocus = (field: string) => {
    fireEvent('FORM_FIELD_FOCUSED', {
      label: `Focused on ${field} field`,
      riskDelta: 5,
      scoreDelta: -3,
    });
  };

  const handleChange = () => {
    fireEvent('SYNTHETIC_DATA_ENTERED', {
      label: 'Typing credentials into phishing form',
      riskDelta: 15,
      scoreDelta: -8,
      attackerSees: 'Victim entering credentials into phishing form',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fireEvent('FORM_SUBMITTED', {
      label: 'Form submitted — synthetic credentials captured',
      riskDelta: 30,
      scoreDelta: -20,
      attackerSees: 'CREDENTIAL SUBMISSION — synthetic username + password received',
      exposedData: ['Synthetic username', 'Synthetic password', 'Browser fingerprint (simulated)'],
      nextState: 'CREDENTIAL_CAPTURED',
      isBranch: true,
    });
    fireEvent('CREDENTIAL_EXPOSED', {
      label: 'Synthetic credentials transmitted to attacker',
      riskDelta: 0,
      scoreDelta: -5,
      attackerSees: 'Credentials logged in attacker database',
      exposedData: ['Synthetic session token', 'Simulated device fingerprint'],
    });
    if (onSubmit) onSubmit(user, pass);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 text-slate-900">
      {/* Fake address bar */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2 text-xs">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        <span className="font-mono text-red-600 flex-1 truncate font-semibold">{url}</span>
        <span className="text-red-500 text-[10px] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-bold">Not Secure</span>
      </div>
      {/* Portal body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 shadow-sm"
              style={{ background: logoColor }}>
              <span className="text-white font-bold text-lg">{logoText.charAt(0)}</span>
            </div>
            <h2 className="text-slate-900 font-bold text-lg">{logoText}</h2>
            <p className="text-slate-500 text-xs mt-1">Sign in to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email or Username</label>
              <input
                type="text"
                value={user}
                onChange={e => { setUser(e.target.value); handleChange(); }}
                onFocus={() => handleFocus('email')}
                placeholder="you@company.test"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={pass}
                onChange={e => { setPass(e.target.value); handleChange(); }}
                onFocus={() => handleFocus('password')}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-bold text-white text-sm transition hover:opacity-90 shadow-sm"
              style={{ background: logoColor }}
            >
              Sign In
            </button>
          </form>
          <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Simulated environment — No real credentials stored
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmailClientProps {
  email: EmailMessage;
  inboxItems?: { from: string; subject: string; time: string; unread?: boolean }[];
  portalUrl?: string;
  portalLogo?: string;
  portalColor?: string;
  onPortalSubmit?: () => void;
  onDefend?: () => void;
  simulationId: string;
}

export function EmailClient({
  email,
  inboxItems = [],
  portalUrl,
  portalLogo,
  portalColor,
  onPortalSubmit,
  onDefend,
}: EmailClientProps) {
  const [openEmail, setOpenEmail] = useState(false);
  const [showSender, setShowSender] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [showPortal, setShowPortal] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const { fireEvent } = useSimulationStore();

  const handleOpenEmail = () => {
    if (!openEmail) {
      setOpenEmail(true);
      fireEvent('MESSAGE_OPENED', {
        label: 'Opened suspicious email',
        riskDelta: 5,
        scoreDelta: 0,
        attackerSees: 'Victim opened the phishing email',
      });
    }
  };

  const handleInspectSender = () => {
    setShowSender(v => !v);
    if (!showSender) {
      fireEvent('SENDER_INSPECTED', {
        label: 'Inspected sender details',
        riskDelta: -5,
        scoreDelta: 5,
        isInvestigative: true,
        isDefensive: true,
        attackerSees: 'Victim is checking sender identity (on guard)',
      });
      toast.info('Sender details expanded');
    }
  };

  const handleViewHeaders = () => {
    setShowHeaders(v => !v);
    if (!showHeaders) {
      fireEvent('HEADER_VIEWED', {
        label: 'Viewed full message headers',
        riskDelta: -5,
        scoreDelta: 5,
        isInvestigative: true,
        attackerSees: 'Victim is examining email headers (security-aware behavior)',
      });
      toast.info('Message headers inspected');
    }
  };

  const handleLinkHover = (dest: string) => {
    setHoveredLink(dest);
    fireEvent('LINK_HOVERED', {
      label: 'Hovered over suspicious link',
      riskDelta: 0,
      scoreDelta: 3,
      isInvestigative: true,
      attackerSees: 'Victim hovering over phishing link',
    });
  };

  const handleLinkClick = (link: { text: string; destination: string; safe: boolean }) => {
    if (!link.safe) {
      fireEvent('LINK_OPENED', {
        label: `Clicked suspicious link → ${link.destination}`,
        riskDelta: 20,
        scoreDelta: -10,
        isBranch: true,
        attackerSees: `Victim navigated to attacker domain: ${link.destination}`,
        exposedData: ['Click event', 'Simulated IP (203.0.113.42)', 'Browser/OS (simulated)'],
        nextState: 'LINK_CLICKED',
      });
      if (portalUrl) {
        setShowPortal(true);
        fireEvent('FORM_OPENED', {
          label: 'Phishing portal loaded',
          riskDelta: 5,
          scoreDelta: -5,
          attackerSees: 'Victim reached credential harvesting portal',
        });
      }
      toast.warning('Navigating to suspicious page...');
    } else {
      fireEvent('URL_INSPECTED', { label: 'Inspected safe link', riskDelta: 0, scoreDelta: 2, isInvestigative: true });
      toast.success('Safe link — verified destination');
    }
  };

  const handleReport = () => {
    if (!reportDone) {
      setReportDone(true);
      fireEvent('REPORT_FILED', {
        label: 'Email reported to security team',
        riskDelta: -20,
        scoreDelta: 20,
        isDefensive: true,
        isBranch: true,
        attackerSees: 'Campaign reported — account flagged as security-aware',
        nextState: 'DEFENDED',
      });
      toast.success('Phishing email reported! Security team notified.');
      if (onDefend) onDefend();
    }
  };

  const allInbox = [
    { from: email.from, subject: email.subject, time: email.timestamp, unread: true },
    ...inboxItems,
  ];

  if (showPortal) {
    return (
      <PhishingPortal
        url={portalUrl || 'http://secure-login.example-phish.test/auth'}
        logoText={portalLogo}
        logoColor={portalColor}
        onSubmit={onPortalSubmit}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 text-xs font-sans rounded-xl overflow-hidden border border-slate-800">
      {/* Email client chrome */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-3">
        <Mail className="w-4 h-4 text-slate-400" />
        <span className="text-slate-300 font-semibold text-sm">Inbox</span>
        <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-1 gap-1.5">
          <Search className="w-3 h-3 text-slate-500" />
          <input className="bg-transparent outline-none text-xs text-slate-400 flex-1" placeholder="Search mail…" readOnly />
        </div>
        <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-[10px] font-bold">U</div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-28 bg-slate-900 border-r border-slate-800 flex-shrink-0 p-2 space-y-1">
          {['Inbox','Starred','Sent','Drafts','Spam','Trash'].map((f, i) => (
            <button key={f} className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center gap-1.5 ${i === 0 ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:bg-slate-800'}`}>
              {f === 'Inbox' && <Mail className="w-3 h-3" />}
              {f === 'Starred' && <Star className="w-3 h-3" />}
              {f}
              {f === 'Inbox' && <span className="ml-auto text-[9px] bg-red-500 text-white rounded-full px-1">1</span>}
            </button>
          ))}
        </div>

        {/* Message list */}
        {!openEmail ? (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {allInbox.map((item, i) => (
              <button
                key={i}
                onClick={i === 0 ? handleOpenEmail : undefined}
                className={`w-full text-left px-4 py-3 hover:bg-slate-800/50 transition flex items-start gap-3 ${item.unread ? 'bg-slate-900/80' : ''}`}
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                  {item.from.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`${item.unread ? 'font-bold text-white' : 'text-slate-300'} text-[12px] truncate`}>{item.from}</span>
                    <span className="text-slate-500 text-[10px] flex-shrink-0 ml-2">{item.time}</span>
                  </div>
                  <div className={`${item.unread ? 'text-slate-200' : 'text-slate-400'} text-[11px] truncate mt-0.5`}>{item.subject}</div>
                </div>
                {item.unread && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
              </button>
            ))}
          </div>
        ) : (
          /* Reading pane */
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
              <button onClick={() => setOpenEmail(false)} className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition text-[11px]">
                ← Back
              </button>
              <div className="flex-1" />
              <button onClick={() => { fireEvent('MESSAGE_REPLIED', { label: 'Replied to suspicious email', riskDelta: 10, scoreDelta: -5, attackerSees: 'Victim replied to phishing email — address confirmed active' }); toast.warning('Caution: replying confirms your email is active'); }} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                <Reply className="w-3 h-3" /><span className="text-[10px]">Reply</span>
              </button>
              <button onClick={() => { fireEvent('MESSAGE_REPLIED', { label: 'Forwarded suspicious email', riskDelta: 5, scoreDelta: -3 }); }} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                <Forward className="w-3 h-3" /><span className="text-[10px]">Forward</span>
              </button>
              <button
                onClick={handleReport}
                disabled={reportDone}
                className={`flex items-center gap-1 px-2 py-1 rounded transition text-[10px] ${reportDone ? 'bg-green-900 text-green-400' : 'bg-rose-900/50 hover:bg-rose-800 text-rose-300'}`}
              >
                <Flag className="w-3 h-3" />
                {reportDone ? 'Reported ✓' : 'Report Phishing'}
              </button>
              <button onClick={() => { fireEvent('DEFENSE_ACTION', { label: 'Email deleted', riskDelta: -5, scoreDelta: 5, isDefensive: true }); setOpenEmail(false); toast.info('Email deleted'); }} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                <Trash2 className="w-3 h-3" /><span className="text-[10px]">Delete</span>
              </button>
            </div>

            {/* Message */}
            <div className="flex-1 p-4 space-y-4">
              <h2 className="text-base font-bold text-white leading-tight">{email.subject}</h2>

              {/* Sender chip */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {email.from.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleInspectSender}
                      className="flex items-center gap-1 font-semibold text-slate-200 hover:text-cyberPrimary transition text-sm"
                    >
                      {email.from}
                      {showSender ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    {showSender && (
                      <span className="text-[10px] bg-red-900/40 border border-red-700/40 text-red-300 px-2 py-0.5 rounded font-mono">
                        {email.fromAddress}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{email.timestamp}</div>
                </div>
              </div>

              {/* Sender details expanded */}
              {showSender && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
                  <div className="text-cyan-400 font-bold mb-1">Email Header Analysis</div>
                  <div className="flex gap-2"><span className="text-slate-400 w-20 flex-shrink-0">From:</span><span className="text-slate-200">{email.from}</span></div>
                  <div className="flex gap-2"><span className="text-slate-400 w-20 flex-shrink-0">Address:</span><span className="text-red-300">{email.fromAddress}</span></div>
                  {email.replyTo && <div className="flex gap-2"><span className="text-slate-400 w-20 flex-shrink-0">Reply-To:</span><span className="text-amber-300">{email.replyTo}</span></div>}
                  <div className="flex gap-2"><span className="text-slate-400 w-20 flex-shrink-0">SPF:</span>
                    <span className={email.spfStatus === 'pass' ? 'text-green-400' : 'text-red-400 font-bold'}>
                      {email.spfStatus.toUpperCase()} {email.spfStatus !== 'pass' && '⚠'}
                    </span>
                  </div>
                  <div className="flex gap-2"><span className="text-slate-400 w-20 flex-shrink-0">DKIM:</span>
                    <span className={email.dkimStatus === 'pass' ? 'text-green-400' : 'text-red-400 font-bold'}>
                      {email.dkimStatus.toUpperCase()} {email.dkimStatus !== 'pass' && '⚠'}
                    </span>
                  </div>
                  <button
                    onClick={handleViewHeaders}
                    className="mt-2 text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    {showHeaders ? 'Hide' : 'View'} Full Headers
                  </button>
                  {showHeaders && (
                    <div className="mt-2 bg-slate-950 border border-slate-800 rounded p-2 text-[10px] text-slate-400 leading-relaxed">
                      <div>Received: from mail.suspicious-domain.test</div>
                      <div>X-Originating-IP: 198.51.100.42 (documentation range)</div>
                      <div>Authentication-Results: spf={email.spfStatus}; dkim={email.dkimStatus}</div>
                      <div>DMARC: fail (policy=reject)</div>
                    </div>
                  )}
                </div>
              )}

              {/* Email body */}
              <div className="text-sm text-slate-200 leading-relaxed space-y-3 bg-slate-900 rounded-lg p-4 border border-slate-800">
                <div dangerouslySetInnerHTML={{ __html: email.body }} />
              </div>

              {/* Links */}
              {email.links && email.links.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Links in this message:</div>
                  {email.links.map((link, i) => (
                    <div key={i} className="relative">
                      <button
                        onMouseEnter={() => handleLinkHover(link.destination)}
                        onMouseLeave={() => setHoveredLink(null)}
                        onClick={() => handleLinkClick(link)}
                        className={`flex items-center gap-2 px-3 py-2 rounded border text-[12px] transition w-full text-left ${
                          link.safe
                            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/50'
                            : 'bg-amber-950/30 border-amber-800/50 text-amber-300 hover:bg-amber-950/50'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="flex-1 truncate">{link.text}</span>
                        {!link.safe && <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        {link.safe && <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                      </button>
                      {hoveredLink === link.destination && (
                        <div className="absolute bottom-full left-0 mb-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-[11px] font-mono text-slate-300 z-20 shadow-lg max-w-full">
                          <span className="text-slate-500 mr-1">→</span>
                          <span className={link.safe ? 'text-emerald-300' : 'text-red-300'}>{link.destination}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments */}
              {email.attachments && email.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Attachments:</div>
                  {email.attachments.map((att, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        fireEvent('ATTACHMENT_OPENED', {
                          label: `Opened attachment: ${att.name}`,
                          riskDelta: att.safe ? 0 : 25,
                          scoreDelta: att.safe ? 2 : -15,
                          attackerSees: att.safe ? 'Victim opened safe attachment' : `Victim opened malicious attachment: ${att.name}`,
                          exposedData: att.safe ? [] : ['File execution event', 'Simulated malware beacon'],
                        });
                        toast[att.safe ? 'info' : 'error'](`${att.safe ? 'Opening' : '⚠ Warning:'} ${att.name}`);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded border text-[12px] transition ${
                        att.safe
                          ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                          : 'bg-red-950/30 border-red-800/50 text-red-300 hover:bg-red-950/50'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{att.name}</span>
                      <span className="text-slate-500 text-[10px]">{att.size}</span>
                      {!att.safe && <AlertTriangle className="w-3 h-3 text-red-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Status bar link preview */}
              {hoveredLink && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 py-1.5 text-[11px] font-mono text-slate-400 z-30">
                  <span className="text-slate-500">Status bar: </span>
                  <span className="text-amber-300">{hoveredLink}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
