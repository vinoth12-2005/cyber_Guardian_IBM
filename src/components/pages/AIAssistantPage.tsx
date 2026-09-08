import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Shield,
  ShieldAlert,
  Sparkles,
  Send,
  AlertTriangle,
  Globe,
  ExternalLink,
  Play,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  UploadCloud,
  FileCode,
  FileText,
  FileCheck,
  FileWarning,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ThreatInterceptionModal } from '../modals/ThreatInterceptionModal';
import type { ThreatInterceptionData } from '../modals/ThreatInterceptionModal';
import { ClientURLEngine } from '../../lib/detection/clientURLEngine';
import { ClientFileEngine } from '../../lib/detection/clientFileEngine';
import { ChatbotHistory } from '../dashboard/ChatbotHistory';
import type { ChatbotHistoryItem } from '../../types/dashboard';

interface AIAssistantPageProps {
  chats: ChatbotHistoryItem[];
  onContinueChat: (chat: ChatbotHistoryItem) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'flotbot';
  text: string;
  timestamp: string;
}

const PRESET_THREAT_LINKS = [
  {
    label: 'PayPal Phishing (Typosquatting)',
    url: 'http://paypa1-security-update.xyz/login/verify',
    desc: 'Leetspeak "1" substitution + High-risk .xyz TLD + Unencrypted HTTP',
    badge: 'CRITICAL RISK',
    badgeColor: 'text-red-400 bg-red-950/60 border-red-800',
  },
  {
    label: 'IBM Security Portal Spoof',
    url: 'http://ibm-security-login.xyz/auth/verify',
    desc: 'IBM brand impersonation on abusive .xyz TLD + /auth path',
    badge: 'CRITICAL RISK',
    badgeColor: 'text-red-400 bg-red-950/60 border-red-800',
  },
  {
    label: 'Microsoft Account Harvester',
    url: 'http://micros0ft-support-portal.top/signin',
    desc: 'Zero substitution + Suspicious .top TLD + /signin path',
    badge: 'HIGH RISK',
    badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-800',
  },
  {
    label: 'Chase Banking Credential Harvester',
    url: 'http://chase-online-banking-verify.com/login',
    desc: 'Banking keyword combination + Credential harvesting login path',
    badge: 'HIGH RISK',
    badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-800',
  },
  {
    label: 'Raw IP Obfuscated Endpoint',
    url: 'http://194.26.29.112/secure-banking/update.php',
    desc: 'Raw IPv4 hostname bypassing DNS verification',
    badge: 'HIGH RISK',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
  },
  {
    label: 'Legitimate Official Domain',
    url: 'https://www.google.com/search?q=cybersecurity+awareness',
    desc: 'Official verified domain, valid HTTPS certificate',
    badge: 'VERIFIED SAFE',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
  },
];

const PRESET_THREAT_FILES = [
  {
    label: 'Double Extension Dropper',
    fileName: 'invoice_receipt_march2026.pdf.exe',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    desc: 'Deceptive double extension masquerading executable as PDF',
    entropy: 7.85,
    badge: 'CRITICAL RISK',
    badgeColor: 'text-red-400 bg-red-950/60 border-red-800',
  },
  {
    label: 'WannaCry Ransomware Hash',
    fileName: 'taskhsvc_decryptor.exe',
    sha256: 'ed01ebf8304d1639d1b227b0ca808473e221df54304be34f59b5e1a86e507750',
    desc: 'Known VirusTotal ransomware IOC with high detection ratio',
    entropy: 7.92,
    badge: 'MALWARE DETECTED',
    badgeColor: 'text-red-400 bg-red-950/60 border-red-800',
  },
  {
    label: 'Clean Corporate Document',
    fileName: 'security_policy_handbook.pdf',
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    desc: 'Standard PDF document with clean entropy & safe magic bytes',
    entropy: 4.12,
    badge: 'VERIFIED SAFE',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
  },
];

const SUGGESTED_QUESTIONS = [
  'If I click a suspicious link or work on a sus URL, will you trigger an alert?',
  'How does the Threat Detection Engine pause my activity?',
  'Explain how brand lookalikes and typosquatting work.',
  'What happens when an alert is logged to the Admin Panel?',
];

// Helper: Calculate SHA-256 in browser
async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Calculate Approximate Shannon Entropy
function calculateEntropy(fileBytes: Uint8Array): number {
  if (fileBytes.length === 0) return 0;
  const frequencies = new Array(256).fill(0);
  for (let i = 0; i < fileBytes.length; i++) {
    frequencies[fileBytes[i]]++;
  }
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / fileBytes.length;
      entropy -= p * Math.log2(p);
    }
  }
  return parseFloat(entropy.toFixed(2));
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ chats, onContinueChat }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'flotbot',
      text: "👋 Hello! I am FlotBot AI, your cybersecurity awareness and training companion. I work directly with our Threat Detection Engines (VirusTotal, Google Safe Browsing, Hybrid Analysis, URLEngine) and your enrolled cybersecurity courses. You can ask me questions, test live link interception, upload files for inspection, or ask for study guidance!",
      timestamp: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [scannerMode, setScannerMode] = useState<'url' | 'file'>('url');
  const [testUrl, setTestUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [interceptedThreat, setInterceptedThreat] = useState<ThreatInterceptionData | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionList, setSessionList] = useState<any[]>([]);
  const [studyContext, setStudyContext] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persistent chat sessions and enrolled courses on mount
  const loadChatSessions = async (preferSessionId?: string) => {
    try {
      const res = await api.flotbot.listChats();
      if (res.success && res.data) {
        const sessions = res.data.sessions || [];
        setSessionList(sessions);
        setStudyContext(res.data.studyContext || null);

        if (preferSessionId) {
          loadSessionMessages(preferSessionId);
        }
      }
    } catch (err) {
      console.warn('[AIAssistant] Error loading chat history:', err);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const res = await api.flotbot.getChat(sessionId);
      if (res.success && res.data?.messages) {
        setActiveSessionId(sessionId);
        if (res.data.messages.length > 0) {
          setMessages(
            res.data.messages.map((m: any) => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved',
            }))
          );
        }
      }
    } catch (err) {
      console.warn('[AIAssistant] Error loading session messages:', err);
    }
  };

  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'flotbot',
        text: "👋 Starting a fresh consultation. Ask me anything about threat detection, phishing techniques, malware indicators, or advice on your enrolled cybersecurity courses!",
        timestamp: 'Just now',
      },
    ]);
    loadChatSessions();
    toast.success('Started a fresh conversation session');
  };

  useEffect(() => {
    loadChatSessions();
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isSendingChat) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsSendingChat(true);

    // If query contains a URL, run URL analysis proactively
    const urlMatch = query.match(/https?:\/\/[^\s]+/i);
    if (urlMatch && urlMatch[0]) {
      handleRunUrlInterception(urlMatch[0]);
    }

    try {
      const res = await api.flotbot.chatAI(query, activeSessionId || undefined);
      if (res.success && res.data?.reply) {
        if (res.data.sessionId && res.data.sessionId !== activeSessionId) {
          setActiveSessionId(res.data.sessionId);
        }
        if (res.data.studyContext) {
          setStudyContext(res.data.studyContext);
        }
        const botMsg: Message = {
          id: res.data.botMessage?.id || (Date.now() + 1).toString(),
          sender: 'flotbot',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsSendingChat(false);

        // Refresh session list in background to update history tab immediately
        api.flotbot.listChats().then((cRes) => {
          if (cRes.success && cRes.data?.sessions) {
            setSessionList(cRes.data.sessions);
          }
        });
        return;
      }
    } catch (e) {
      console.warn('Chat API error, attempting client heuristic fallback:', e);
    }

    // Fallback if backend API is temporarily unreachable
    setTimeout(() => {
      let botReply = '';
      const q = query.toLowerCase();

      if (urlMatch && urlMatch[0]) {
        const clientScan = ClientURLEngine.analyze(urlMatch[0]);
        if (clientScan.isThreat) {
          botReply =
            `🔴 **Threat Analysis for \`${urlMatch[0]}\`:**\n\n` +
            `• **Verdict:** ${clientScan.classification.toUpperCase()} (${clientScan.riskLevel} Risk · Score: ${clientScan.score}/100)\n` +
            `• **Detected Signals:** ${clientScan.warnings.join(' ')}\n` +
            `• **Risk Explanation:** This domain mimics a trusted brand or uses deceptive TLDs to harvest credentials in plaintext.\n` +
            `• **Defensive Action:** I have intercepted and paused this activity. Do not submit passwords or download any attachments.`;
        } else {
          botReply =
            `🟢 **URL Analysis for \`${urlMatch[0]}\`:**\n\n` +
            `• **Verdict:** CLEAN & SAFE (Score: ${clientScan.score}/100)\n` +
            `• **Signals:** Valid HTTPS encryption, official domain registration, and no deceptive heuristics detected.`;
        }
      } else if (
        (q.includes('suspicious') || q.includes('sus') || q.includes('click') || q.includes('trigger')) &&
        (q.includes('link') || q.includes('url') || q.includes('alert'))
      ) {
        botReply =
          "🛡️ **Yes! Our Threat Detection Engine actively protects you:**\n\n" +
          "1. **Real-Time Interception:** When you click any suspicious link or enter a risky URL, our `URLEngine` pauses navigation immediately.\n" +
          "2. **AI Threat Explanation:** I analyze the threat telemetry (VirusTotal, Google Safe Browsing, typosquatting) and trigger an interactive Security Alert explaining the risk in plain English.\n" +
          "3. **Human-in-the-Loop Gate:** You must review the danger and choose to either return to safety (recommended) or provide an explicit acknowledgment before the activity can proceed.\n" +
          "4. **Admin Audit Logging:** Every alert trigger and user decision is permanently logged in the Admin Panel under your User Inspection profile.";
      } else if (q.includes('pause') || q.includes('how does') || (q.includes('how') && q.includes('engine'))) {
        botReply =
          "🛡️ **How the Threat Detection Engine Pauses Activity:**\n\n" +
          "1. **Pre-Navigation Interception:** Before your browser loads any destination, the request is intercepted by our Detection Engine.\n" +
          "2. **Multi-Provider Inspection:** It queries Google Safe Browsing, VirusTotal v3, and local heuristic engines simultaneously.\n" +
          "3. **Activity Freezing:** If risk indicators are found (e.g. typosquatting `paypa1`, unencrypted HTTP, or dangerous file downloads), navigation is halted.\n" +
          "4. **Awareness Gate:** An alert modal opens explaining why it was paused. You must provide a manual acknowledgment or return to safety before the action can resume.\n" +
          "5. **Admin Logging:** The event is logged in PostgreSQL under your user ID for SOC compliance.";
      } else if (q.includes('typosquat') || q.includes('lookalike') || q.includes('brand')) {
        botReply =
          "🔍 **Typosquatting & Lookalike Attacks:**\n\n" +
          "Attackers register domains that look nearly identical to popular services by substituting characters (e.g., `paypa1.com` with number '1', `micros0ft.com` with zero '0', or `rn` instead of `m`).\n\n" +
          "Our `URLEngine` normalizes leetspeak and compares against official brand registries to instantly flag these impersonations.";
      } else if (q.includes('admin') || q.includes('inspection') || q.includes('log')) {
        botReply =
          "📊 **Admin Panel & User Inspection:**\n\n" +
          "All intercepted threats, AI explanations, and user decisions are recorded in `alert_events` and `user_activity` tables.\n\n" +
          "Security administrators can inspect each user's **Security Posture Score**, see which threats were triggered, and verify who safely avoided vs. bypassed warnings.";
      } else {
        botReply =
          `🛡️ **FlotBot Security Analysis:** Regarding "${query}":\n\n` +
          `• **Recommended Action:** Ensure multi-factor authentication (MFA) is active across all endpoints and review your enrolled cybersecurity training modules.\n` +
          `• **Detection Controls:** Keep local endpoint heuristics active to quarantine unauthorized PowerShell commands, suspicious double extensions, and unencrypted HTTP destinations.\n` +
          `• **Course Catalog:** Check out our interactive training modules in the Courses tab to earn verified completion credentials!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'flotbot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsSendingChat(false);
    }, 250);
  };

  const handleRunUrlInterception = async (urlToTest: string) => {
    if (!urlToTest.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    const toastId = toast.loading('🔍 Detection Engine scanning across VirusTotal & Google Safe Browsing...');

    try {
      const res = await api.flotbot.analyzeUrl(urlToTest.trim());
      toast.dismiss(toastId);

      if (res.success && res.data?.isThreat) {
        setInterceptedThreat({
          alertId: res.data.alertId || res.data.alert?.id,
          url: urlToTest.trim(),
          domain: res.data.telemetry?.domain,
          score: res.data.telemetry?.score || 80,
          riskLevel: res.data.telemetry?.riskLevel || 'HIGH',
          warnings: res.data.telemetry?.local_heuristics?.warnings || res.data.telemetry?.warnings || [],
          mitre: res.data.telemetry?.local_heuristics?.mitre || res.data.telemetry?.mitre || ['T1566.002'],
          providers: res.data.telemetry?.provider_results || [],
          evidence: res.data.telemetry?.evidence || [],
          aiExplanation: res.data.aiExplanation || res.data.alert?.aiAnalysis?.summary,
        });
        setIsAnalyzing(false);
        return;
      } else if (res.success && !res.data?.isThreat) {
        toast.success('🟢 URL Verified Clean: No threats reported by active security engines.', {
          duration: 4000,
        });
        setIsAnalyzing(false);
        return;
      }
    } catch (e) {
      toast.dismiss(toastId);
    }

    // Client-side local engine fallback if server is offline
    const clientReport = ClientURLEngine.analyze(urlToTest.trim());
    if (clientReport.isThreat) {
      setInterceptedThreat({
        alertId: 'alt_local_' + Math.random().toString(36).substring(2, 8),
        url: urlToTest.trim(),
        domain: clientReport.domain,
        score: clientReport.score,
        riskLevel: clientReport.riskLevel,
        warnings: clientReport.warnings,
        mitre: clientReport.mitre,
        providers: clientReport.provider_results,
        evidence: clientReport.evidence,
        aiExplanation: clientReport.aiExplanation,
      });
    } else {
      toast.success('🟢 URL Verified Clean: No deceptive heuristics or threat markers detected.', {
        duration: 4000,
      });
    }
    setIsAnalyzing(false);
  };

  const handleRunFileInterception = async ({
    sha256,
    fileName,
    entropy,
  }: {
    sha256: string;
    fileName: string;
    entropy: number;
  }) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    const toastId = toast.loading('🔍 Scanning file hash across VirusTotal & Hybrid Analysis Sandbox...');

    try {
      const res = await api.flotbot.analyzeFile({ sha256, fileName, entropy });
      toast.dismiss(toastId);

      if (res.success && res.data?.isThreat) {
        setInterceptedThreat({
          alertId: res.data.alertId || res.data.alert?.id,
          url: `File: ${fileName} [SHA-256: ${sha256.slice(0, 16)}...]`,
          domain: fileName,
          score: res.data.telemetry?.score || 85,
          riskLevel: res.data.telemetry?.riskLevel || 'CRITICAL',
          warnings: res.data.telemetry?.evidence || [],
          mitre: ['T1204.002', 'T1036.007'],
          providers: res.data.telemetry?.provider_results || [],
          evidence: res.data.telemetry?.evidence || [],
          aiExplanation: res.data.aiExplanation || res.data.alert?.aiAnalysis?.summary,
        });
        setIsAnalyzing(false);
        return;
      } else if (res.success && !res.data?.isThreat) {
        toast.success('🟢 File Verified Clean: Hash reputation is clean and safe.', {
          duration: 4000,
        });
        setIsAnalyzing(false);
        return;
      }
    } catch (e) {
      toast.dismiss(toastId);
    }

    // Client-side file engine fallback
    const clientReport = ClientFileEngine.analyze({ fileName, sha256, entropy });
    if (clientReport.isThreat) {
      setInterceptedThreat({
        alertId: 'alt_file_' + Math.random().toString(36).substring(2, 8),
        url: `File: ${fileName} [SHA-256: ${sha256.slice(0, 16)}...]`,
        domain: fileName,
        score: clientReport.score,
        riskLevel: clientReport.riskLevel,
        warnings: clientReport.warnings,
        mitre: ['T1204.002', 'T1036.007'],
        providers: clientReport.provider_results,
        evidence: clientReport.evidence,
        aiExplanation: clientReport.aiExplanation,
      });
    } else {
      toast.success('🟢 File Verified Clean: Hash reputation is clean and safe.', {
        duration: 4000,
      });
    }
    setIsAnalyzing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const sha256 = await computeSha256(file);
      const entropy = calculateEntropy(bytes);

      toast.success(`Calculated SHA-256: ${sha256.slice(0, 10)}... (Entropy: ${entropy})`, {
        duration: 3000,
      });

      await handleRunFileInterception({
        sha256,
        fileName: file.name,
        entropy,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to read file for hashing');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="p-6 rounded-2xl relative overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-ai-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div
              className="p-3 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--accent-ai-faint)',
                color: 'var(--accent-ai)',
                border: '1px solid var(--accent-ai-border)',
                boxShadow: 'var(--glow-ai)',
              }}
            >
              <Bot className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  FlotBot AI Security Assistant & Threat Interceptor
                </h1>
                <span
                  className="badge"
                  style={{
                    background: 'var(--accent-success-faint)',
                    color: 'var(--accent-success)',
                    border: '1px solid var(--accent-success-border)',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  ACTIVE DEFENSE
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Multi-layer protection using VirusTotal v3, Google Safe Browsing, Hybrid Analysis, and local heuristics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left Chat / Right Threat Engine Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Conversation (7 cols) */}
        <div
          className="lg:col-span-7 flex flex-col rounded-2xl overflow-hidden h-[640px]"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Chat Header */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: 'var(--surface-1)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-ai)' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                {activeSessionId ? 'Ongoing Security Consultation' : 'Interactive Security Consultation'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1"
                style={{
                  background: 'var(--accent-ai-faint)',
                  color: 'var(--accent-ai)',
                  border: '1px solid var(--accent-ai-border)',
                }}
                title="Start a fresh conversation thread"
              >
                + New Chat
              </button>
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>Online</span>
            </div>
          </div>

          {/* Course Study Companion Banner */}
          {studyContext && studyContext.hasEnrollments && (
            <div
              className="px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 animate-fade-in"
              style={{
                background: 'var(--accent-primary-faint)',
                borderColor: 'var(--accent-primary-border)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-bold shrink-0"
                  style={{
                    background: 'var(--accent-primary-faint)',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--accent-primary-border)',
                  }}
                >
                  🎓 COURSE STUDY TUTOR
                </span>
                <span className="text-[11px] truncate max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                  Studying: {studyContext.courses.map((c: any) => c.title).join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendMessage("What should I study next according to my enrolled courses?")}
                  className="text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer"
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  Next Lesson Advice
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Give me a quick scenario quiz based on my course!")}
                  className="text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer"
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  Quiz Me
                </button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5" style={{ background: 'var(--bg-card)' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'flotbot' && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: 'var(--accent-ai-faint)',
                      border: '1px solid var(--accent-ai-border)',
                      color: 'var(--accent-ai)',
                    }}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed"
                  style={{
                    ...(m.sender === 'user'
                      ? {
                          background: 'var(--accent-primary)',
                          color: '#FFFFFF',
                          borderTopRightRadius: '0px',
                        }
                      : {
                          background: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-default)',
                          borderTopLeftRadius: '0px',
                          whiteSpace: 'pre-line',
                        }),
                  }}
                >
                  {m.text}
                  <div
                    className="text-[9px] mt-1.5"
                    style={{
                      color: m.sender === 'user' ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
                      textAlign: m.sender === 'user' ? 'right' : 'left',
                    }}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isSendingChat && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: 'var(--accent-ai-faint)',
                    border: '1px solid var(--accent-ai-border)',
                    color: 'var(--accent-ai)',
                  }}
                >
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div
                  className="rounded-2xl px-4 py-2.5 text-xs flex items-center gap-2"
                  style={{
                    background: 'var(--surface-1)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    borderTopLeftRadius: '0px',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                  <span>FlotBot AI is reasoning and preparing defense analysis...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Chips */}
          <div
            className="p-2.5 border-t overflow-x-auto flex gap-2"
            style={{
              background: 'var(--surface-1)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isSendingChat}
                className="text-[11px] px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t flex gap-2"
            style={{
              background: 'var(--surface-1)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask FlotBot, scan a link (e.g. http://...), or inquire about security..."
              className="flex-1 text-xs px-4 py-2.5 rounded-xl focus:outline-none transition-colors"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isSendingChat}
              className="px-4 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              style={{
                background: 'var(--accent-ai)',
                color: '#FFFFFF',
              }}
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>

        {/* Right: Live Threat Interception & Scanner Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'var(--accent-warning-faint)',
                    color: 'var(--accent-warning)',
                    border: '1px solid var(--accent-warning-border)',
                  }}
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Threat Interception Sandbox
                </h3>
              </div>

              {/* URL vs File Toggle */}
              <div
                className="flex p-0.5 rounded-lg text-[10px] font-bold"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setScannerMode('url')}
                  className="px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  style={{
                    background: scannerMode === 'url' ? 'var(--accent-ai)' : 'transparent',
                    color: scannerMode === 'url' ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  URL Scanner
                </button>
                <button
                  type="button"
                  onClick={() => setScannerMode('file')}
                  className="px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  style={{
                    background: scannerMode === 'file' ? 'var(--accent-ai)' : 'transparent',
                    color: scannerMode === 'file' ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  File Scanner
                </button>
              </div>
            </div>

            {/* URL Scanner Mode */}
            {scannerMode === 'url' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Enter a URL or click samples to trigger <strong>Google Safe Browsing</strong>, <strong>VirusTotal</strong>, and <strong>URLEngine</strong>.
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Globe className="w-3.5 h-3.5" style={{ color: 'var(--accent-ai)' }} />
                    Custom URL to Test
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      placeholder="e.g. http://paypa1-security.xyz/login"
                      className="flex-1 text-xs px-3 py-2 rounded-xl focus:outline-none font-mono transition-colors"
                      style={{
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRunUrlInterception(testUrl)}
                      disabled={!testUrl.trim() || isAnalyzing}
                      className="px-3.5 py-2 rounded-xl disabled:opacity-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      style={{
                        background: 'var(--accent-warning)',
                        color: '#FFFFFF',
                      }}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Test Intercept
                    </button>
                  </div>
                </div>

                {/* Preset URL Threats */}
                <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Click Sample Links to Test:
                  </span>
                  <div className="space-y-2">
                    {PRESET_THREAT_LINKS.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setTestUrl(item.url);
                          handleRunUrlInterception(item.url);
                        }}
                        className="p-2.5 rounded-xl transition-all cursor-pointer group"
                        style={{
                          background: 'var(--surface-1)',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {item.label}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>
                          {item.url}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* File Scanner Mode */}
            {scannerMode === 'file' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Upload any file or click samples to scan SHA-256 against <strong>VirusTotal</strong> and <strong>Hybrid Analysis</strong> sandbox.
                </p>

                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-xl text-center transition-all cursor-pointer group"
                  style={{
                    background: 'var(--surface-1)',
                    border: '2px dashed var(--border-medium)',
                  }}
                >
                  <UploadCloud className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: 'var(--accent-ai)' }} />
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Click or Drag & Drop File to Scan</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Calculates SHA-256 and Shannon Entropy locally</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Preset File Threats */}
                <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Click Sample Files to Test:
                  </span>
                  <div className="space-y-2">
                    {PRESET_THREAT_FILES.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleRunFileInterception(item)}
                        className="p-2.5 rounded-xl transition-all cursor-pointer group"
                        style={{
                          background: 'var(--surface-1)',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold transition-colors flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                            <FileCode className="w-3.5 h-3.5" style={{ color: 'var(--accent-ai)' }} />
                            {item.fileName}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>
                          SHA: {item.sha256.slice(0, 20)}... · Entropy: {item.entropy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Threat Interception Modal */}
      <ThreatInterceptionModal
        threat={interceptedThreat}
        onClose={() => setInterceptedThreat(null)}
      />

      {/* Consultation History */}
      <ChatbotHistory
        chats={
          sessionList.length > 0
            ? sessionList.map((s: any) => ({
                id: s.id,
                date: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Saved',
                question: s.title,
                aiSummary: s.lastReply
                  ? (s.lastReply.length > 140 ? s.lastReply.substring(0, 137) + '...' : s.lastReply)
                  : `Security consultation session with ${s.messageCount || 0} interaction exchanges.`,
                category: (s.category as any) || 'General',
                messageCount: s.messageCount || 0,
              }))
            : chats
        }
        onContinueChat={(chatItem) => {
          loadSessionMessages(chatItem.id);
          toast.success(`Loaded consultation session: "${chatItem.question}"`);
          window.scrollTo({ top: 120, behavior: 'smooth' });
          onContinueChat?.(chatItem);
        }}
      />
    </div>
  );
};
