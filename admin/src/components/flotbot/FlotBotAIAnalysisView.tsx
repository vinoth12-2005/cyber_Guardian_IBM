import React, { useState } from 'react';
import { adminApi } from '../../lib/api';
import { Bot, Send, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

export const FlotBotAIAnalysisView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; provider?: string }>>([
    {
      role: 'ai',
      text: '🛡️ FlotBot Security Copilot initialized with Ollama Qwen2.5 sensor intelligence. How can I assist with your threat investigations or incident debriefs today?',
      provider: 'ollama/qwen2.5',
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt.trim();
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await adminApi.flotbot.chatAI(userText);
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: res.data.reply, provider: res.data.provider },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: 'Error generating response from security AI engine.' },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AI Security Copilot & Deep Analysis</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query local Ollama AI model directly for attack correlation, MITRE tactic mapping, and IOC hunting syntax.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col h-[65vh] shadow-2xl overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="h-8 w-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none font-sans'
                }`}
              >
                {m.text}
                {m.provider && (
                  <div className="mt-2 text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-1">
                    Engine: {m.provider}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 font-mono flex items-center gap-2">
                <Sparkles className="h-3 w-3 animate-spin text-indigo-400" />
                <span>Correlating sensor logs...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask FlotBot AI about telemetry, reverse shells, phishing indicators, PowerShell commands..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
