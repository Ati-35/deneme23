// Gelişmiş Rozet ve Seviye Sistemi
// 50+ rozet kategorisi, seviye sistemi, gizli başarılar

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  color: string;
  requirement: AchievementRequirement;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isHidden: boolean;
  unlockedAt?: string;
}

export interface AchievementRequirement {
  type: RequirementType;
  value: number;
  metric?: string;
}

export type RequirementType = 
  | 'days_smoke_free'
  | 'money_saved'
  | 'cigarettes_not_smoked'
  | 'crises_overcome'
  | 'journal_entries'
  | 'community_posts'
  | 'friends_helped'
  | 'challenges_completed'
  | 'streak_days'
  | 'breathing_exercises'
  | 'education_completed'
  | 'health_score'
  | 'login_streak'
  | 'night_crises_overcome'
  | 'early_morning_victories'
  | 'weekend_warrior'
  | 'perfect_week';

export type AchievementCategory = 
  | 'time'
  | 'health'
  | 'financial'
  | 'social'
  | 'personal'
  | 'milestone'
  | 'special'
  | 'hidden';

export interface UserLevel {
  level: number;
  title: string;
  currentXP: number;
  requiredXP: number;
  totalXP: number;
  perks: string[];
}

export interface UserAchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  rarity: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

// Storage Keys
const KEYS = {
  ACHIEVEMENTS: '@user_achievements',
  LEVEL_DATA: '@user_level',
  ACHIEVEMENT_STATS: '@achievement_stats',
};

// Seviye başlıkları
const LEVEL_TITLES: { [key: number]: string } = {
  1: 'Yeni Başlayan',
  5: 'Kararlı',
  10: 'Azimli',
  15: 'Güçlü',
  20: 'Kahraman',
  25: 'Savaşçı',
  30: 'Şampiyon',
  40: 'Usta',
  50: 'Efsane',
  60: 'Titan',
  70: 'Mitolojik',
  80: 'İmparator',
  90: 'Tanrısal',
  100: 'Ölümsüz',
};

// XP hesaplama formülü
const calculateRequiredXP = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Tüm başarılar listesi
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // === ZAMAN KATEGORİSİ ===
  {
    id: 'first_hour',
    title: 'İlk Saat',
    description: '1 saat sigarasız',
    category: 'time',
    icon: 'time',
    color: '#10B981',
    requirement: { type: 'days_smoke_free', value: 0.042 }, // ~1 saat
    points: 10,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'first_day',
    title: 'İlk Adım',
    description: '1 gün sigarasız',
    category: 'time',
    icon: 'star',
    color: '#CD7F32',
    requirement: { type: 'days_smoke_free', value: 1 },
    points: 50,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'three_days',
    title: '3 Gün Savaşçısı',
    description: '3 gün sigarasız',
    category: 'time',
    icon: 'flash',
    color: '#F59E0B',
    requirement: { type: 'days_smoke_free', value: 3 },
    points: 100,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'one_week',
    title: 'Haftalık Kahraman',
    description: '7 gün sigarasız',
    category: 'time',
    icon: 'medal',
    color: '#C0C0C0',
    requirement: { type: 'days_smoke_free', value: 7 },
    points: 200,
    rarity: 'uncommon',
    isHidden: false,
  },
  {
    id: 'two_weeks',
    title: '2 Hafta Ustası',
    description: '14 gün sigarasız',
    category: 'time',
    icon: 'ribbon',
    color: '#3B82F6',
    requirement: { type: 'days_smoke_free', value: 14 },
    points: 300,
    rarity: 'uncommon',
    isHidden: false,
  },
  {
    id: 'three_weeks',
    title: '21 Gün Alışkanlık',
    description: '21 gün sigarasız - Alışkanlık kırıldı!',
    category: 'time',
    icon: 'fitness',
    color: '#8B5CF6',
    requirement: { type: 'days_smoke_free', value: 21 },
    points: 400,
    rarity: 'rare',
    isHidden: false,
  },
  {
    id: 'one_month',
    title: 'Aylık Savaşçı',
    description: '30 gün sigarasız',
    category: 'time',
    icon: 'trophy',
    color: '#FFD700',
    requirement: { type: 'days_smoke_free', value: 30 },
    points: 500,
    rarity: 'rare',
    isHidden: false,
  },
  {
    id: 'two_months',
    title: 'Çift Ay Şampiyonu',
    description: '60 gün sigarasız',
    category: 'time',
    icon: 'shield',
    color: '#06B6D4',
    requirement: { type: 'days_smoke_free', value: 60 },
    points: 750,
    rarity: 'rare',
    isHidden: false,
  },
  {
    id: 'three_months',
    title: 'Çeyrek Yıl',
    description: '90 gün sigarasız',
    category: 'time',
    icon: 'diamond',
    color: '#EC4899',
    requirement: { type: 'days_smoke_free', value: 90 },
    points: 1000,
    rarity: 'epic',
    isHidden: false,
  },
  {
    id: 'hundred_days',
    title: '100 Gün Efsanesi',
    description: '100 gün sigarasız',
    category: 'milestone',
    icon: 'sparkles',
    color: '#8B5CF6',
    requirement: { type: 'days_smoke_free', value: 100 },
    points: 1500,
    rarity: 'epic',
    isHidden: false,
  },
  {
    id: 'half_year',
    title: 'Yarım Yıl Kralı',
    description: '180 gün sigarasız',
    category: 'time',
    icon: 'crown',
    color: '#EF4444',
    requirement: { type: 'days_smoke_free', value: 180 },
    points: 2000,
    rarity: 'epic',
    isHidden: false,
  },
  {
    id: 'one_year',
    title: 'Yıllık Şampiyon',
    description: '365 gün sigarasız',
    category: 'milestone',
    icon: 'planet',
    color: '#10B981',
    requirement: { type: 'days_smoke_free', value: 365 },
    points: 5000,
    rarity: 'legendary',
    isHidden: false,
  },
  {
    id: 'two_years',
    title: 'Çift Yıl Efsanesi',
    description: '730 gün sigarasız',
    category: 'milestone',
    icon: 'rocket',
    color: '#F59E0B',
    requirement: { type: 'days_smoke_free', value: 730 },
    points: 10000,
    rarity: 'legendary',
    isHidden: false,
  },

  // === FİNANSAL KATEGORİ ===
  {
    id: 'first_savings',
    title: 'İlk Tasarruf',
    description: '₺50 tasarruf',
    category: 'financial',
    icon: 'cash',
    color: '#10B981',
    requirement: { type: 'money_saved', value: 50 },
    points: 25,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'dinner_money',
    title: 'Akşam Yemeği',
    description: '₺250 tasarruf - Güzel bir yemeğe yeter!',
    category: 'financial',
    icon: 'restaurant',
    color: '#F59E0B',
    requirement: { type: 'money_saved', value: 250 },
    points: 100,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'gadget_money',
    title: 'Gadget Alabilirsin',
    description: '₺1000 tasarruf',
    category: 'financial',
    icon: 'headset',
    color: '#8B5CF6',
    requirement: { type: 'money_saved', value: 1000 },
    points: 300,
    rarity: 'uncommon',
    isHidden: false,
  },
  {
    id: 'vacation_fund',
    title: 'Tatil Fonu',
    description: '₺5000 tasarruf',
    category: 'financial',
    icon: 'airplane',
    color: '#3B82F6',
    requirement: { type: 'money_saved', value: 5000 },
    points: 750,
    rarity: 'rare',
    isHidden: false,
  },
  {
    id: 'phone_money',
    title: 'Telefon Parası',
    description: '₺15000 tasarruf',
    category: 'financial',
    icon: 'phone-portrait',
    color: '#06B6D4',
    requirement: { type: 'money_saved', value: 15000 },
    points: 1500,
    rarity: 'epic',
    isHidden: false,
  },
  {
    id: 'rich_saver',
    title: 'Zengin Tasarrufçu',
    description: '₺50000 tasarruf',
    category: 'financial',
    icon: 'wallet',
    color: '#FFD700',
    requirement: { type: 'money_saved', value: 50000 },
    points: 3000,
    rarity: 'legendary',
    isHidden: false,
  },

  // === SAĞLIK KATEGORİSİ ===
  {
    id: 'oxygen_boost',
    title: 'Oksijen Artışı',
    description: 'Kan oksijen seviyesi normale döndü (12 saat)',
    category: 'health',
    icon: 'water',
    color: '#06B6D4',
    requirement: { type: 'days_smoke_free', value: 0.5 },
    points: 50,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'heart_healer',
    title: 'Kalp Şifacısı',
    description: 'Kalp atış hızı normalleşti',
    category: 'health',
    icon: 'heart',
    color: '#EF4444',
    requirement: { type: 'days_smoke_free', value: 1 },
    points: 75,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'lung_revival',
    title: 'Akciğer Uyanışı',
    description: 'Akciğerler temizlenmeye başladı',
    category: 'health',
    icon: 'fitness',
    color: '#3B82F6',
    requirement: { type: 'days_smoke_free', value: 3 },
    points: 150,
    rarity: 'uncommon',
    isHidden: false,
  },
  {
    id: 'taste_return',
    title: 'Tat Duyusu',
    description: 'Tat ve koku duyuları iyileşti',
    category: 'health',
    icon: 'nutrition',
    color: '#F59E0B',
    requirement: { type: 'days_smoke_free', value: 7 },
    points: 200,
    rarity: 'uncommon',
    isHidden: false,
  },
  {
    id: 'circulation_master',
    title: 'Dolaşım Ustası',
    description: 'Kan dolaşımı önemli ölçüde iyileşti',
    category: 'health',
    icon: 'pulse',
    color: '#EC4899',
    requirement: { type: 'days_smoke_free', value: 14 },
    points: 400,
    rarity: 'rare',
    isHidden: false,
  },
  {
    id: 'health_champion',
    title: 'Sağlık Şampiyonu',
    description: 'Sağlık skoru %80\'in üzerinde',
    category: 'health',
    icon: 'medkit',
    color: '#10B981',
    requirement: { type: 'health_score', value: 80 },
    points: 1000,
    rarity: 'epic',
    isHidden: false,
  },

  // === SOSYAL KATEGORİ ===
  {
    id: 'first_post',
    title: 'İlk Paylaşım',
    description: 'Toplulukta ilk paylaşımını yap',
    category: 'social',
    icon: 'chatbubble',
    color: '#8B5CF6',
    requirement: { type: 'community_posts', value: 1 },
    points: 50,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'helper',
    title: 'Yardımcı',
    description: '5 kişiye destek ol',
    category: 'social',
    icon: 'hand-left',
    color: '#3B82F6',
    requirement: { type: 'friends_helped', value: 5 },
    points: 200,
    rarity: 'uncommon',
    isHidden: false,
  },
  {
    id: 'mentor',
    title: 'Mentor',
    description: '25 kişiye destek ol',
    category: 'social',
    icon: 'school',
    color: '#F59E0B',
    requirement: { type: 'friends_helped', value: 25 },
    points: 750,
    rarity: 'rare',
    isHidden: false,
  },
  {
    id: 'influencer',
    title: 'İnfluencer',
    description: '100 paylaşım yap',
    category: 'social',
    icon: 'megaphone',
    color: '#EC4899',
    requirement: { type: 'community_posts', value: 100 },
    points: 1500,
    rarity: 'epic',
    isHidden: false,
  },

  // === KİŞİSEL KATEGORİ ===
  {
    id: 'journal_starter',
    title: 'Günlük Yazarı',
    description: 'İlk günlük kaydını oluştur',
    category: 'personal',
    icon: 'book',
    color: '#8B5CF6',
    requirement: { type: 'journal_entries', value: 1 },
    points: 25,
    rarity: 'common',
    isHidden: false,
  },
  {
    id: 'consistent_writer',
    title: 'Düzenli Yazar',
    description: '30 günlük kaydı',
    category: 'personal',
    icon: 'create',
    color: '#3B82F6',
    requirement: { type: 'journal_entries', value: 30 },
    points: 300,
    rarity: 'uncommon',
    isHidden: false,
  },
  {
    id: 'breathing_master',
    title: 'Nefes Ustası',
    description: '50 nefes egzersizi tamamla',
    category: 'personal',
    icon: 'leaf',
    color: '#10B981',
    requirement: { type: 'breathing_exercises', value: 50 },
    points: 400,
    rarity: 'rare',
    isHidden: false,
  },
  {
    id: 'crisis_warrior',
    title: 'Kriz Savaşçısı',
    description: '25 krizi başarıyla atla',
    category: 'personal',
    icon: 'shield-checkmark',
    color: '#EF4444',
    requirement: { type: 'crises_overcome', value: 25 },
    points: 500,
    rarity: 'rare',
    isHidden: false,
  },
  {
    id: 'education_complete',
    title: 'Bilgi Uzmanı',
    description: 'Tüm eğitim modüllerini tamamla',
    category: 'personal',
    icon: 'school',
    color: '#F59E0B',
    requirement: { type: 'education_completed', value: 100 },
    points: 750,
    rarity: 'epic',
    isHidden: false,
  },

  // === GİZLİ BAŞARILAR (EASTER EGGS) ===
  {
    id: 'night_owl',
    title: 'Gece Kuşu',
    description: 'Gece 2-5 arası bir krizi atla',
    category: 'hidden',
    icon: 'moon',
    color: '#312E81',
    requirement: { type: 'night_crises_overcome', value: 1 },
    points: 200,
    rarity: 'rare',
    isHidden: true,
  },
  {
    id: 'early_bird',
    title: 'Erken Kuş',
    description: 'Sabah 5-7 arası uygulamayı kullan',
    category: 'hidden',
    icon: 'sunny',
    color: '#F59E0B',
    requirement: { type: 'early_morning_victories', value: 5 },
    points: 150,
    rarity: 'uncommon',
    isHidden: true,
  },
  {
    id: 'weekend_warrior',
    title: 'Hafta Sonu Savaşçısı',
    description: '4 hafta sonu sigarasız geçir',
    category: 'hidden',
    icon: 'calendar',
    color: '#8B5CF6',
    requirement: { type: 'weekend_warrior', value: 4 },
    points: 300,
    rarity: 'rare',
    isHidden: true,
  },
  {
    id: 'perfect_week',
    title: 'Mükemmel Hafta',
    description: 'Bir hafta boyunca hiç kriz yaşama',
    category: 'hidden',
    icon: 'checkmark-circle',
    color: '#10B981',
    requirement: { type: 'perfect_week', value: 1 },
    points: 500,
    rarity: 'epic',
    isHidden: true,
  },
  {
    id: 'comeback_king',
    title: 'Geri Dönüş Kralı',
    description: 'Başarısızlık sonrası tekrar başla ve 30 güne ulaş',
    category: 'hidden',
    icon: 'refresh',
    color: '#06B6D4',
    requirement: { type: 'days_smoke_free', value: 30 },
    points: 750,
    rarity: 'epic',
    isHidden: true,
  },
  {
    id: 'zen_master',
    title: 'Zen Ustası',
    description: '100 nefes egzersizi tamamla',
    category: 'hidden',
    icon: 'flower',
    color: '#EC4899',
    requirement: { type: 'breathing_exercises', value: 100 },
    points: 1000,
    rarity: 'legendary',
    isHidden: true,
  },
];

// Kullanıcı başarılarını getir
export const getUserAchievements = async (): Promise<Achievement[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
};

// Başarı kilidi aç
export const unlockAchievement = async (achievementId: string): Promise<Achievement | null> => {
  try {
    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const userAchievements = await getUserAchievements();
    const alreadyUnlocked = userAchievements.find(a => a.id === achievementId);
    if (alreadyUnlocked) return null;

    const unlockedAchievement = {
      ...achievement,
      unlockedAt: new Date().toISOString(),
    };

    userAchievements.push(unlockedAchievement);
    await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(userAchievements));

    // XP ekle
    await addXP(achievement.points);

    return unlockedAchievement;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return null;
  }
};

// Başarı kontrolü ve otomatik kilitle açma
export const checkAndUnlockAchievements = async (
  stats: {
    daysSmokesFree: number;
    moneySaved: number;
    cigarettesNotSmoked: number;
    crisesOvercome: number;
    journalEntries: number;
    communityPosts: number;
    friendsHelped: number;
    challengesCompleted: number;
    breathingExercises: number;
    educationCompleted: number;
    healthScore: number;
    loginStreak: number;
  }
): Promise<Achievement[]> => {
  const unlockedNow: Achievement[] = [];
  const userAchievements = await getUserAchievements();
  const unlockedIds = new Set(userAchievements.map(a => a.id));

  for (const achievement of ALL_ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    let isUnlocked = false;
    const { type, value } = achievement.requirement;

    switch (type) {
      case 'days_smoke_free':
        isUnlocked = stats.daysSmokesFree >= value;
        break;
      case 'money_saved':
        isUnlocked = stats.moneySaved >= value;
        break;
      case 'cigarettes_not_smoked':
        isUnlocked = stats.cigarettesNotSmoked >= value;
        break;
      case 'crises_overcome':
        isUnlocked = stats.crisesOvercome >= value;
        break;
      case 'journal_entries':
        isUnlocked = stats.journalEntries >= value;
        break;
      case 'community_posts':
        isUnlocked = stats.communityPosts >= value;
        break;
      case 'friends_helped':
        isUnlocked = stats.friendsHelped >= value;
        break;
      case 'challenges_completed':
        isUnlocked = stats.challengesCompleted >= value;
        break;
      case 'breathing_exercises':
        isUnlocked = stats.breathingExercises >= value;
        break;
      case 'education_completed':
        isUnlocked = stats.educationCompleted >= value;
        break;
      case 'health_score':
        isUnlocked = stats.healthScore >= value;
        break;
      case 'login_streak':
        isUnlocked = stats.loginStreak >= value;
        break;
    }

    if (isUnlocked) {
      const unlocked = await unlockAchievement(achievement.id);
      if (unlocked) {
        unlockedNow.push(unlocked);
      }
    }
  }

  return unlockedNow;
};

// Kullanıcı seviyesini getir
export const getUserLevel = async (): Promise<UserLevel> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.LEVEL_DATA);
    if (data) {
      return JSON.parse(data);
    }

    // Varsayılan seviye
    return {
      level: 1,
      title: LEVEL_TITLES[1],
      currentXP: 0,
      requiredXP: calculateRequiredXP(1),
      totalXP: 0,
      perks: [],
    };
  } catch (error) {
    console.error('Error getting user level:', error);
    return {
      level: 1,
      title: LEVEL_TITLES[1],
      currentXP: 0,
      requiredXP: 100,
      totalXP: 0,
      perks: [],
    };
  }
};

// XP ekle ve seviye atlama
export const addXP = async (amount: number): Promise<{ leveledUp: boolean; newLevel?: UserLevel }> => {
  try {
    const currentLevel = await getUserLevel();
    let newXP = currentLevel.currentXP + amount;
    let newLevelNum = currentLevel.level;
    let leveledUp = false;

    // Seviye atlama kontrolü
    while (newXP >= calculateRequiredXP(newLevelNum)) {
      newXP -= calculateRequiredXP(newLevelNum);
      newLevelNum++;
      leveledUp = true;
    }

    // Başlık belirleme
    let title = LEVEL_TITLES[1];
    const sortedLevels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
    for (const lvl of sortedLevels) {
      if (newLevelNum >= lvl) {
        title = LEVEL_TITLES[lvl];
        break;
      }
    }

    // Perks belirleme
    const perks: string[] = [];
    if (newLevelNum >= 5) perks.push('Özel rozetler');
    if (newLevelNum >= 10) perks.push('Premium temalar');
    if (newLevelNum >= 20) perks.push('Mentor olma hakkı');
    if (newLevelNum >= 30) perks.push('Özel başlıklar');
    if (newLevelNum >= 50) perks.push('VIP topluluk erişimi');

    const newLevel: UserLevel = {
      level: newLevelNum,
      title,
      currentXP: newXP,
      requiredXP: calculateRequiredXP(newLevelNum),
      totalXP: currentLevel.totalXP + amount,
      perks,
    };

    await AsyncStorage.setItem(KEYS.LEVEL_DATA, JSON.stringify(newLevel));

    return { leveledUp, newLevel: leveledUp ? newLevel : undefined };
  } catch (error) {
    console.error('Error adding XP:', error);
    return { leveledUp: false };
  }
};

// Başarı istatistiklerini getir
export const getAchievementStats = async (): Promise<UserAchievementStats> => {
  try {
    const userAchievements = await getUserAchievements();
    const level = await getUserLevel();

    const rarity = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    userAchievements.forEach(a => {
      rarity[a.rarity]++;
    });

    return {
      totalAchievements: ALL_ACHIEVEMENTS.length,
      unlockedAchievements: userAchievements.length,
      totalPoints: level.totalXP,
      currentStreak: 0, // Ayrıca hesaplanabilir
      longestStreak: 0,
      rarity,
    };
  } catch (error) {
    console.error('Error getting achievement stats:', error);
    return {
      totalAchievements: ALL_ACHIEVEMENTS.length,
      unlockedAchievements: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      rarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    };
  }
};

// Nadirlik rengini getir
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return '#9CA3AF';
    case 'uncommon': return '#10B981';
    case 'rare': return '#3B82F6';
    case 'epic': return '#8B5CF6';
    case 'legendary': return '#F59E0B';
    default: return '#6B7280';
  }
};

// Nadirlik adını getir (Türkçe)
export const getRarityName = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'Yaygın';
    case 'uncommon': return 'Nadir';
    case 'rare': return 'Çok Nadir';
    case 'epic': return 'Epik';
    case 'legendary': return 'Efsanevi';
    default: return 'Bilinmeyen';
  }
};

// Kategori adını getir (Türkçe)
export const getCategoryName = (category: string): string => {
  switch (category) {
    case 'time': return 'Zaman';
    case 'health': return 'Sağlık';
    case 'financial': return 'Finansal';
    case 'social': return 'Sosyal';
    case 'personal': return 'Kişisel';
    case 'milestone': return 'Kilometre Taşı';
    case 'special': return 'Özel';
    case 'hidden': return 'Gizli';
    default: return 'Diğer';
  }
};







