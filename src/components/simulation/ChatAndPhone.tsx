// SE-LAB — Chat & Phone Environments

import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, PhoneOff, AlertTriangle, Flag, User, CheckCircle, Shield } from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

// =============================================
// CORPORATE CHAT (Slack/Teams-style)
// =============================================

interface ChatMessage {
  id: string;
  sender: string;
  senderRole?: string;
  avatar?: string;
  text: string;
  time: string;
  isAttacker?: boolean;
}

interface ChatOption {
  id: string;
  label: string;
  riskDelta: number;
  scoreDelta: number;
  isDefensive?: boolean;
  isBranch?: boolean;
  attackerSees?: string;
  exposedData?: string[];
  nextMessage?: ChatMessage;
  feedback?: string;
}

interface CorporateChatProps {
  channelName?: string;
  initialMessages: ChatMessage[];
  responseOptions: ChatOption[];
  onDefend?: () => void;
}

export function CorporateChat({ channelName = 'direct-message', initialMessages, responseOptions, onDefend }: CorporateChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [reported, setReported] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { fireEvent } = useSimulationStore();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleOption = (opt: ChatOption) => {
    if (selectedOption) return;
    setSelectedOption(opt.id);

    fireEvent('MESSAGE_REPLIED', {
      label: opt.label,
      riskDelta: opt.riskDelta,
      scoreDelta: opt.scoreDelta,
      isDefensive: opt.isDefensive,
      isBranch: opt.isBranch,
      attackerSees: opt.attackerSees,
      exposedData: opt.exposedData,
    });

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: opt.label,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    if (opt.feedback) setFeedback(opt.feedback);
    if (opt.isDefensive && onDefend) setTimeout(onDefend, 800);

    if (opt.nextMessage) {
      setTimeout(() => {
        setMessages(prev => [...prev, opt.nextMessage!]);
      }, 1200);
    }
  };

  const handleReport = () => {
    if (reported) return;
    setReported(true);
    fireEvent('REPORT_FILED', {
      label: 'Reported suspicious chat message',
      riskDelta: -20,
      scoreDelta: 15,
      isDefensive: true,
      isBranch: true,
      attackerSees: 'Campaign detected — account reported to security',
    });
    toast.success('Message reported to security team!');
    if (onDefend) onDefend();
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1d21] text-slate-200 text-sm rounded-xl overflow-hidden border border-slate-800">
      {/* Channel header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#19191c] border-b border-slate-800/60">
        <div className="text-slate-500 text-sm">#</div>
        <span className="font-bold text-slate-100">{channelName}</span>
        <div className="flex-1" />
        <button
          onClick={handleReport}
          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded transition ${reported ? 'bg-green-900/50 text-green-400' : 'bg-rose-900/30 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40'}`}
        >
          <Flag className="w-3 h-3" />
          {reported ? 'Reported ✓' : 'Report'}
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${!msg.isAttacker && msg.sender !== 'You' ? '' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
              msg.sender === 'You' ? 'bg-blue-700' : msg.isAttacker ? 'bg-purple-700' : 'bg-slate-700'
            }`}>
              {msg.avatar || msg.sender.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <button
                  onClick={() => setShowProfile(v => !v)}
                  className={`font-bold text-xs hover:underline ${msg.isAttacker ? 'text-purple-400' : msg.sender === 'You' ? 'text-blue-400' : 'text-slate-200'}`}
                >
                  {msg.sender}
                </button>
                {msg.senderRole && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{msg.senderRole}</span>
                )}
                <span className="text-[10px] text-slate-500">{msg.time}</span>
              </div>
              <div className={`text-[13px] leading-relaxed mt-0.5 ${msg.isAttacker ? 'text-slate-100' : 'text-slate-300'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Profile card on click */}
        {showProfile && messages.length > 0 && messages[0].isAttacker && (
          <div className="bg-[#2a2d31] border border-slate-700 rounded-lg p-3 text-xs space-y-1 ml-11">
            <div className="font-bold text-slate-100 mb-1.5 flex items-center gap-2">
              <User className="w-3 h-3" />
              Profile Details
              {fireEvent && (
                <button
                  onClick={() => {
                    fireEvent('SENDER_INSPECTED', {
                      label: 'Inspected sender profile',
                      riskDelta: -5,
                      scoreDelta: 5,
                      isInvestigative: true,
                      attackerSees: 'Victim inspecting sender profile (suspicious)',
                    });
                  }}
                  className="ml-auto text-[10px] text-cyan-400 hover:underline"
                >
                  Investigate
                </button>
              )}
            </div>
            <div className="text-slate-400">Account created: <span className="text-amber-400">2 days ago</span></div>
            <div className="text-slate-400">Verified employee: <span className="text-red-400">Not verified ⚠</span></div>
            <div className="text-slate-400">Email: <span className="text-red-300">{messages[0].sender.toLowerCase()}@external-domain.test</span></div>
            <div className="text-amber-400 text-[10px] mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              External account impersonating internal user
            </div>
          </div>
        )}
      </div>

      {/* Response options */}
      {!selectedOption && (
        <div className="border-t border-slate-800 bg-[#19191c] p-3">
          <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Choose your response:</div>
          <div className="space-y-1.5">
            {responseOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOption(opt)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition border ${
                  opt.isDefensive
                    ? 'bg-emerald-950/40 border-emerald-800/40 hover:bg-emerald-950/70 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {opt.isDefensive && <Shield className="w-3 h-3 inline mr-1.5 text-emerald-400" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback after response */}
      {feedback && (
        <div className="border-t border-slate-800 bg-slate-900 p-3 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-300">{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// PHONE CALL (Vishing)
// =============================================

interface DialogueNode {
  id: string;
  attackerText: string;
  options: {
    id: string;
    label: string;
    riskDelta: number;
    scoreDelta: number;
    isDefensive?: boolean;
    attackerSees?: string;
    exposedData?: string[];
    nextNodeId?: string;
    endCall?: boolean;
  }[];
}

interface PhoneCallProps {
  callerName: string;
  callerNumber: string;
  dialogueTree: DialogueNode[];
  onCallEnd?: () => void;
}

export function PhoneCall({ callerName, callerNumber, dialogueTree, onCallEnd }: PhoneCallProps) {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [currentNodeId, setCurrentNodeId] = useState<string>(dialogueTree[0]?.id);
  const [history, setHistory] = useState<{ speaker: 'attacker' | 'you'; text: string }[]>([]);
  const [duration, setDuration] = useState(0);
  const [reported, setReported] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { fireEvent } = useSimulationStore();

  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      const node = dialogueTree.find(n => n.id === currentNodeId);
      if (node) setHistory([{ speaker: 'attacker', text: node.attackerText }]);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleAnswer = () => {
    setCallState('connected');
    fireEvent('CALL_STARTED', { label: 'Answered vishing call', riskDelta: 5, scoreDelta: 0, attackerSees: 'Victim answered the call' });
  };

  const handleDecline = () => {
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    fireEvent('CALL_ENDED', { label: 'Declined call', riskDelta: -10, scoreDelta: 10, isDefensive: true, isBranch: true, attackerSees: 'Target declined call — initial attempt failed' });
    toast.info('Call declined. Good instinct if suspicious.');
    if (onCallEnd) onCallEnd();
  };

  const handleHangUp = () => {
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    fireEvent('CALL_ENDED', { label: 'Ended call', riskDelta: 0, scoreDelta: 5, isDefensive: true, attackerSees: 'Target ended the call' });
    toast.info('Call ended.');
    if (onCallEnd) onCallEnd();
  };

  const handleReport = () => {
    if (!reported) {
      setReported(true);
      fireEvent('REPORT_FILED', { label: 'Reported vishing call', riskDelta: -15, scoreDelta: 15, isDefensive: true, isBranch: true, attackerSees: 'Call reported to security team' });
      toast.success('Call reported to security!');
    }
  };

  const handleOption = (opt: (typeof dialogueTree)[0]['options'][0]) => {
    const node = dialogueTree.find(n => n.id === currentNodeId);
    if (!node) return;

    setHistory(prev => [...prev, { speaker: 'you', text: opt.label }]);

    fireEvent('MESSAGE_REPLIED', {
      label: opt.label,
      riskDelta: opt.riskDelta,
      scoreDelta: opt.scoreDelta,
      isDefensive: opt.isDefensive,
      isBranch: true,
      attackerSees: opt.attackerSees,
      exposedData: opt.exposedData,
    });

    if (opt.endCall) {
      setTimeout(() => handleHangUp(), 500);
      return;
    }

    if (opt.nextNodeId) {
      const next = dialogueTree.find(n => n.id === opt.nextNodeId);
      if (next) {
        setTimeout(() => {
          setHistory(prev => [...prev, { speaker: 'attacker', text: next.attackerText }]);
          setCurrentNodeId(opt.nextNodeId!);
        }, 1000);
      }
    }
  };

  const currentNode = dialogueTree.find(n => n.id === currentNodeId);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white rounded-xl overflow-hidden border border-slate-800">
      {/* Phone header */}
      <div className="bg-gray-800 p-4 text-center">
        <div className="text-slate-400 text-xs mb-1">
          {callState === 'ringing' ? '📱 Incoming Call' : callState === 'connected' ? `● Connected — ${fmt(duration)}` : '📵 Call Ended'}
        </div>
        <div className="text-white font-bold text-lg">{callerName}</div>
        <div className="text-slate-400 text-sm font-mono">{callerNumber}</div>
        {callState === 'connected' && (
          <div className="mt-1 text-[10px] text-amber-400 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Verify caller identity through official channels
          </div>
        )}
      </div>

      {/* Call log / dialogue */}
      {callState === 'connected' && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
          {history.map((h, i) => (
            <div key={i} className={`flex gap-2 ${h.speaker === 'you' ? 'flex-row-reverse' : ''}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${h.speaker === 'attacker' ? 'bg-gray-800 text-gray-100 rounded-tl-none' : 'bg-blue-700 text-white rounded-tr-none'}`}>
                {h.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {callState === 'ringing' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto flex items-center justify-center text-3xl animate-pulse">📱</div>
            <div className="text-slate-400 text-sm">Incoming vishing call...</div>
          </div>
        </div>
      )}

      {callState === 'ended' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-slate-400 text-sm">Call ended</div>
            <div className="text-xs text-slate-500">Duration: {fmt(duration)}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      {callState === 'ringing' && (
        <div className="p-5 flex justify-center gap-8 bg-gray-900">
          <button onClick={handleDecline} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg transition">
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
          <button onClick={handleAnswer} className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center shadow-lg transition">
            <Phone className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {callState === 'connected' && (
        <div className="p-3 bg-gray-900 border-t border-slate-800 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Response options:</div>
            <div className="flex gap-2">
              <button onClick={handleReport} className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 transition ${reported ? 'bg-green-900/50 text-green-400' : 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50'}`}>
                <Flag className="w-3 h-3" />
                {reported ? 'Reported' : 'Report Call'}
              </button>
              <button onClick={handleHangUp} className="w-10 h-10 rounded-full bg-red-700 hover:bg-red-600 flex items-center justify-center">
                <PhoneOff className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {currentNode?.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOption(opt)}
                className={`w-full text-left px-3 py-2 rounded text-[12px] transition border ${
                  opt.isDefensive
                    ? 'bg-emerald-950/40 border-emerald-800/50 hover:bg-emerald-950/70 text-emerald-300'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// MFA Fatigue Environment
// =============================================

interface MFAFatigueProps {
  appName?: string;
  onApprove?: () => void;
  onDeny?: () => void;
  onReport?: () => void;
}

export function MFAFatigue({ appName = 'Northstar Workspace', onApprove, onDeny, onReport }: MFAFatigueProps) {
  const [count, setCount] = useState(0);
  const [approved, setApproved] = useState(false);
  const [denied, setDenied] = useState(false);
  const [reported, setReported] = useState(false);
  const { fireEvent } = useSimulationStore();

  const handleApprove = () => {
    setCount(c => c + 1);
    if (!approved) {
      setApproved(true);
      fireEvent('MFA_APPROVED', {
        label: `MFA push approved (attempt ${count + 1})`,
        riskDelta: 30,
        scoreDelta: -20,
        isBranch: true,
        attackerSees: `MFA APPROVED — Attacker now has access to ${appName}`,
        exposedData: ['MFA session token (simulated)', 'Account access granted'],
      });
      toast.error('MFA approved! Attacker now has access.');
      if (onApprove) onApprove();
    }
  };

  const handleDeny = () => {
    const n = count + 1;
    setCount(n);
    fireEvent('MFA_DENIED', {
      label: `Denied MFA push attempt ${n}`,
      riskDelta: -5,
      scoreDelta: 5,
      isDefensive: true,
      attackerSees: `Attempt ${n} denied — sending another push`,
    });
    toast.info(`Denied push #${n}. Attacker sending another...`);
    if (onDeny) onDeny();
  };

  const handleReport = () => {
    setReported(true);
    fireEvent('MFA_REPORTED', {
      label: 'Reported suspicious MFA activity',
      riskDelta: -20,
      scoreDelta: 20,
      isDefensive: true,
      isBranch: true,
      attackerSees: 'Target reported suspicious MFA — account flagged',
    });
    toast.success('Suspicious MFA activity reported!');
    if (onReport) onReport();
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xs">
          {/* Mock phone notification */}
          <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            {/* Notification header */}
            <div className="bg-slate-700 px-4 py-2 flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">N</span>
              </div>
              <span className="text-white text-xs font-semibold">{appName}</span>
              <span className="text-slate-400 text-[10px] ml-auto">now</span>
            </div>
            {/* Push notification body */}
            <div className="px-4 py-4 text-center space-y-3">
              <div className="text-white font-bold text-sm">Sign-in Request</div>
              <div className="text-slate-300 text-xs leading-relaxed">
                Someone is trying to sign in to your account.
                {count > 0 && <span className="block mt-1 text-amber-400 font-semibold">Attempt #{count + 1} — You've denied {count} already!</span>}
              </div>
              <div className="text-slate-400 text-[10px] space-y-0.5">
                <div>Location: Simulation Region (synthetic)</div>
                <div>IP: 203.0.113.42 (documentation range)</div>
                <div>Device: Desktop Browser (simulated)</div>
              </div>
              {count >= 2 && !reported && (
                <div className="bg-amber-950/50 border border-amber-800/50 rounded px-2 py-1.5 text-amber-300 text-[11px]">
                  ⚠ Multiple requests — this may be an attack. Consider reporting.
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!approved && !reported && (
              <div className="flex border-t border-slate-700 divide-x divide-slate-700">
                <button
                  onClick={handleDeny}
                  className="flex-1 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition text-center"
                >
                  Deny
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 py-3 text-sm font-bold text-blue-400 hover:bg-slate-700 transition text-center"
                >
                  Approve
                </button>
              </div>
            )}

            {approved && (
              <div className="bg-red-900/40 py-3 text-center text-red-300 text-sm font-bold">
                ✗ Access Granted — Attacker Logged In
              </div>
            )}
            {reported && (
              <div className="bg-green-900/40 py-3 text-center text-green-300 text-sm font-bold">
                ✓ Reported — Security Team Notified
              </div>
            )}
          </div>

          {/* Report button below phone */}
          {!approved && !reported && (
            <button
              onClick={handleReport}
              className="mt-4 w-full py-2.5 rounded-lg border border-rose-800/50 bg-rose-950/30 text-rose-300 text-sm font-semibold hover:bg-rose-950/60 transition flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4" />
              Report This Activity
            </button>
          )}

          {/* Counter and info */}
          <div className="mt-3 text-center text-[11px] text-slate-500">
            Push notifications received: <span className="text-amber-400 font-bold">{count + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
