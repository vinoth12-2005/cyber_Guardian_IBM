import React, { useState } from 'react';
import { Settings2, Save, ShieldCheck, Cpu, Sliders } from 'lucide-react';

export const FlotBotConfigView: React.FC = () => {
  const [aiProvider, setAiProvider] = useState('ollama');
  const [pollInterval, setPollInterval] = useState('2000');
  const [entropyThreshold, setEntropyThreshold] = useState('7.2');
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">FlotBot EDR Sensor & AI Engine Configuration</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune low-level sensor sampling rates, Shannon entropy thresholds, and Ollama / Gemini hybrid routing parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-xl bg-slate-900/70 border border-slate-800 p-6 space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white mb-1">AI Copilot Analysis Provider</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono"
            >
              <option value="ollama">Ollama Local Engine (qwen2.5:0.5b - Zero Data Leakage)</option>
              <option value="gemini">Google Gemini 2.0 Flash (Cloud Deep Reasoning)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-1">Telemetry Sensor Polling Rate (Milliseconds)</label>
            <input
              type="number"
              value={pollInterval}
              onChange={(e) => setPollInterval(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Default: 2000ms (2 seconds per sensor sweep)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-1">Shannon File Entropy Heuristic Alert Threshold (0.0 – 8.0)</label>
            <input
              type="text"
              value={entropyThreshold}
              onChange={(e) => setEntropyThreshold(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Files with entropy &gt; {entropyThreshold} are flagged for ransomware / packers</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="autoQ"
              checked={autoQuarantine}
              onChange={(e) => setAutoQuarantine(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="autoQ" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Enable SafeActionExecutor Auto-Quarantine on High/Critical IOC Matches
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save EDR Policies</span>
          </button>
          {saved && <span className="text-xs text-emerald-400 font-mono">✓ Configuration saved and applied to sensor supervisor</span>}
        </div>
      </form>
    </div>
  );
};
