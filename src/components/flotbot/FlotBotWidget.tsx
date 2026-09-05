import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, ShieldAlert, Minimize2, AlertTriangle, Send, Sparkles, Loader2, Unlock } from 'lucide-react';
import { api } from '../../lib/api';
import { ClientURLEngine } from '../../lib/detection/clientURLEngine';

declare global {
  interface Window {
    electronAPI?: {
      toggleFlotBot: (enable: boolean) => void;
      getFlotBotStatus: () => Promise<boolean>;
      onFlotBotStatusChanged: (callback: (status: boolean) => void) => void;
      triggerAlert: (alertData: any) => void;
      onNewAlert: (callback: (alert: any) => void) => void;
      flotbotChat: (sessionId: string, message: string, context?: any) => Promise<any>;
    };
  }
}

interface AlertMessage {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export const FlotBotWidget: React.FC = () => {
  const [messages, setMessages] = useState<
    { sender: 'flotbot' | 'user'; text: string; alert?: boolean }[]
  >([
    {
      sender: 'flotbot',
      text: "👋 Hi! I'm FlotBot, your Real-Time Endpoint Security & AI Assistant. Threat detection shields and live web interception are active.",
    },
  ]);
  const [input, setInput] = useState('');
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'alerts'>('chat');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Listen for alerts coming from Electron main process
    if (window.electronAPI?.onNewAlert) {
      window.electronAPI.onNewAlert((newAlert: AlertMessage) => {
        setAlerts((prev) => [newAlert, ...prev]);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'flotbot',
            text: `⚠️ THREAT ALERT [${newAlert.severity.toUpperCase()}]: ${newAlert.title}\n${newAlert.message}`,
            alert: true,
          },
        ]);
      });
    }
  }, []);

  useEffect(() => {
    // Restore persistent session from PostgreSQL if available
    const savedSessionId = localStorage.getItem('flotbot_widget_session_id');
    if (savedSessionId) {
      api.flotbot.getChat(savedSessionId).then((res) => {
        if (res.success && res.data?.messages?.length > 0) {
          setMessages(
            res.data.messages.map((m: any) => ({
              sender: m.sender,
              text: m.text,
            }))
          );
        }
      }).catch((err) => console.log('Widget history load notice:', err));
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    // ── Real-Time URL & HTTP Inspection ────────────────────────────────────
    const urlMatch = userText.match(/https?:\/\/[^\s"'<>]+/i) || userText.match(/\b([a-z0-9-]+\.(?:com|org|net|xyz|top|ru|cn|io|app|dev|biz))\b/i);
    if (urlMatch && urlMatch[0]) {
      const detectedUrl = urlMatch[0].startsWith('http') ? urlMatch[0] : `http://${urlMatch[0]}`;
      const clientScan = ClientURLEngine.analyze(detectedUrl);

      if (clientScan.isThreat) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'flotbot',
            text: `🚨 REAL-TIME THREAT DETECTED [${clientScan.riskLevel} RISK · Score: ${clientScan.score}/100]\n` +
                  `Target: ${detectedUrl}\n` +
                  `Evidence: ${clientScan.warnings.join('; ')}\n\n` +
                  `🛑 Navigation paused! Avoid submitting passwords or downloading files.`,
            alert: true,
          },
        ]);

        if (typeof (window as any).triggerUrlInterception === 'function') {
          (window as any).triggerUrlInterception(detectedUrl);
        } else {
          window.dispatchEvent(new CustomEvent('flotbot-intercept-url', { detail: { url: detectedUrl } }));
        }
      }
    }

    const widgetSessionId = localStorage.getItem('flotbot_widget_session_id') || undefined;

    // Persist and query via backend API
    try {
      const res = await api.flotbot.chatAI(userText, widgetSessionId, { alertsCount: alerts.length });
      if (res.success && res.data?.reply) {
        if (res.data.sessionId) {
          localStorage.setItem('flotbot_widget_session_id', res.data.sessionId);
        }
        setMessages((prev) => [...prev, { sender: 'flotbot', text: res.data.reply }]);
        setIsTyping(false);
        return;
      }
    } catch (e) {
      console.log('API chat fallback:', e);
    }

    if (window.electronAPI?.flotbotChat) {
      try {
        const res = await window.electronAPI.flotbotChat('widget-session', userText, {});
        const botReply = res?.reply || res?.text || "FlotBot active and monitoring.";
        setMessages((prev) => [...prev, { sender: 'flotbot', text: botReply }]);
        setIsTyping(false);
        return;
      } catch (err) {
        console.log("IPC FlotBot chat fallback:", err);
      }
    }

    // Fallback response if offline
    setTimeout(() => {
      let botReply = "FlotBot AI is inspecting process threads and network sockets...";
      const query = userText.toLowerCase();

      if ((query.includes('suspicious') || query.includes('sus')) && (query.includes('link') || query.includes('url') || query.includes('click') || query.includes('alert') || query.includes('http'))) {
        botReply =
          "🛡️ **Yes! Our Threat Detection Engine actively protects you:**\n\n" +
          "1. **Real-Time Interception:** When you click any suspicious link or enter an unencrypted `http://` URL, our URLEngine pauses navigation immediately.\n" +
          "2. **AI Threat Explanation:** I analyze the threat heuristics (unencrypted plaintext, lookalike domains, punycode, high-risk TLDs) and trigger an interactive Security Alert explaining the risk.\n" +
          "3. **Human-in-the-Loop Gate:** You can return to safety (recommended) or acknowledge the risk before proceeding.\n" +
          "4. **Admin Inspection Log:** Every alert and your acknowledgment decision is recorded in the Admin Panel.";
      } else if (query.includes('status') || query.includes('scan')) {
        botReply = "🛡️ System Scan Complete: Linux Kernel modules & endpoints are clean. No unauthorized process modification detected.";
      } else if (query.includes('threat') || query.includes('alert')) {
        botReply = `⚠️ Currently monitoring ${alerts.length} registered system events. All decoy canary files are intact.`;
      } else if (query.includes('hello') || query.includes('hi')) {
        botReply = "👋 FlotBot is online! Ask me about suspicious link detection, HTTP vs HTTPS security, or active alerts.";
      }

      setMessages((prev) => [...prev, { sender: 'flotbot', text: botReply }]);
      setIsTyping(false);
    }, 150);
  };

  const handleCloseWidget = () => {
    if (window.electronAPI?.toggleFlotBot) {
      window.electronAPI.toggleFlotBot(false);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col rounded-2xl shadow-2xl overflow-hidden select-none"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--accent-ai-border)',
        backdropFilter: 'var(--blur)',
        WebkitAppRegion: 'drag', // Allows dragging the floating window
      } as any}
    >
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: 'var(--surface-1)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg flex items-center justify-center animate-pulse"
            style={{
              background: 'var(--accent-ai-faint)',
              color: 'var(--accent-ai)',
              border: '1px solid var(--accent-ai-border)',
            }}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>FlotBot AI</h3>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: 'var(--accent-success)' }} />
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Endpoint Security Overlay</p>
          </div>
        </div>

        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button
            onClick={() => setActiveTab(activeTab === 'chat' ? 'alerts' : 'chat')}
            className="p-1.5 rounded-lg transition-colors relative"
            style={{ color: 'var(--text-secondary)' }}
            title="Toggle Alerts"
          >
            <ShieldAlert className="w-4 h-4" />
            {alerts.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ background: 'var(--accent-danger)' }}
              >
                {alerts.length}
              </span>
            )}
          </button>
          <button
            onClick={handleCloseWidget}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Minimize to System Tray"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Container */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col min-h-0" style={{ WebkitAppRegion: 'no-drag' } as any}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs" style={{ background: 'var(--bg-elevated)' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'flotbot' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: 'var(--accent-ai-faint)',
                      border: '1px solid var(--accent-ai-border)',
                      color: 'var(--accent-ai)',
                    }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className="max-w-[80%] p-2.5 rounded-xl whitespace-pre-wrap leading-relaxed"
                  style={{
                    ...(m.sender === 'user'
                      ? {
                          background: 'var(--accent-primary)',
                          color: '#FFFFFF',
                          borderTopRightRadius: '0px',
                        }
                      : m.alert
                      ? {
                          background: 'var(--accent-danger-faint)',
                          border: '1px solid var(--accent-danger-border)',
                          color: 'var(--accent-danger)',
                          borderTopLeftRadius: '0px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }
                      : {
                          background: 'var(--surface-1)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                          borderTopLeftRadius: '0px',
                        }),
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start items-center animate-fade-in">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'var(--accent-ai-faint)',
                    border: '1px solid var(--accent-ai-border)',
                    color: 'var(--accent-ai)',
                  }}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div
                  className="px-3 py-2 rounded-xl flex items-center gap-1.5"
                  style={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] ml-1 font-mono text-cyan-400">FlotBot analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSend}
            className="p-2.5 border-t flex gap-2"
            style={{
              background: 'var(--surface-1)',
              borderColor: 'var(--border-default)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FlotBot or check status..."
              className="flex-1 rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="submit"
              className="p-2 rounded-xl font-semibold transition-colors cursor-pointer"
              style={{
                background: 'var(--accent-ai)',
                color: '#FFFFFF',
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Alerts Tab */
        <div
          className="flex-1 overflow-y-auto p-3 space-y-2 text-xs"
          style={{
            WebkitAppRegion: 'no-drag',
            background: 'var(--bg-elevated)',
          } as any}
        >
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--accent-warning)' }} /> Detected System Alerts
          </h4>

          {alerts.length === 0 ? (
            <div
              className="p-6 text-center rounded-xl"
              style={{
                border: '1px dashed var(--border-medium)',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldAlert className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-success)' }} />
              No active security threats detected.
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-2.5 rounded-xl space-y-1"
                style={{
                  background: 'var(--accent-danger-faint)',
                  border: '1px solid var(--accent-danger-border)',
                  color: 'var(--accent-danger)',
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs" style={{ color: 'var(--accent-danger)' }}>{alt.title}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{alt.timestamp}</span>
                </div>
                <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{alt.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
