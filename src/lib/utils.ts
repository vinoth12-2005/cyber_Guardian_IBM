import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scorePassword(password = "") {
  let score = 0;

  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}

export const strengthMeta = [
  { label: "Very Weak", color: "bg-red-500", text: "text-red-400" },
  { label: "Weak", color: "bg-orange-500", text: "text-orange-400" },
  { label: "Medium", color: "bg-yellow-500", text: "text-yellow-400" },
  { label: "Strong", color: "bg-blue-500", text: "text-blue-400" },
  { label: "Very Strong", color: "bg-green-500", text: "text-green-400" },
  { label: "Very Strong", color: "bg-green-500", text: "text-green-400" },
];

export function generateStrongPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
}

export function getRank(xp: number) {
  const ranks = [
    { name: 'Apprentice', minXp: 0, icon: '🛡️' },
    { name: 'Analyst', minXp: 300, icon: '🔍' },
    { name: 'Inspector', minXp: 800, icon: '🔬' },
    { name: 'Defender', minXp: 1500, icon: '⚔️' },
    { name: 'Guardian', minXp: 2500, icon: '👑' },
    { name: 'Elite', minXp: 3500, icon: '⚡' },
  ];
  let current = ranks[0];
  for (const r of ranks) {
    if (xp >= r.minXp) current = r;
  }
  return current;
}

export function getLevel(xp: number) {
  return Math.floor(xp / 500) + 1;
}

export function getLevelProgress(xp: number) {
  return (xp % 500) / 500;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateStars(correct: number, total: number): number {
  const ratio = correct / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

