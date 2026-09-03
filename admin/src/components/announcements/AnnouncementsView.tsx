import React, { useState } from 'react';
import { Megaphone, Plus, Bell, Send } from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState([
    { id: '1', title: 'New Advanced MFA Fatigue Attack Simulation Released', cat: 'Simulation Lab', date: '2026-08-30', author: 'SOC Academy Team' },
    { id: '2', title: 'FlotBot Sensor Engine v2.4 Live with Enhanced PowerShell Detection', cat: 'EDR Update', date: '2026-08-28', author: 'Security Operations' },
  ]);

  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('Platform Notice');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAnnouncements((prev) => [
      { id: String(Date.now()), title, cat, date: new Date().toISOString().split('T')[0], author: 'Platform Admin' },
      ...prev,
    ]);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Broadcast Announcements</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Broadcast security bulletins, maintenance schedules, and new course releases to all platform users.
        </p>
      </div>

      <form onSubmit={handlePost} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter announcement headline..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white">
          Broadcast Notice
        </button>
      </form>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-white">{a.title}</h3>
                <span className="text-[10px] font-mono text-slate-500">{a.cat} · By {a.author}</span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{a.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
