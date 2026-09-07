// ============================================================
// SE-LAB — Global App Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { UserProfile, SimulationResult, Achievement, UserSettings } from '@/types';
import { achievementsData } from '@/data/simulation/achievements';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* full */ }
}

const defaultProfile: UserProfile = {
  username: 'SEAgent',
  avatar: 'SA',
  level: 1,
  xp: 0,
  totalXp: 0,
  streak: 0,
  lastActiveDate: new Date().toISOString(),
};

const defaultSettings: UserSettings = {
  theme: 'dark',
  animationsEnabled: true,
  soundEnabled: true,
  reducedMotion: false,
};

interface CyberStore {
  userId?: string;
  profile: UserProfile;
  completedList: SimulationResult[];
  achievements: Achievement[];
  settings: UserSettings;
  isHydrated: boolean;

  hydrate: (userId?: string) => void;
  completeSimulation: (result: SimulationResult) => void;
  addXp: (amount: number) => void;
  updateUsername: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetProgress: (userId?: string) => void;
  isSimCompleted: (simId: string) => boolean;
}

const getPrefix = (uid?: string) => (uid ? `selab_${uid}_` : 'selab_guest_');

export const useCyberStore = create<CyberStore>((set, get) => ({
  userId: undefined,
  profile: defaultProfile,
  completedList: [],
  achievements: achievementsData.map(a => ({ ...a, unlocked: false })),
  settings: defaultSettings,
  isHydrated: false,

  hydrate: (userId?: string) => {
    const prefix = getPrefix(userId);
    const profile = loadFromStorage(`${prefix}profile`, defaultProfile);
    const rawCompleted = loadFromStorage<SimulationResult[]>(`${prefix}completed`, []);
    // Normalize any legacy 200-scale scores to standard 100-mark single course/lab scale
    const completedList = rawCompleted.map(c => ({
      ...c,
      score: c.score > 100 ? Math.min(100, Math.round(c.score / 2)) : c.score,
    }));
    const settings = loadFromStorage(`${prefix}settings`, defaultSettings);
    const savedAchievements = loadFromStorage<Achievement[]>(`${prefix}achievements`, []);

    const achievements = achievementsData.map(base => {
      const saved = savedAchievements.find(s => s.id === base.id);
      return saved ? { ...base, unlocked: saved.unlocked, unlockedAt: saved.unlockedAt } : { ...base, unlocked: false };
    });

    profile.level = Math.floor(profile.xp / 500) + 1;
    set({ userId, profile, completedList, achievements, settings, isHydrated: true });
  },

  completeSimulation: (result) => {
    const state = get();
    const prefix = getPrefix(state.userId);
    const existing = state.completedList.find(c => c.id === result.id);
    let newCompleted: SimulationResult[];
    if (existing) {
      newCompleted = state.completedList.map(c =>
        c.id === result.id && result.score > c.score ? result : c
      );
    } else {
      newCompleted = [...state.completedList, result];
    }

    // Standard single lab XP reward: 3★ = 100 XP, 2★ = 70 XP, 1★ = 50 XP
    // On replay, award differential XP if user improves their star rating
    const xpReward = existing
      ? Math.max(0, (result.stars - existing.stars) * 30)
      : (result.stars === 3 ? 100 : result.stars === 2 ? 70 : 50);

    const newXp = state.profile.xp + xpReward;
    const newProfile = {
      ...state.profile,
      xp: newXp,
      totalXp: state.profile.totalXp + xpReward,
      level: Math.floor(newXp / 500) + 1,
      lastActiveDate: new Date().toISOString(),
    };

    const newAchievements = state.achievements.map(ach => {
      if (ach.unlocked) return ach;
      let shouldUnlock = false;
      if (ach.id === 'first-steps' && newCompleted.length >= 1) shouldUnlock = true;
      if (ach.simulationId && newCompleted.some(c => c.numericId === ach.simulationId)) shouldUnlock = true;
      if (ach.simulationsRequired && newCompleted.length >= ach.simulationsRequired) shouldUnlock = true;
      if (ach.xpRequired && newXp >= ach.xpRequired) shouldUnlock = true;
      return shouldUnlock ? { ...ach, unlocked: true, unlockedAt: new Date().toISOString() } : ach;
    });

    set({ profile: newProfile, completedList: newCompleted, achievements: newAchievements });
    saveToStorage(`${prefix}profile`, newProfile);
    saveToStorage(`${prefix}completed`, newCompleted);
    saveToStorage(`${prefix}achievements`, newAchievements);
  },

  addXp: (amount) => {
    const state = get();
    const prefix = getPrefix(state.userId);
    const newXp = state.profile.xp + amount;
    const newProfile = { ...state.profile, xp: newXp, totalXp: state.profile.totalXp + amount, level: Math.floor(newXp / 500) + 1 };
    set({ profile: newProfile });
    saveToStorage(`${prefix}profile`, newProfile);
  },

  updateUsername: (name) => {
    const state = get();
    const prefix = getPrefix(state.userId);
    const newProfile = { ...state.profile, username: name };
    set({ profile: newProfile });
    saveToStorage(`${prefix}profile`, newProfile);
  },

  updateAvatar: (avatar) => {
    const state = get();
    const prefix = getPrefix(state.userId);
    const newProfile = { ...state.profile, avatar };
    set({ profile: newProfile });
    saveToStorage(`${prefix}profile`, newProfile);
  },

  updateSettings: (partial) => {
    const state = get();
    const prefix = getPrefix(state.userId);
    const newSettings = { ...state.settings, ...partial };
    set({ settings: newSettings });
    saveToStorage(`${prefix}settings`, newSettings);
  },

  resetProgress: (userId?: string) => {
    const resetAchievements = achievementsData.map(a => ({ ...a, unlocked: false }));
    set({ userId: undefined, profile: defaultProfile, completedList: [], achievements: resetAchievements });
    if (typeof window !== 'undefined') {
      const uid = userId || get().userId;
      const prefix = getPrefix(uid);
      ['selab_profile', 'selab_completed', 'selab_achievements', `${prefix}profile`, `${prefix}completed`, `${prefix}achievements`].forEach(k => localStorage.removeItem(k));
    }
  },

  isSimCompleted: (simId) => get().completedList.some(c => c.id === simId),
}));
