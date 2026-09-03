import React, { useState } from 'react';
import { ShieldAlert, RotateCw, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

export interface FlipCardData {
  front: {
    title: string;
    scenario: string;
    indicator: string;
  };
  back: {
    title: string;
    analysis: string;
    mitigation: string;
  };
}

interface InteractiveFlipCardProps {
  card: FlipCardData;
}

export const InteractiveFlipCard: React.FC<InteractiveFlipCardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="my-6 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Interactive 3D Threat Inspector
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Click card or flip button to inspect
        </span>
      </div>

      <div
        className="relative w-full min-h-[220px] cursor-pointer select-none"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <div
          className="w-full h-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT FACE */}
          <div
            className="w-full h-full p-6 rounded-2xl glass-card border border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-amber-950/20 flex flex-col justify-between shadow-xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Detected Artifact / Signal
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {card.front.title}
                    </h4>
                  </div>
                </div>
                <span className="badge bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px] font-semibold">
                  Suspicious Signal
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 my-3">
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {card.front.scenario}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Flag: {card.front.indicator}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">
                What does this indicator reveal?
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold border border-amber-500/40 flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3 h-3" /> Flip to Reveal Forensic Breakdown
              </button>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 w-full h-full p-6 rounded-2xl glass-card border border-cyan-500/40 bg-gradient-to-br from-slate-900/95 via-slate-900/98 to-cyan-950/30 flex flex-col justify-between shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      Threat Forensic Breakdown
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {card.back.title}
                    </h4>
                  </div>
                </div>
                <span className="badge bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[10px] font-semibold">
                  Defensive Protocol
                </span>
              </div>

              <div className="space-y-2.5 my-2">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300 block mb-1">🔍 Technical Analysis:</strong>
                  {card.back.analysis}
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                  <strong className="text-emerald-400 block mb-1">🛡️ Actionable Mitigation:</strong>
                  {card.back.mitigation}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">
                Reinforce cognitive threat recognition
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 font-semibold border border-cyan-500/40 flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3 h-3" /> Flip Back to Scenario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
