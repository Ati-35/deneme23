// Streak & Achievement System
// Günlük streak takibi, rozetler, XP sistemi ve seviyeler

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string;
  totalDays: number;
  weeklyStreak: number;
  monthlyStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'health' | 'savings' | 'social' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  hidden?: boolean;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  title: string;
  badge: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'meditation' | 'journal' | 'exercise' | 'water' | 'social';
  xpReward: number;
  completed: boolean;
  expiresAt: string;
}

// Storage Keys
const STORAGE_KEYS = {
  STREAK: '@streak_data',
  ACHIEVEMENTS: '@achievements_data',
  USER_LEVEL: '@user_level',
  DAILY_CHALLENGES: '@daily_challenges',
  CHALLENGE_DATE: '@challenge_date',
};

// Level Titles
const LEVEL_TITLES: { [key: number]: { title: string; badge: string } } = {
  1: { title: 'Başlangıç', badge: '🌱' },
  5: { title: 'Kararlı', badge: '💪' },
  10: { title: 'Savaşçı', badge: '⚔️' },
  15: { title: 'Dayanıklı', badge: '🛡️' },
  20: { title: 'Güçlü', badge: '💎' },
  25: { title: 'Efsane', badge: '👑' },
  30: { title: 'Kahraman', badge: '🦸' },
  40: { title: 'Usta', badge: '🏆' },
  50: { title: 'Efsanevi', badge: '⭐' },
  75: { title: 'İlham Kaynağı', badge: '✨' },
  100: { title: 'Özgür', badge: '🌟' },
};

// All Achievements
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  { id: 'streak_1', name: 'İlk Adım', description: 'İlk gününü tamamla', icon: '🚀', category: 'streak', rarity: 'common', xpReward: 50, requirement: 1, progress: 0, unlocked: false },
  { id: 'streak_3', name: 'Üçlü Başarı', description: '3 gün üst üste sigarasız', icon: '🔥', category: 'streak', rarity: 'common', xpReward: 100, requirement: 3, progress: 0, unlocked: false },
  { id: 'streak_7', name: 'Bir Hafta', description: '7 günlük seri', icon: '📅', category: 'streak', rarity: 'uncommon', xpReward: 250, requirement: 7, progress: 0, unlocked: false },
  { id: 'streak_14', name: 'İki Hafta', description: '14 günlük seri', icon: '💪', category: 'streak', rarity: 'uncommon', xpReward: 500, requirement: 14, progress: 0, unlocked: false },
  { id: 'streak_30', name: 'Bir Ay', description: '30 günlük seri', icon: '🏆', category: 'streak', rarity: 'rare', xpReward: 1000, requirement: 30, progress: 0, unlocked: false },
  { id: 'streak_60', name: 'İki Ay', description: '60 günlük seri', icon: '⭐', category: 'streak', rarity: 'rare', xpReward: 2000, requirement: 60, progress: 0, unlocked: false },
  { id: 'streak_90', name: 'Üç Ay', description: '90 günlük seri', icon: '💎', category: 'streak', rarity: 'epic', xpReward: 3000, requirement: 90, progress: 0, unlocked: false },
  { id: 'streak_180', name: 'Altı Ay', description: '180 günlük seri', icon: '👑', category: 'streak', rarity: 'epic', xpReward: 5000, requirement: 180, progress: 0, unlocked: false },
  { id: 'streak_365', name: 'Bir Yıl', description: '365 günlük seri - ÖZGÜRSÜN!', icon: '🌟', category: 'streak', rarity: 'legendary', xpReward: 10000, requirement: 365, progress: 0, unlocked: false },

  // Health Achievements
  { id: 'health_oxygen', name: 'Temiz Nefes', description: 'Oksijen seviyesi normale döndü', icon: '💨', category: 'health', rarity: 'common', xpReward: 100, requirement: 1, progress: 0, unlocked: false },
  { id: 'health_taste', name: 'Lezzet Avcısı', description: 'Tat ve koku duyusu iyileşti', icon: '👅', category: 'health', rarity: 'uncommon', xpReward: 200, requirement: 2, progress: 0, unlocked: false },
  { id: 'health_heart', name: 'Güçlü Kalp', description: 'Kalp sağlığı iyileşiyor', icon: '❤️', category: 'health', rarity: 'uncommon', xpReward: 300, requirement: 7, progress: 0, unlocked: false },
  { id: 'health_lung', name: 'Temiz Akciğerler', description: 'Akciğer fonksiyonu artmaya başladı', icon: '🫁', category: 'health', rarity: 'rare', xpReward: 500, requirement: 30, progress: 0, unlocked: false },
  { id: 'health_master', name: 'Sağlık Ustası', description: 'Tüm sağlık göstergeleri iyileşti', icon: '🏥', category: 'health', rarity: 'epic', xpReward: 1000, requirement: 90, progress: 0, unlocked: false },

  // Savings Achievements
  { id: 'savings_100', name: 'İlk Tasarruf', description: '₺100 tasarruf', icon: '💰', category: 'savings', rarity: 'common', xpReward: 50, requirement: 100, progress: 0, unlocked: false },
  { id: 'savings_500', name: 'Birikim Başlangıcı', description: '₺500 tasarruf', icon: '💵', category: 'savings', rarity: 'uncommon', xpReward: 150, requirement: 500, progress: 0, unlocked: false },
  { id: 'savings_1000', name: 'Bin Lira', description: '₺1,000 tasarruf', icon: '💎', category: 'savings', rarity: 'rare', xpReward: 300, requirement: 1000, progress: 0, unlocked: false },
  { id: 'savings_5000', name: 'Beş Bin', description: '₺5,000 tasarruf', icon: '🏦', category: 'savings', rarity: 'epic', xpReward: 750, requirement: 5000, progress: 0, unlocked: false },
  { id: 'savings_10000', name: 'On Bin', description: '₺10,000 tasarruf', icon: '💰💰', category: 'savings', rarity: 'legendary', xpReward: 1500, requirement: 10000, progress: 0, unlocked: false },

  // Social Achievements
  { id: 'social_share', name: 'İlham Kaynağı', description: 'İlerlemenizi paylaştınız', icon: '📤', category: 'social', rarity: 'common', xpReward: 50, requirement: 1, progress: 0, unlocked: false },
  { id: 'social_friend', name: 'Arkadaş', description: 'Bir arkadaş eklendi', icon: '👥', category: 'social', rarity: 'common', xpReward: 75, requirement: 1, progress: 0, unlocked: false },
  { id: 'social_support', name: 'Destekçi', description: '5 kişiye destek verdiniz', icon: '🤝', category: 'social', rarity: 'uncommon', xpReward: 200, requirement: 5, progress: 0, unlocked: false },
  { id: 'social_mentor', name: 'Mentor', description: 'Birine mentor oldunuz', icon: '🎓', category: 'social', rarity: 'rare', xpReward: 500, requirement: 1, progress: 0, unlocked: false },
  { id: 'social_leader', name: 'Lider', description: 'Grup kurucusu oldunuz', icon: '🏅', category: 'social', rarity: 'epic', xpReward: 750, requirement: 1, progress: 0, unlocked: false },

  // Special Achievements
  { id: 'special_morning', name: 'Sabah Kahramanı', description: '7 gün sabah sigarası içmeden', icon: '🌅', category: 'special', rarity: 'uncommon', xpReward: 200, requirement: 7, progress: 0, unlocked: false },
  { id: 'special_stress', name: 'Stres Yöneticisi', description: '10 stresli anı atlatın', icon: '😌', category: 'special', rarity: 'rare', xpReward: 400, requirement: 10, progress: 0, unlocked: false },
  { id: 'special_party', name: 'Parti Hayvanı', description: 'Partide sigara içmeden kaldın', icon: '🎉', category: 'special', rarity: 'rare', xpReward: 350, requirement: 1, progress: 0, unlocked: false },
  { id: 'special_coffee', name: 'Kahve Ustası', description: '30 gün kahve içerken sigara içmeden', icon: '☕', category: 'special', rarity: 'epic', xpReward: 600, requirement: 30, progress: 0, unlocked: false },
  { id: 'special_perfect', name: 'Mükemmeliyetçi', description: '30 gün tüm günlük görevleri tamamla', icon: '✨', category: 'special', rarity: 'legendary', xpReward: 2000, requirement: 30, progress: 0, unlocked: false },
];

// Daily Challenges Templates
const DAILY_CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'id' | 'completed' | 'expiresAt'>[] = [
  { title: 'Nefes Egzersizi', description: '5 dakika nefes egzersizi yap', type: 'breathing', xpReward: 30 },
  { title: 'Meditasyon', description: '10 dakika meditasyon yap', type: 'meditation', xpReward: 40 },
  { title: 'Günlük Yaz', description: 'Bugün nasıl hissediyorsun? Yaz!', type: 'journal', xpReward: 25 },
  { title: 'Yürüyüş', description: '15 dakika yürüyüş yap', type: 'exercise', xpReward: 35 },
  { title: 'Su İç', description: '8 bardak su iç', type: 'water', xpReward: 20 },
  { title: 'Destek Ol', description: 'Toplulukta birine destek mesajı gönder', type: 'social', xpReward: 50 },
];

// Calculate XP needed for level
export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Get level info from XP
export function getLevelFromXP(totalXP: number): UserLevel {
  let level = 1;
  let xpRemaining = totalXP;
  
  while (xpRemaining >= calculateXPForLevel(level)) {
    xpRemaining -= calculateXPForLevel(level);
    level++;
  }
  
  const xpToNextLevel = calculateXPForLevel(level);
  
  // Find appropriate title
  let titleInfo = LEVEL_TITLES[1];
  for (const [lvl, info] of Object.entries(LEVEL_TITLES)) {
    if (level >= parseInt(lvl)) {
      titleInfo = info;
    }
  }
  
  return {
    level,
    currentXP: xpRemaining,
    xpToNextLevel,
    totalXP,
    title: titleInfo.title,
    badge: titleInfo.badge,
  };
}

// Streak Functions
export async function getStreak(): Promise<Streak> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting streak:', error);
  }
  
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: '',
    totalDays: 0,
    weeklyStreak: 0,
    monthlyStreak: 0,
  };
}

export async function updateStreak(): Promise<{ streak: Streak; xpEarned: number; newAchievements: Achievement[] }> {
  const streak = await getStreak();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let xpEarned = 0;
  const newAchievements: Achievement[] = [];
  
  if (streak.lastCheckIn === today) {
    // Already checked in today
    return { streak, xpEarned: 0, newAchievements: [] };
  }
  
  if (streak.lastCheckIn === yesterday) {
    // Consecutive day
    streak.currentStreak++;
  } else if (streak.lastCheckIn !== '') {
    // Streak broken
    streak.currentStreak = 1;
  } else {
    // First time
    streak.currentStreak = 1;
  }
  
  streak.lastCheckIn = today;
  streak.totalDays++;
  
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }
  
  // Calculate weekly and monthly streaks
  streak.weeklyStreak = Math.min(streak.currentStreak, 7);
  streak.monthlyStreak = Math.min(streak.currentStreak, 30);
  
  // Base XP for daily check-in
  xpEarned = 10 + streak.currentStreak * 2;
  
  // Check for new achievements
  const achievements = await getAchievements();
  for (const achievement of achievements) {
    if (!achievement.unlocked && achievement.category === 'streak') {
      if (streak.currentStreak >= achievement.requirement) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        xpEarned += achievement.xpReward;
        newAchievements.push(achievement);
      }
    }
  }
  
  // Save updates
  await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  await saveAchievements(achievements);
  await addXP(xpEarned);
  
  return { streak, xpEarned, newAchievements };
}

// Achievement Functions
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting achievements:', error);
  }
  
  return [...ALL_ACHIEVEMENTS];
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
}

export async function updateAchievementProgress(
  achievementId: string, 
  progress: number
): Promise<{ achievement: Achievement | null; unlocked: boolean; xpEarned: number }> {
  const achievements = await getAchievements();
  const achievement = achievements.find(a => a.id === achievementId);
  
  if (!achievement || achievement.unlocked) {
    return { achievement: null, unlocked: false, xpEarned: 0 };
  }
  
  achievement.progress = Math.min(progress, achievement.requirement);
  
  let xpEarned = 0;
  let unlocked = false;
  
  if (achievement.progress >= achievement.requirement) {
    achievement.unlocked = true;
    achievement.unlockedAt = new Date().toISOString();
    xpEarned = achievement.xpReward;
    unlocked = true;
    await addXP(xpEarned);
  }
  
  await saveAchievements(achievements);
  
  return { achievement, unlocked, xpEarned };
}

// User Level Functions
export async function getUserLevel(): Promise<UserLevel> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_LEVEL);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting user level:', error);
  }
  
  return getLevelFromXP(0);
}

export async function addXP(amount: number): Promise<{ levelUp: boolean; newLevel: UserLevel }> {
  const currentLevel = await getUserLevel();
  const newTotalXP = currentLevel.totalXP + amount;
  const newLevel = getLevelFromXP(newTotalXP);
  
  await AsyncStorage.setItem(STORAGE_KEYS.USER_LEVEL, JSON.stringify(newLevel));
  
  return {
    levelUp: newLevel.level > currentLevel.level,
    newLevel,
  };
}

// Daily Challenges Functions
export async function getDailyChallenges(): Promise<DailyChallenge[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_DATE);
    
    if (savedDate === today) {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGES);
      if (data) {
        return JSON.parse(data);
      }
    }
    
    // Generate new challenges for today
    const challenges = generateDailyChallenges();
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGES, JSON.stringify(challenges));
    await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGE_DATE, today);
    
    return challenges;
  } catch (error) {
    console.error('Error getting daily challenges:', error);
    return generateDailyChallenges();
  }
}

function generateDailyChallenges(): DailyChallenge[] {
  const shuffled = [...DAILY_CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return selected.map((template, index) => ({
    ...template,
    id: `daily_${Date.now()}_${index}`,
    completed: false,
    expiresAt: tomorrow.toISOString(),
  }));
}

export async function completeDailyChallenge(challengeId: string): Promise<number> {
  const challenges = await getDailyChallenges();
  const challenge = challenges.find(c => c.id === challengeId);
  
  if (!challenge || challenge.completed) {
    return 0;
  }
  
  challenge.completed = true;
  await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGES, JSON.stringify(challenges));
  
  const { newLevel } = await addXP(challenge.xpReward);
  
  return challenge.xpReward;
}

// Utility: Get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return '#9CA3AF';
    case 'uncommon': return '#22C55E';
    case 'rare': return '#3B82F6';
    case 'epic': return '#A855F7';
    case 'legendary': return '#F59E0B';
    default: return '#9CA3AF';
  }
}

// Utility: Get rarity gradient
export function getRarityGradient(rarity: Achievement['rarity']): [string, string] {
  switch (rarity) {
    case 'common': return ['#9CA3AF', '#6B7280'];
    case 'uncommon': return ['#22C55E', '#16A34A'];
    case 'rare': return ['#3B82F6', '#2563EB'];
    case 'epic': return ['#A855F7', '#7C3AED'];
    case 'legendary': return ['#F59E0B', '#D97706'];
    default: return ['#9CA3AF', '#6B7280'];
  }
}

export default {
  getStreak,
  updateStreak,
  getAchievements,
  updateAchievementProgress,
  getUserLevel,
  addXP,
  getDailyChallenges,
  completeDailyChallenge,
  getLevelFromXP,
  getRarityColor,
  getRarityGradient,
  ALL_ACHIEVEMENTS,
};




