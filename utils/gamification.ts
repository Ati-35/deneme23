// Gamification Utilities
// XP hesaplama, level sistemi, streak yönetimi

import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { tr } from 'date-fns/locale';

// Level thresholds - XP needed for each level
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  1750,   // Level 6
  2750,   // Level 7
  4000,   // Level 8
  5500,   // Level 9
  7500,   // Level 10
  10000,  // Level 11
  13000,  // Level 12
  17000,  // Level 13
  22000,  // Level 14
  30000,  // Level 15 (max)
];

// Level names
export const LEVEL_NAMES: Record<number, string> = {
  1: 'Yeni Başlayan',
  2: 'Kararlı',
  3: 'Azimli',
  4: 'Güçlenen',
  5: 'Yükselen Yıldız',
  6: 'Deneyimli',
  7: 'Usta Adayı',
  8: 'Usta',
  9: 'Uzman',
  10: 'Parlayan Yıldız',
  11: 'Efsane',
  12: 'Şampiyon',
  13: 'Kahraman',
  14: 'Efsanevi',
  15: 'Ölümsüz',
};

// Level colors
export const LEVEL_COLORS: Record<number, string> = {
  1: '#94A3B8',  // Slate
  2: '#64748B',  // Slate darker
  3: '#22C55E',  // Green
  4: '#16A34A',  // Green darker
  5: '#3B82F6',  // Blue
  6: '#2563EB',  // Blue darker
  7: '#8B5CF6',  // Purple
  8: '#7C3AED',  // Purple darker
  9: '#F59E0B',  // Amber
  10: '#D97706', // Amber darker
  11: '#EC4899', // Pink
  12: '#DB2777', // Pink darker
  13: '#EF4444', // Red
  14: '#DC2626', // Red darker
  15: '#FFD700', // Gold
};

// Calculate level from XP
export const calculateLevel = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

// Get XP needed for next level
export const getXPForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }
  return LEVEL_THRESHOLDS[currentLevel];
};

// Get current level progress percentage
export const getLevelProgress = (xp: number, level: number): number => {
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

// Get level name
export const getLevelName = (level: number): string => {
  return LEVEL_NAMES[level] || LEVEL_NAMES[15];
};

// Get level color
export const getLevelColor = (level: number): string => {
  return LEVEL_COLORS[level] || LEVEL_COLORS[15];
};

// Calculate streak bonus XP
export const getStreakBonus = (streak: number): number => {
  if (streak < 3) return 0;
  if (streak < 7) return 5;
  if (streak < 14) return 10;
  if (streak < 30) return 20;
  if (streak < 60) return 35;
  if (streak < 90) return 50;
  return 75;
};

// Get streak milestone info
export interface StreakMilestone {
  days: number;
  title: string;
  icon: string;
  color: string;
  reward: number;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, title: 'Başlangıç', icon: '🌱', color: '#22C55E', reward: 25 },
  { days: 7, title: 'Haftalık', icon: '⭐', color: '#3B82F6', reward: 50 },
  { days: 14, title: 'İki Haftalık', icon: '🏆', color: '#8B5CF6', reward: 100 },
  { days: 30, title: 'Aylık', icon: '🥇', color: '#F59E0B', reward: 200 },
  { days: 60, title: 'İki Aylık', icon: '💎', color: '#EC4899', reward: 400 },
  { days: 90, title: 'Çeyrek Yıl', icon: '👑', color: '#FFD700', reward: 750 },
  { days: 180, title: 'Yarı Yıl', icon: '🌟', color: '#FFD700', reward: 1500 },
  { days: 365, title: 'Yıllık', icon: '🎖️', color: '#FFD700', reward: 5000 },
];

// Get next streak milestone
export const getNextStreakMilestone = (currentStreak: number): StreakMilestone | null => {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone.days > currentStreak) {
      return milestone;
    }
  }
  return null;
};

// Get days until next milestone
export const getDaysUntilNextMilestone = (currentStreak: number): number => {
  const nextMilestone = getNextStreakMilestone(currentStreak);
  if (!nextMilestone) return 0;
  return nextMilestone.days - currentStreak;
};

// Calculate time since quit
export interface TimeSinceQuit {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export const calculateTimeSinceQuit = (quitDate: Date): TimeSinceQuit => {
  const now = new Date();
  const days = differenceInDays(now, quitDate);
  const totalHours = differenceInHours(now, quitDate);
  const totalMinutes = differenceInMinutes(now, quitDate);
  const totalSeconds = differenceInSeconds(now, quitDate);
  
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
};

// Calculate money saved
export const calculateMoneySaved = (
  daysSinceQuit: number,
  cigarettesPerDay: number,
  pricePerPack: number,
  cigarettesPerPack: number
): number => {
  const cigarettesAvoided = daysSinceQuit * cigarettesPerDay;
  const packsAvoided = cigarettesAvoided / cigarettesPerPack;
  return Math.round(packsAvoided * pricePerPack);
};

// Calculate cigarettes not smoked
export const calculateCigarettesAvoided = (
  daysSinceQuit: number,
  cigarettesPerDay: number
): number => {
  return daysSinceQuit * cigarettesPerDay;
};

// Calculate life regained (based on 11 minutes per cigarette)
export const calculateLifeRegained = (cigarettesAvoided: number): {
  minutes: number;
  hours: number;
  days: number;
} => {
  const minutes = cigarettesAvoided * 11;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return { minutes, hours, days };
};

// Format number with thousands separator
export const formatNumber = (num: number): string => {
  return num.toLocaleString('tr-TR');
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₺${formatNumber(amount)}`;
};

// Format time duration
export const formatDuration = (
  days: number,
  hours: number,
  minutes: number,
  seconds?: number
): string => {
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}dk`);
  if (seconds !== undefined && seconds > 0) parts.push(`${seconds}sn`);
  
  return parts.join(' ') || '0dk';
};

// Get comparison with average users
export interface ComparisonStats {
  moneySaved: number;
  avgMoneySaved: number;
  percentBetter: number;
  cigarettesAvoided: number;
  avgCigarettesAvoided: number;
  streakDays: number;
  avgStreakDays: number;
}

export const getComparisonStats = (
  daysSinceQuit: number,
  cigarettesPerDay: number,
  pricePerPack: number,
  cigarettesPerPack: number,
  streak: number
): ComparisonStats => {
  const moneySaved = calculateMoneySaved(daysSinceQuit, cigarettesPerDay, pricePerPack, cigarettesPerPack);
  const cigarettesAvoided = calculateCigarettesAvoided(daysSinceQuit, cigarettesPerDay);
  
  // Average user stats (simulated)
  const avgDays = Math.max(daysSinceQuit * 0.75, 1);
  const avgMoneySaved = calculateMoneySaved(avgDays, 15, 45, 20);
  const avgCigarettesAvoided = calculateCigarettesAvoided(avgDays, 15);
  const avgStreakDays = Math.floor(streak * 0.7);

  const percentBetter = avgMoneySaved > 0 
    ? Math.round(((moneySaved - avgMoneySaved) / avgMoneySaved) * 100)
    : 0;

  return {
    moneySaved,
    avgMoneySaved,
    percentBetter,
    cigarettesAvoided,
    avgCigarettesAvoided,
    streakDays: streak,
    avgStreakDays,
  };
};

export default {
  calculateLevel,
  getXPForNextLevel,
  getLevelProgress,
  getLevelName,
  getLevelColor,
  getStreakBonus,
  getNextStreakMilestone,
  getDaysUntilNextMilestone,
  calculateTimeSinceQuit,
  calculateMoneySaved,
  calculateCigarettesAvoided,
  calculateLifeRegained,
  formatNumber,
  formatCurrency,
  formatDuration,
  getComparisonStats,
};

