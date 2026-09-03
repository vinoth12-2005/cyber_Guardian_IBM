import React, { useState } from 'react';
import { adminApi } from '../../lib/api';
import { X, Gamepad2, Plus, Trash2, Save, Shield, HelpCircle } from 'lucide-react';

interface SimulationFormModalProps {
  simulation?: any | null; // If null, mode is Create; otherwise mode is Edit
  onClose: () => void;
  onSaved: () => void;
}

export const SimulationFormModal: React.FC<SimulationFormModalProps> = ({
  simulation,
  onClose,
  onSaved,
}) => {
  const isEditing = !!simulation;

  const [title, setTitle] = useState(simulation?.title || '');
  const [id, setId] = useState(simulation?.id || '');
  const [category, setCategory] = useState(simulation?.category || 'Phishing');
  const [difficulty, setDifficulty] = useState(simulation?.difficulty || 'Beginner');
  const [duration, setDuration] = useState(simulation?.duration || 10);
  const [environment, setEnvironment] = useState(simulation?.environment || 'email');
  const [xp, setXp] = useState(simulation?.xp || 150);
  const [icon, setIcon] = useState(simulation?.icon || 'mail');
  const [brand, setBrand] = useState(simulation?.brand || 'Enterprise Security Hub');
  const [goal, setGoal] = useState(simulation?.goal || '');
  const [summary, setSummary] = useState(simulation?.summary || '');
  const [learningObjectives, setLearningObjectives] = useState<string>(
    Array.isArray(simulation?.learningObjectives)
      ? simulation.learningObjectives.join('\n')
      : ''
  );

  const [hints, setHints] = useState<any[]>(
    simulation?.hints && simulation.hints.length > 0
      ? simulation.hints
      : [
          { level: 1, text: 'Look closely at sender address headers and domains', scorePenalty: 5 },
          { level: 2, text: 'Check for typosquatting or mismatched reply-to addresses', scorePenalty: 10 },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddHint = () => {
    setHints([
      ...hints,
      {
        level: hints.length + 1,
        text: 'Always verify unexpected requests out-of-band via standard phone or corporate channels.',
        scorePenalty: 5 * (hints.length + 1),
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Simulation title is required.');
      return;
    }

    const payload = {
      id: id.trim() || `SE-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      title: title.trim(),
      category,
      difficulty,
      duration: parseInt(String(duration), 10) || 10,
      environment,
      xp: parseInt(String(xp), 10) || 100,
      icon,
      brand: brand.trim() || 'Enterprise Security Hub',
      goal: goal.trim(),
      summary: summary.trim(),
      learningObjectives: learningObjectives.split('\n').map((o) => o.trim()).filter(Boolean),
      hints,
    };

    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        const res = await adminApi.simulations.update(simulation.id, payload);
        if (res.success) {
          onSaved();
          onClose();
        } else {
          setError(res.error?.message || 'Failed to update simulation scenario');
        }
      } else {
        const res = await adminApi.simulations.create(payload);
        if (res.success) {
          onSaved();
          onClose();
        } else {
          setError(res.error?.message || 'Failed to create simulation scenario');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Customize Simulation: ${simulation.id}` : 'Create Attack & Defense Lab Scenario'}
              </h2>
              <div className="text-xs text-slate-400">
                {isEditing ? 'Modify scenario threat vector parameters and hints in real database' : 'Add a new interactive threat lab scenario for employee defense testing'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-300 mb-1">Scenario Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Executive Spoofing Wire Transfer"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Scenario ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={isEditing}
                placeholder="e.g. SE-053"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="Phishing">Phishing</option>
                <option value="Vishing">Vishing (Voice)</option>
                <option value="Quishing">Quishing (QR)</option>
                <option value="Smishing">Smishing (SMS)</option>
                <option value="MFA Fatigue">MFA Fatigue</option>
                <option value="Ransomware">Ransomware</option>
                <option value="Social Engineering">Social Engineering</option>
                <option value="Insider Threat">Insider Threat</option>
                <option value="Deepfake">Deepfake Defense</option>
                <option value="USB Drop">USB Drop</option>
                <option value="Credential Harvest">Credential Harvest</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">XP Reward</label>
              <input
                type="number"
                value={xp}
                onChange={(e) => setXp(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="email">Email Inbox Client</option>
                <option value="phone">Phone / Voice Terminal</option>
                <option value="qr">QR Scanner Interface</option>
                <option value="sms">SMS / Mobile Messaging</option>
                <option value="mfa">MFA Prompt Dialog</option>
                <option value="usb">Removable USB Storage</option>
                <option value="web">Web Browser / OAuth</option>
                <option value="terminal">Command Terminal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Icon Style</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="mail">Mail</option>
                <option value="phone">Phone</option>
                <option value="qr">QR Code</option>
                <option value="lock">Lock / Key</option>
                <option value="shield">Shield</option>
                <option value="alert">Alert / Warning</option>
                <option value="terminal">Terminal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Impersonated Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Microsoft 365, Bank Support"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Primary Tactical Goal</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Identify spoofed CEO wire transfer and follow verification escalation protocol."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Scenario Threat Summary & Narrative</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Detailed overview of the threat vector, pretexting technique, and adversary objective..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Learning Objectives (1 per line)
            </label>
            <textarea
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              rows={3}
              placeholder="Inspect email headers for spoofed Reply-To&#10;Verify bank change requests out-of-band&#10;Never approve unprompted push notifications"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Hints */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-slate-300">
                Tactical Hints ({hints.length})
              </label>
              <button
                type="button"
                onClick={handleAddHint}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Hint
              </button>
            </div>

            {hints.map((h, hi) => (
              <div key={hi} className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 w-16">Level {h.level || hi + 1}:</span>
                <input
                  type="text"
                  value={h.text}
                  onChange={(e) => {
                    const updated = [...hints];
                    updated[hi].text = e.target.value;
                    setHints(updated);
                  }}
                  placeholder="Hint text displayed to employee..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
                <input
                  type="number"
                  value={h.scorePenalty ?? 5}
                  onChange={(e) => {
                    const updated = [...hints];
                    updated[hi].scorePenalty = parseInt(e.target.value, 10);
                    setHints(updated);
                  }}
                  title="Score Penalty"
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-rose-400 font-mono text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (hints.length <= 1) return;
                    setHints(hints.filter((_, idx) => idx !== hi));
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving to Database...' : isEditing ? 'Save Scenario' : 'Publish Scenario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
