// ============================================================
// SE-LAB — Simulation Engine Store (Zustand)
// Handles: event engine, risk engine, scoring, attacker sim,
//          session state, hints, learning cards, debrief
// ============================================================

import { create } from 'zustand';
import type {
  SEEvent, SEEventType, AttackerEvent, SimulationSession,
  RiskLevel, SESimulation
} from '@/types';

// ---- Risk score thresholds ----
const riskFromScore = (n: number): RiskLevel => {
  if (n <= 10) return 'SAFE';
  if (n <= 30) return 'LOW';
  if (n <= 55) return 'MEDIUM';
  if (n <= 75) return 'HIGH';
  return 'CRITICAL';
};

// ---- Grade from score ----
export const gradeFromScore = (s: number): string => {
  if (s >= 95) return 'A+';
  if (s >= 88) return 'A';
  if (s >= 80) return 'B+';
  if (s >= 72) return 'B';
  if (s >= 64) return 'C+';
  if (s >= 55) return 'C';
  return 'D';
};

// ---- Friendly timestamp ----
const tsNow = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
};

const makeId = (): string => Math.random().toString(36).slice(2, 9);

// ---- Default session ----
const defaultSession = (simId: string): SimulationSession => ({
  sessionId: `SIM-${Date.now()}`,
  simulationId: simId,
  startedAt: new Date().toISOString(),
  currentState: 'INITIAL',
  riskLevel: 'SAFE',
  riskScore: 0,
  score: 100,
  events: [],
  attackerEvents: [],
  exposedData: [],
  hintsUsed: 0,
  investigativeActions: 0,
  defensiveActions: 0,
  branchTaken: null,
  isComplete: false,
});

// ---- Event label map for attacker dashboard ----
const attackerLabels: Partial<Record<SEEventType, string>> = {
  SIMULATION_STARTED:      'Target session initiated',
  MESSAGE_OPENED:          'Victim opened message',
  SENDER_INSPECTED:        'Victim inspected sender (on guard)',
  LINK_HOVERED:            'Victim hovered over malicious link',
  LINK_OPENED:             'Victim clicked malicious link ⚠',
  URL_INSPECTED:           'Victim inspected URL destination',
  ATTACHMENT_OPENED:       'Victim opened attachment',
  HEADER_VIEWED:           'Victim viewed full message headers',
  FORM_OPENED:             'Victim opened credential form',
  FORM_FIELD_FOCUSED:      'Victim focused on a form field',
  SYNTHETIC_DATA_ENTERED:  'Victim entering synthetic credentials',
  FORM_SUBMITTED:          'CREDENTIAL SUBMISSION DETECTED ✓',
  CREDENTIAL_EXPOSED:      'SYNTHETIC CREDENTIALS CAPTURED ✓',
  PERMISSION_VIEWED:       'Victim reviewing OAuth permissions',
  PERMISSION_ACCEPTED:     'OAUTH CONSENT GRANTED ✓',
  PERMISSION_REJECTED:     'Target denied permissions (defended)',
  QR_SCANNED:              'QR code scanned — URL decoded',
  CALL_STARTED:            'Vishing call connected',
  CALL_ENDED:              'Target ended call',
  MFA_APPROVED:            'MFA PUSH APPROVED — Access granted ✓',
  MFA_DENIED:              'Target denied MFA push',
  MFA_REPORTED:            'Target reported suspicious MFA (defended)',
  MESSAGE_REPLIED:         'Target replied to message',
  REPORT_FILED:            'Target filed a security report (defended)',
  BLOCK_APPLIED:           'Target blocked sender (defended)',
  VERIFICATION_PERFORMED:  'Target verified through independent channel (defended)',
  WARNING_TRIGGERED:       'Warning triggered — target may be suspicious',
  ATTACKER_DATA_EXPOSED:   'Data package received',
  DEFENSE_ACTION:          'Defensive action detected — pausing campaign',
  BRANCH_TAKEN:            'Target made a decision',
  SIMULATION_COMPLETED:    'Target completed scenario',
  SIMULATION_FAILED:       'Campaign concluded',
};

// ---- Store interface ----
interface SimulationStore {
  session: SimulationSession | null;
  currentSim: SESimulation | null;
  activeHintLevel: 0 | 1 | 2 | 3;
  activeLearningCard: string | null;  // event type that triggered last card
  showDebrief: boolean;

  // Actions
  startSession: (sim: SESimulation) => void;
  fireEvent: (
    type: SEEventType,
    opts?: {
      label?: string;
      riskDelta?: number;
      scoreDelta?: number;
      isInvestigative?: boolean;
      isDefensive?: boolean;
      isBranch?: boolean;
      attackerSees?: string;
      exposedData?: string[];
      nextState?: string;
    }
  ) => void;
  requestHint: () => void;
  completeSession: (outcome: 'safe' | 'compromised' | 'partial') => void;
  resetSession: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  session: null,
  currentSim: null,
  activeHintLevel: 0,
  activeLearningCard: null,
  showDebrief: false,

  startSession: (sim) => {
    const sess = defaultSession(sim.id);
    set({ session: sess, currentSim: sim, activeHintLevel: 0, activeLearningCard: null, showDebrief: false });
    // Fire the SIMULATION_STARTED event
    get().fireEvent('SIMULATION_STARTED', { label: 'Simulation started', riskDelta: 0, scoreDelta: 0 });
  },

  fireEvent: (type, opts = {}) => {
    const state = get();
    if (!state.session) return;

    const {
      label = attackerLabels[type] ?? type,
      riskDelta = 0,
      scoreDelta = 0,
      isInvestigative = false,
      isDefensive = false,
      isBranch = false,
      attackerSees,
      exposedData = [],
      nextState,
    } = opts;

    const event: SEEvent = {
      id: makeId(),
      type,
      timestamp: tsNow(),
      label,
      riskDelta,
      scoreDelta,
      isInvestigative,
      isDefensive,
      isBranch,
      attackerSees,
      exposedData,
    };

    const atkEvent: AttackerEvent = {
      timestamp: tsNow(),
      label: attackerSees ?? attackerLabels[type] ?? label,
      severity: riskDelta >= 20 ? 'critical' : riskDelta >= 10 ? 'warn' : 'info',
    };

    const sess = state.session;
    const newRiskScore = Math.max(0, Math.min(100, sess.riskScore + riskDelta));
    const newScore = Math.max(0, Math.min(100, sess.score + scoreDelta));
    const newExposed = [...sess.exposedData, ...exposedData.filter(d => !sess.exposedData.includes(d))];

    const updatedSession: SimulationSession = {
      ...sess,
      riskScore: newRiskScore,
      riskLevel: riskFromScore(newRiskScore),
      score: newScore,
      events: [...sess.events, event],
      attackerEvents: [...sess.attackerEvents, atkEvent],
      exposedData: newExposed,
      investigativeActions: sess.investigativeActions + (isInvestigative ? 1 : 0),
      defensiveActions: sess.defensiveActions + (isDefensive ? 1 : 0),
      branchTaken: isBranch ? type : sess.branchTaken,
      currentState: nextState ?? sess.currentState,
    };

    set({
      session: updatedSession,
      activeLearningCard: type,
    });
  },

  requestHint: () => {
    const state = get();
    if (!state.session || !state.currentSim) return;
    const nextLevel = Math.min(3, state.activeHintLevel + 1) as 0 | 1 | 2 | 3;
    const hint = state.currentSim.hints.find(h => h.level === nextLevel);
    if (hint) {
      const newScore = Math.max(0, state.session.score - hint.scorePenalty);
      set({
        activeHintLevel: nextLevel,
        session: {
          ...state.session,
          score: newScore,
          hintsUsed: state.session.hintsUsed + 1,
        },
      });
    }
  },

  completeSession: (outcome) => {
    const state = get();
    if (!state.session) return;
    set({
      session: {
        ...state.session,
        isComplete: true,
        completedAt: new Date().toISOString(),
        currentState: outcome === 'safe' ? 'DEFENDED' : 'COMPROMISED',
      },
      showDebrief: true,
    });
  },

  resetSession: () => {
    const sim = get().currentSim;
    if (sim) {
      get().startSession(sim);
    }
  },
}));
