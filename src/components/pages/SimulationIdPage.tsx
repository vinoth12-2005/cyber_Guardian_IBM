import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { seScenarios } from '@/data/simulation/se-scenarios';
import SimulationClient from '@/components/simulation/SimulationClient';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function SimulationIdPage() {
  const { id } = useParams<{ id: string }>();

  const sim = seScenarios.find(s => 
    s.numericId === Number(id) || 
    s.id === id || 
    s.id.toLowerCase() === id?.toLowerCase()
  );

  if (!sim) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass p-8 rounded-2xl border border-red-500/30 space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Simulation Not Found</h2>
          <p className="text-xs text-slate-400">
            The requested simulation scenario ID <span className="font-mono text-cyan-400">"{id}"</span> could not be found.
          </p>
          <Link
            to="/simulation"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Simulation Matrix
          </Link>
        </div>
      </div>
    );
  }

  return <SimulationClient sim={sim} />;
}

export default SimulationIdPage;
