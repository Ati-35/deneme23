// User Store - Gamification & Progress State
// XP, Level, Streak, Daily Tasks, User Profile

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface DailyTask {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  completed: boolean;
  completedAt?: Date;
  category: 'health' | 'mental' | 'social' | 'education';
}

export interface LimitedTask {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  bonusXp: number;
  icon: string;
  expiresAt: Date;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  quitDate: Date;
  cigarettesPerDay: number;
  pricePerPack: number;
  cigarettesPerPack: number;
}

export interface UserState {
  // Profile
  profile: UserProfile;
  
  // Gamification
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  
  // Tasks
  dailyTasks: DailyTask[];
  limitedTask: LimitedTask | null;
  completedTasksToday: number;
  
  // Statistics
  totalCigarettesAvoided: number;
  totalMoneySaved: number;
  totalMinutesGained: number;
  
  // Gifts
  lastGiftDate: string | null;
  availableGift: boolean;
  
  // Actions
  setProfile: (profile: Partial<UserProfile>) => void;
  addXP: (amount: number) => void;
  completeTask: (taskId: string) => void;
  completeLimitedTask: () => void;
  checkAndUpdateStreak: () => void;
  resetDailyTasks: () => void;
  generateLimitedTask: () => void;
  claimDailyGift: () => void;
  getLevel: (xp: number) => number;
  getXPForNextLevel: () => number;
  getXPProgress: () => number;
}

// Level thresholds
const LEVEL_THRESHOLDS = [
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
  30000,  // Level 15
];

// Default daily tasks
const generateDailyTasks = (): DailyTask[] => [
  {
    id: 'morning_check',
    title: 'Sabah Check-in',
    description: 'Güne nasıl başladığını kaydet',
    xpReward: 10,
    icon: 'sunny-outline',
    completed: false,
    category: 'mental',
  },
  {
    id: 'breathing_exercise',
    title: 'Nefes Egzersizi',
    description: '5 dakika nefes egzersizi yap',
    xpReward: 15,
    icon: 'fitness-outline',
    completed: false,
    category: 'health',
  },
  {
    id: 'journal_entry',
    title: 'Günlük Yaz',
    description: 'Düşüncelerini ve hislerini kaydet',
    xpReward: 20,
    icon: 'book-outline',
    completed: false,
    category: 'mental',
  },
  {
    id: 'craving_logged',
    title: 'İstek Kaydı',
    description: 'Bir sigara isteğini başarıyla kaydet',
    xpReward: 25,
    icon: 'checkmark-circle-outline',
    completed: false,
    category: 'health',
  },
  {
    id: 'community_visit',
    title: 'Topluluk Ziyareti',
    description: 'Topluluk bölümünü ziyaret et',
    xpReward: 10,
    icon: 'people-outline',
    completed: false,
    category: 'social',
  },
];

// Limited task templates
const LIMITED_TASK_TEMPLATES = [
  {
    title: 'Nefes Egzersizi Serisi',
    description: '3 farklı nefes egzersizi tamamla',
    xpReward: 30,
    bonusXp: 50,
    icon: 'fitness-outline',
  },
  {
    title: 'Meditasyon Ustası',
    description: '10 dakikalık meditasyon yap',
    xpReward: 25,
    bonusXp: 40,
    icon: 'leaf-outline',
  },
  {
    title: 'Bilgi Avcısı',
    description: '3 eğitim içeriği izle',
    xpReward: 20,
    bonusXp: 35,
    icon: 'school-outline',
  },
  {
    title: 'Sosyal Kelebek',
    description: 'Toplulukta 2 yorum yap',
    xpReward: 15,
    bonusXp: 30,
    icon: 'chatbubbles-outline',
  },
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial Profile
      profile: {
        name: 'Kullanıcı',
        quitDate: new Date(),
        cigarettesPerDay: 20,
        pricePerPack: 50,
        cigarettesPerPack: 20,
      },
      
      // Initial Gamification
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      
      // Initial Tasks
      dailyTasks: generateDailyTasks(),
      limitedTask: null,
      completedTasksToday: 0,
      
      // Initial Statistics
      totalCigarettesAvoided: 0,
      totalMoneySaved: 0,
      totalMinutesGained: 0,
      
      // Gifts
      lastGiftDate: null,
      availableGift: true,
      
      // Actions
      setProfile: (profile) =>
        set((state) => ({
          profile: { ...state.profile, ...profile },
        })),

      getLevel: (xp: number) => {
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
          if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
          }
        }
        return 1;
      },

      getXPForNextLevel: () => {
        const { level } = get();
        if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
        return LEVEL_THRESHOLDS[level];
      },

      getXPProgress: () => {
        const { xp, level } = get();
        const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
        const nextLevelXP = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
        return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
      },

      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = state.getLevel(newXP);
          return {
            xp: newXP,
            level: newLevel,
          };
        }),

      completeTask: (taskId) =>
        set((state) => {
          const taskIndex = state.dailyTasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1 || state.dailyTasks[taskIndex].completed) return state;

          const task = state.dailyTasks[taskIndex];
          const updatedTasks = [...state.dailyTasks];
          updatedTasks[taskIndex] = {
            ...task,
            completed: true,
            completedAt: new Date(),
          };

          const newXP = state.xp + task.xpReward;
          const newLevel = state.getLevel(newXP);

          return {
            dailyTasks: updatedTasks,
            xp: newXP,
            level: newLevel,
            completedTasksToday: state.completedTasksToday + 1,
          };
        }),

      completeLimitedTask: () =>
        set((state) => {
          if (!state.limitedTask || state.limitedTask.completed) return state;
          
          const totalXP = state.limitedTask.xpReward + state.limitedTask.bonusXp;
          const newXP = state.xp + totalXP;
          const newLevel = state.getLevel(newXP);

          return {
            limitedTask: { ...state.limitedTask, completed: true },
            xp: newXP,
            level: newLevel,
          };
        }),

      checkAndUpdateStreak: () =>
        set((state) => {
          const today = new Date().toDateString();
          const lastActive = state.lastActiveDate;

          if (lastActive === today) {
            return state; // Already updated today
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();

          let newStreak = state.streak;
          if (lastActive === yesterdayStr) {
            // Consecutive day
            newStreak = state.streak + 1;
          } else if (lastActive !== today) {
            // Streak broken (unless it's the first day)
            newStreak = lastActive ? 1 : state.streak + 1;
          }

          return {
            streak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActiveDate: today,
          };
        }),

      resetDailyTasks: () =>
        set(() => ({
          dailyTasks: generateDailyTasks(),
          completedTasksToday: 0,
        })),

      generateLimitedTask: () =>
        set(() => {
          const template = LIMITED_TASK_TEMPLATES[
            Math.floor(Math.random() * LIMITED_TASK_TEMPLATES.length)
          ];
          
          // Task expires in 2-4 hours
          const hoursToExpire = 2 + Math.floor(Math.random() * 3);
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + hoursToExpire);

          return {
            limitedTask: {
              id: `limited_${Date.now()}`,
              ...template,
              expiresAt,
              completed: false,
            },
          };
        }),

      claimDailyGift: () =>
        set((state) => {
          const today = new Date().toDateString();
          if (state.lastGiftDate === today) return state;

          // Add bonus XP as gift
          const giftXP = 25 + Math.floor(Math.random() * 25);
          const newXP = state.xp + giftXP;
          const newLevel = state.getLevel(newXP);

          return {
            lastGiftDate: today,
            availableGift: false,
            xp: newXP,
            level: newLevel,
          };
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        dailyTasks: state.dailyTasks,
        completedTasksToday: state.completedTasksToday,
        totalCigarettesAvoided: state.totalCigarettesAvoided,
        totalMoneySaved: state.totalMoneySaved,
        totalMinutesGained: state.totalMinutesGained,
        lastGiftDate: state.lastGiftDate,
        availableGift: state.availableGift,
      }),
    }
  )
);

export default useUserStore;

