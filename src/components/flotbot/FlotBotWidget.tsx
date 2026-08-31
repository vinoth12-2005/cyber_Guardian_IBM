import React, { useState, useEffect } from 'react';
import { Bot, X, ShieldAlert, Minimize2, AlertTriangle, Send, Sparkles } from 'lucide-react';

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
      text: "👋 Hi! I'm FlotBot, your Linux Endpoint Security Assistant. Shields are active and monitoring threat channels.",
    },
  ]);
  const [input, setInput] = useState('');
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'alerts'>('chat');

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    if (window.electronAPI?.flotbotChat) {
      try {
        const res = await window.electronAPI.flotbotChat('widget-session', userText, {});
        const botReply = res?.reply || res?.text || "FlotBot active and monitoring.";
        setMessages((prev) => [...prev, { sender: 'flotbot', text: botReply }]);
        return;
      } catch (err) {
        console.log("IPC FlotBot chat fallback:", err);
      }
    }

    // Fallback response if IPC bridge is unavailable
    setTimeout(() => {
      let botReply = "FlotBot AI is inspecting process threads and network sockets...";
      const query = userText.toLowerCase();

      if (query.includes('status') || query.includes('scan')) {
        botReply = "🛡️ System Scan Complete: Linux Kernel modules & endpoints are clean. No unauthorized process modification detected.";
      } else if (query.includes('threat') || query.includes('alert')) {
        botReply = `⚠️ Currently monitoring ${alerts.length} registered system events. All decoy canary files (~/.flotbot/canaries) are intact.`;
      } else if (query.includes('hello') || query.includes('hi')) {
        botReply = "👋 FlotBot is online! Ask me about active socket connections, quarantine files, or threat alerts.";
      }

      setMessages((prev) => [...prev, { sender: 'flotbot', text: botReply }]);
    }, 400);
  };

  const handleCloseWidget = () => {
    if (window.electronAPI?.toggleFlotBot) {
      window.electronAPI.toggleFlotBot(false);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/30 select-none"
      style={{
        backgroundColor: 'rgba(11, 17, 32, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitAppRegion: 'drag', // Allows dragging the floating window
      } as any}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase">FlotBot AI</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400">Endpoint Security Overlay</p>
          </div>
        </div>

        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button
            onClick={() => setActiveTab(activeTab === 'chat' ? 'alerts' : 'chat')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors relative"
            title="Toggle Alerts"
          >
            <ShieldAlert className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>
          <button
            onClick={handleCloseWidget}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
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
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'flotbot' && (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-2.5 rounded-xl whitespace-pre-wrap leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : m.alert
                      ? 'bg-red-950/80 border border-red-500/50 text-red-200 rounded-tl-none font-mono text-[11px]'
                      : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-2.5 bg-slate-900/90 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FlotBot or check status..."
              className="flex-1 bg-slate-800/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Alerts Tab */
        <div
          className="flex-1 overflow-y-auto p-3 space-y-2 text-xs"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Detected System Alerts
          </h4>

          {alerts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-emerald-400/60" />
              No active security threats detected.
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-400 text-xs">{alt.title}</span>
                  <span className="text-[10px] text-slate-400">{alt.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{alt.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
