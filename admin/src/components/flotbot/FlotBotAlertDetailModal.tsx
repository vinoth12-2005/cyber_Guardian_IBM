import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import {
  X,
  ShieldAlert,
  Bot,
  CheckCircle2,
  Clock,
  History,
  Terminal,
  FileCode,
  Check,
  Send,
} from 'lucide-react';

interface FlotBotAlertDetailModalProps {
  alertId: string;
  onClose: () => void;
  onAlertUpdated: () => void;
}

export const FlotBotAlertDetailModal: React.FC<FlotBotAlertDetailModalProps> = ({
  alertId,
  onClose,
  onAlertUpdated,
}) => {
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlert = async () => {
    setLoading(true);
    try {
      const res = await adminApi.flotbot.getAlertById(alertId);
      if (res.success && res.data) {
        setAlert(res.data);
        if (res.data.aiAnalysis) {
          setAiAnalysis(res.data.aiAnalysis.reply || res.data.aiAnalysis.analysis || JSON.stringify(res.data.aiAnalysis));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert();
  }, [alertId]);

  const handleAcknowledge = async () => {
    setActionLoading(true);
    try {
      await adminApi.flotbot.acknowledgeAlert(alertId);
      await fetchAlert();
      onAlertUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution notes to close this threat incident.');
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.flotbot.resolveAlert(alertId, resolutionNotes);
      await fetchAlert();
      onAlertUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestAIExplanation = async () => {
    setAiLoading(true);
    try {
      const res = await adminApi.flotbot.explainAlert(alertId);
      if (res.success && res.data) {
        setAiAnalysis(res.data.analysis);
        await fetchAlert();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !alert) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
          Loading threat intelligence & sensor telemetry...
        </div>
      </div>
    );
  }

  const history = alert.history || [];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                alert.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {alert.severity}
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">{alert.title}</h2>
              <div className="text-xs text-slate-400 font-mono">
                Sensor: <strong className="text-slate-300">{alert.source}</strong> · Detected: {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Attack Description & Recommendation */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300">Threat Overview:</div>
              <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>
              {alert.recommendation && (
                <div className="pt-2 border-t border-slate-800/80 text-xs text-indigo-300">
                  <strong>Recommended Remediation:</strong> {alert.recommendation}
                </div>
              )}
            </div>
          </div>

          {/* Evidence Telemetry */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              Evidence Sensor Telemetry
            </h3>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
              {JSON.stringify(alert.evidence, null, 2)}
            </pre>
          </div>

          {/* AI Security Explanation */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Bot className="h-4 w-4 text-indigo-400" />
                <span>Ollama AI Security Analysis</span>
              </div>
              <button
                onClick={handleRequestAIExplanation}
                disabled={aiLoading}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] font-mono text-white transition-colors"
              >
                {aiLoading ? 'Analyzing...' : aiAnalysis ? 'Regenerate Analysis' : 'Explain with AI'}
              </button>
            </div>

            {aiAnalysis ? (
              <p className="text-xs text-indigo-200 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-indigo-900/50">
                {aiAnalysis}
              </p>
            ) : (
              <div className="text-xs text-slate-400">
                Click "Explain with AI" to generate deep root cause analysis and MITRE technique mapping.
              </div>
            )}
          </div>

          {/* Alert Handling History (7-Stage Lifecycle) */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-amber-400" />
              Alert Handling History Lifecycle (Real Database Events)
            </h3>
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-xs text-slate-500">No lifecycle events recorded.</div>
              ) : (
                history.map((h: any, idx: number) => (
                  <div key={h.id || idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                      <span className="font-mono text-slate-200 font-bold uppercase">{h.eventType}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(h.timestamp).toLocaleTimeString()} · {new Date(h.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resolution Actions */}
          {alert.status !== 'RESOLVED' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-white">Incident Resolution Notes:</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Document actions taken (e.g. process terminated, host isolated, IP blocked in firewall)..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-500">
            Status: <strong className="text-white">{alert.status}</strong>
          </div>

          <div className="flex gap-2">
            {!alert.acknowledged && (
              <button
                onClick={handleAcknowledge}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
              >
                Acknowledge Alert
              </button>
            )}

            {alert.status !== 'RESOLVED' && (
              <button
                onClick={handleResolve}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
              >
                Resolve & Close Incident
              </button>
            )}

            <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
