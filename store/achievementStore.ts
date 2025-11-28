// Achievement Store - Badges, Milestones, Unlocks
// Rozet sistemi, milestone takibi, başarım durumları

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'health' | 'social' | 'milestone' | 'special';
  requirement: number;
  requirementType: 'days' | 'xp' | 'tasks' | 'level' | 'special';
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  healthBenefit: string;
  icon: string;
  color: string;
  daysRequired: number;
  reached: boolean;
  reachedAt?: Date;
}

export interface AchievementState {
  achievements: Achievement[];
  milestones: Milestone[];
  totalAchievements: number;
  unlockedCount: number;
  recentUnlock: Achievement | null;
  
  // Actions
  checkAchievements: (stats: { days: number; xp: number; level: number; tasks: number }) => Achievement | null;
  unlockAchievement: (achievementId: string) => void;
  checkMilestones: (daysSinceQuit: number) => Milestone | null;
  clearRecentUnlock: () => void;
  getAchievementProgress: (achievementId: string) => number;
}

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'first_day',
    title: 'İlk Adım',
    description: 'İlk sigarasız gününü tamamla',
    icon: '🌱',
    category: 'streak',
    requirement: 1,
    requirementType: 'days',
    xpReward: 50,
    rarity: 'common',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'week_warrior',
    title: 'Hafta Savaşçısı',
    description: '7 gün üst üste sigarasız kal',
    icon: '⚔️',
    category: 'streak',
    requirement: 7,
    requirementType: 'days',
    xpReward: 100,
    rarity: 'common',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'two_week_champion',
    title: 'İki Hafta Şampiyonu',
    description: '14 gün üst üste sigarasız kal',
    icon: '🏆',
    category: 'streak',
    requirement: 14,
    requirementType: 'days',
    xpReward: 200,
    rarity: 'rare',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'month_master',
    title: 'Ay Ustası',
    description: '30 gün üst üste sigarasız kal',
    icon: '🥇',
    category: 'streak',
    requirement: 30,
    requirementType: 'days',
    xpReward: 500,
    rarity: 'epic',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'quarter_legend',
    title: 'Çeyrek Yıl Efsanesi',
    description: '90 gün sigarasız kal',
    icon: '👑',
    category: 'streak',
    requirement: 90,
    requirementType: 'days',
    xpReward: 1000,
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'year_immortal',
    title: 'Yıllık Ölümsüz',
    description: '365 gün sigarasız kal',
    icon: '🌟',
    category: 'streak',
    requirement: 365,
    requirementType: 'days',
    xpReward: 5000,
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
  },
  
  // XP Achievements
  {
    id: 'xp_beginner',
    title: 'XP Avcısı',
    description: '100 XP kazan',
    icon: '✨',
    category: 'milestone',
    requirement: 100,
    requirementType: 'xp',
    xpReward: 25,
    rarity: 'common',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'xp_collector',
    title: 'XP Koleksiyoncusu',
    description: '500 XP kazan',
    icon: '💫',
    category: 'milestone',
    requirement: 500,
    requirementType: 'xp',
    xpReward: 75,
    rarity: 'rare',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'xp_master',
    title: 'XP Ustası',
    description: '2000 XP kazan',
    icon: '🌠',
    category: 'milestone',
    requirement: 2000,
    requirementType: 'xp',
    xpReward: 200,
    rarity: 'epic',
    unlocked: false,
    progress: 0,
  },
  
  // Level Achievements
  {
    id: 'level_5',
    title: 'Yükselen Yıldız',
    description: 'Seviye 5\'e ulaş',
    icon: '⭐',
    category: 'milestone',
    requirement: 5,
    requirementType: 'level',
    xpReward: 100,
    rarity: 'common',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'level_10',
    title: 'Parlayan Yıldız',
    description: 'Seviye 10\'a ulaş',
    icon: '🌟',
    category: 'milestone',
    requirement: 10,
    requirementType: 'level',
    xpReward: 300,
    rarity: 'epic',
    unlocked: false,
    progress: 0,
  },
  
  // Task Achievements
  {
    id: 'task_starter',
    title: 'Görev Başlatıcı',
    description: 'İlk görevini tamamla',
    icon: '✅',
    category: 'milestone',
    requirement: 1,
    requirementType: 'tasks',
    xpReward: 15,
    rarity: 'common',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'task_enthusiast',
    title: 'Görev Tutkunu',
    description: '10 görev tamamla',
    icon: '📋',
    category: 'milestone',
    requirement: 10,
    requirementType: 'tasks',
    xpReward: 50,
    rarity: 'common',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'task_master',
    title: 'Görev Ustası',
    description: '50 görev tamamla',
    icon: '🎯',
    category: 'milestone',
    requirement: 50,
    requirementType: 'tasks',
    xpReward: 150,
    rarity: 'rare',
    unlocked: false,
    progress: 0,
  },
  
  // Special Achievements
  {
    id: 'early_bird',
    title: 'Erken Kuş',
    description: 'Sabah 6\'dan önce bir görevi tamamla',
    icon: '🐦',
    category: 'special',
    requirement: 1,
    requirementType: 'special',
    xpReward: 30,
    rarity: 'rare',
    unlocked: false,
    progress: 0,
  },
  {
    id: 'night_owl',
    title: 'Gece Kuşu',
    description: 'Gece 11\'den sonra bir görevi tamamla',
    icon: '🦉',
    category: 'special',
    requirement: 1,
    requirementType: 'special',
    xpReward: 30,
    rarity: 'rare',
    unlocked: false,
    progress: 0,
  },
];

// Health milestones
const MILESTONES: Milestone[] = [
  {
    id: 'milestone_20min',
    title: 'Kalp Atışı Normalleşiyor',
    description: 'Kalp atış hızınız ve kan basıncınız düşmeye başlıyor.',
    timeframe: '20 dakika',
    healthBenefit: 'Kalp ve dolaşım sistemi rahatlamaya başlıyor.',
    icon: 'heart',
    color: '#EF4444',
    daysRequired: 0,
    reached: true,
    reachedAt: new Date(),
  },
  {
    id: 'milestone_12hour',
    title: 'Karbonmonoksit Düşüyor',
    description: 'Kandaki karbonmonoksit seviyesi normale dönüyor.',
    timeframe: '12 saat',
    healthBenefit: 'Oksijen taşıma kapasitesi artıyor.',
    icon: 'cloud-outline',
    color: '#06B6D4',
    daysRequired: 1,
    reached: false,
  },
  {
    id: 'milestone_2day',
    title: 'Tat ve Koku İyileşiyor',
    description: 'Tat ve koku alma duyularınız keskinleşmeye başlıyor.',
    timeframe: '2 gün',
    healthBenefit: 'Sinir uçları yenilenmeye başlıyor.',
    icon: 'restaurant-outline',
    color: '#F59E0B',
    daysRequired: 2,
    reached: false,
  },
  {
    id: 'milestone_3day',
    title: 'Nikotin Temizleniyor',
    description: 'Vücuttaki nikotin tamamen temizleniyor.',
    timeframe: '3 gün',
    healthBenefit: 'Nefes almak kolaylaşıyor.',
    icon: 'fitness-outline',
    color: '#22C55E',
    daysRequired: 3,
    reached: false,
  },
  {
    id: 'milestone_2week',
    title: 'Akciğer Fonksiyonu Artıyor',
    description: 'Akciğer fonksiyonu %30\'a kadar artmaya başlıyor.',
    timeframe: '2 hafta',
    healthBenefit: 'Egzersiz yapmak kolaylaşıyor.',
    icon: 'pulse-outline',
    color: '#3B82F6',
    daysRequired: 14,
    reached: false,
  },
  {
    id: 'milestone_1month',
    title: 'Silia Yenileniyor',
    description: 'Akciğerlerdeki silia (tüycükler) yenilenmeye başlıyor.',
    timeframe: '1 ay',
    healthBenefit: 'Enfeksiyon riski azalıyor.',
    icon: 'leaf-outline',
    color: '#8B5CF6',
    daysRequired: 30,
    reached: false,
  },
  {
    id: 'milestone_3month',
    title: 'Dolaşım Sistemi İyileşiyor',
    description: 'Dolaşım sistemi önemli ölçüde iyileşiyor.',
    timeframe: '3 ay',
    healthBenefit: 'Kalp krizi riski düşmeye başlıyor.',
    icon: 'heart-circle-outline',
    color: '#EC4899',
    daysRequired: 90,
    reached: false,
  },
  {
    id: 'milestone_1year',
    title: 'Kalp Riski %50 Düşüyor',
    description: 'Koroner kalp hastalığı riski yarıya iniyor.',
    timeframe: '1 yıl',
    healthBenefit: 'Kalp sağlığı sigara içmeyenlerinkine yaklaşıyor.',
    icon: 'shield-checkmark-outline',
    color: '#FFD700',
    daysRequired: 365,
    reached: false,
  },
];

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: ACHIEVEMENTS,
      milestones: MILESTONES,
      totalAchievements: ACHIEVEMENTS.length,
      unlockedCount: 0,
      recentUnlock: null,

      checkAchievements: (stats) => {
        const { achievements } = get();
        let unlockedAchievement: Achievement | null = null;

        const updatedAchievements = achievements.map((achievement) => {
          if (achievement.unlocked) return achievement;

          let progress = 0;
          let shouldUnlock = false;

          switch (achievement.requirementType) {
            case 'days':
              progress = stats.days;
              shouldUnlock = stats.days >= achievement.requirement;
              break;
            case 'xp':
              progress = stats.xp;
              shouldUnlock = stats.xp >= achievement.requirement;
              break;
            case 'level':
              progress = stats.level;
              shouldUnlock = stats.level >= achievement.requirement;
              break;
            case 'tasks':
              progress = stats.tasks;
              shouldUnlock = stats.tasks >= achievement.requirement;
              break;
          }

          if (shouldUnlock) {
            unlockedAchievement = {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date(),
              progress: achievement.requirement,
            };
            return unlockedAchievement;
          }

          return { ...achievement, progress };
        });

        set({
          achievements: updatedAchievements,
          unlockedCount: updatedAchievements.filter((a) => a.unlocked).length,
          recentUnlock: unlockedAchievement,
        });

        return unlockedAchievement;
      },

      unlockAchievement: (achievementId) =>
        set((state) => {
          const updatedAchievements = state.achievements.map((a) =>
            a.id === achievementId
              ? { ...a, unlocked: true, unlockedAt: new Date(), progress: a.requirement }
              : a
          );
          const unlockedAchievement = updatedAchievements.find((a) => a.id === achievementId);
          
          return {
            achievements: updatedAchievements,
            unlockedCount: updatedAchievements.filter((a) => a.unlocked).length,
            recentUnlock: unlockedAchievement || null,
          };
        }),

      checkMilestones: (daysSinceQuit) => {
        const { milestones } = get();
        let reachedMilestone: Milestone | null = null;

        const updatedMilestones = milestones.map((milestone) => {
          if (milestone.reached) return milestone;

          if (daysSinceQuit >= milestone.daysRequired) {
            reachedMilestone = {
              ...milestone,
              reached: true,
              reachedAt: new Date(),
            };
            return reachedMilestone;
          }

          return milestone;
        });

        if (reachedMilestone) {
          set({ milestones: updatedMilestones });
        }

        return reachedMilestone;
      },

      clearRecentUnlock: () => set({ recentUnlock: null }),

      getAchievementProgress: (achievementId) => {
        const achievement = get().achievements.find((a) => a.id === achievementId);
        if (!achievement) return 0;
        return (achievement.progress / achievement.requirement) * 100;
      },
    }),
    {
      name: 'achievement-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAchievementStore;

