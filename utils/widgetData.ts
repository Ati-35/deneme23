// Widget Data Provider
// Ana ekran widget'ları için veri sağlayıcı

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface WidgetData {
  daysSober: number;
  currentStreak: number;
  moneySaved: number;
  cigarettesAvoided: number;
  healthScore: number;
  nextMilestone: {
    name: string;
    daysRemaining: number;
    progress: number;
  };
  todayTip: string;
  lastUpdated: string;
}

export interface MiniWidgetData {
  daysSober: number;
  streak: number;
  lastUpdated: string;
}

export interface MediumWidgetData {
  daysSober: number;
  streak: number;
  moneySaved: number;
  cigarettesAvoided: number;
  healthProgress: number;
  lastUpdated: string;
}

export interface LargeWidgetData {
  daysSober: number;
  streak: number;
  moneySaved: number;
  cigarettesAvoided: number;
  healthScore: number;
  todayMood: string;
  todayTip: string;
  nextMilestone: string;
  recentAchievement?: string;
  lastUpdated: string;
}

// Storage Keys
const STORAGE_KEYS = {
  WIDGET_DATA: '@widget_data',
  QUIT_DATE: '@quit_date',
  SETTINGS: '@user_settings',
};

// Tips for widgets
const WIDGET_TIPS = [
  '💪 Her "hayır" dediğinde güçleniyorsun!',
  '🫁 Akciğerlerin şu an temizleniyor.',
  '💰 Biriktirdiğin parayı kendine ödül olarak kullan!',
  '🏃 Bugün 10 dakika yürüyüş yap!',
  '💧 Su içmeyi unutma!',
  '😤 Sigara isteği 3-5 dakikada geçer, sabret!',
  '🧘 Derin nefes al, rahatlat kendini.',
  '📱 Uygulamayı aç, ilerlemeni gör!',
  '❤️ Sağlığın her şeyden değerli.',
  '🎯 Hedefe bir adım daha yaklaştın!',
];

// Get Widget Data
export async function getWidgetData(): Promise<WidgetData> {
  try {
    const quitDateStr = await AsyncStorage.getItem(STORAGE_KEYS.QUIT_DATE);
    const quitDate = quitDateStr ? new Date(quitDateStr) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const now = new Date();
    const diffMs = now.getTime() - quitDate.getTime();
    const daysSober = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    
    const cigarettesPerDay = 20;
    const pricePerPack = 50;
    const cigarettesPerPack = 20;
    
    const cigarettesAvoided = daysSober * cigarettesPerDay;
    const moneySaved = (cigarettesAvoided / cigarettesPerPack) * pricePerPack;
    
    // Calculate health score based on days
    const healthScore = Math.min(Math.floor(daysSober * 2), 100);
    
    // Get next milestone
    const milestones = [
      { days: 1, name: '1 Gün' },
      { days: 3, name: '3 Gün' },
      { days: 7, name: '1 Hafta' },
      { days: 14, name: '2 Hafta' },
      { days: 30, name: '1 Ay' },
      { days: 60, name: '2 Ay' },
      { days: 90, name: '3 Ay' },
      { days: 180, name: '6 Ay' },
      { days: 365, name: '1 Yıl' },
    ];
    
    let nextMilestone = milestones[milestones.length - 1];
    for (const milestone of milestones) {
      if (milestone.days > daysSober) {
        nextMilestone = milestone;
        break;
      }
    }
    
    const daysRemaining = nextMilestone.days - daysSober;
    const progress = Math.floor((daysSober / nextMilestone.days) * 100);
    
    // Random daily tip
    const tipIndex = new Date().getDate() % WIDGET_TIPS.length;
    const todayTip = WIDGET_TIPS[tipIndex];
    
    return {
      daysSober,
      currentStreak: daysSober, // Simplified
      moneySaved: Math.round(moneySaved),
      cigarettesAvoided,
      healthScore,
      nextMilestone: {
        name: nextMilestone.name,
        daysRemaining,
        progress: Math.min(progress, 100),
      },
      todayTip,
      lastUpdated: now.toISOString(),
    };
  } catch (error) {
    console.error('Error getting widget data:', error);
    return {
      daysSober: 0,
      currentStreak: 0,
      moneySaved: 0,
      cigarettesAvoided: 0,
      healthScore: 0,
      nextMilestone: {
        name: '1 Gün',
        daysRemaining: 1,
        progress: 0,
      },
      todayTip: WIDGET_TIPS[0],
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Get Mini Widget Data (small widget)
export async function getMiniWidgetData(): Promise<MiniWidgetData> {
  const data = await getWidgetData();
  return {
    daysSober: data.daysSober,
    streak: data.currentStreak,
    lastUpdated: data.lastUpdated,
  };
}

// Get Medium Widget Data
export async function getMediumWidgetData(): Promise<MediumWidgetData> {
  const data = await getWidgetData();
  return {
    daysSober: data.daysSober,
    streak: data.currentStreak,
    moneySaved: data.moneySaved,
    cigarettesAvoided: data.cigarettesAvoided,
    healthProgress: data.healthScore,
    lastUpdated: data.lastUpdated,
  };
}

// Get Large Widget Data
export async function getLargeWidgetData(): Promise<LargeWidgetData> {
  const data = await getWidgetData();
  
  // Get today's mood from storage (if available)
  let todayMood = '😊';
  try {
    const moodData = await AsyncStorage.getItem('@today_mood');
    if (moodData) {
      todayMood = moodData;
    }
  } catch {}
  
  return {
    daysSober: data.daysSober,
    streak: data.currentStreak,
    moneySaved: data.moneySaved,
    cigarettesAvoided: data.cigarettesAvoided,
    healthScore: data.healthScore,
    todayMood,
    todayTip: data.todayTip,
    nextMilestone: `${data.nextMilestone.name}'a ${data.nextMilestone.daysRemaining} gün`,
    lastUpdated: data.lastUpdated,
  };
}

// Update Widget (call this when app data changes)
export async function updateWidgetData(): Promise<void> {
  const data = await getWidgetData();
  await AsyncStorage.setItem(STORAGE_KEYS.WIDGET_DATA, JSON.stringify(data));
  
  // In a real implementation, this would trigger native widget refresh
  // For iOS: WidgetKit.reloadTimelines(ofKind: "SigaraBirakmaWidget")
  // For Android: AppWidgetManager.getInstance(context).updateAppWidget(...)
  console.log('Widget data updated:', data);
}

// Set Quit Date (for widget calculations)
export async function setQuitDate(date: Date): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.QUIT_DATE, date.toISOString());
  await updateWidgetData();
}

// Get Quit Date
export async function getQuitDate(): Promise<Date> {
  try {
    const dateStr = await AsyncStorage.getItem(STORAGE_KEYS.QUIT_DATE);
    if (dateStr) {
      return new Date(dateStr);
    }
  } catch {}
  
  // Default to 7 days ago for demo
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

// Widget Configuration Types
export interface WidgetConfig {
  type: 'small' | 'medium' | 'large';
  showStreak: boolean;
  showMoney: boolean;
  showHealth: boolean;
  showTip: boolean;
  backgroundColor: 'dark' | 'light' | 'gradient';
}

// Default Widget Configurations
export const DEFAULT_WIDGET_CONFIGS: Record<string, WidgetConfig> = {
  small: {
    type: 'small',
    showStreak: true,
    showMoney: false,
    showHealth: false,
    showTip: false,
    backgroundColor: 'gradient',
  },
  medium: {
    type: 'medium',
    showStreak: true,
    showMoney: true,
    showHealth: true,
    showTip: false,
    backgroundColor: 'gradient',
  },
  large: {
    type: 'large',
    showStreak: true,
    showMoney: true,
    showHealth: true,
    showTip: true,
    backgroundColor: 'dark',
  },
};

// Save Widget Config
export async function saveWidgetConfig(config: WidgetConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(`@widget_config_${config.type}`, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving widget config:', error);
  }
}

// Get Widget Config
export async function getWidgetConfig(type: 'small' | 'medium' | 'large'): Promise<WidgetConfig> {
  try {
    const data = await AsyncStorage.getItem(`@widget_config_${type}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  
  return DEFAULT_WIDGET_CONFIGS[type];
}

// Format number for widget display
export function formatWidgetNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// Get motivational message based on streak
export function getStreakMessage(days: number): string {
  if (days === 0) return 'Bugün başla! 💪';
  if (days === 1) return 'Harika başlangıç! 🚀';
  if (days < 7) return 'Devam et! 🔥';
  if (days < 14) return 'Bir hafta oldu! 🎉';
  if (days < 30) return 'Güçleniyorsun! 💎';
  if (days < 60) return 'Bir ay! İnanılmaz! 👑';
  if (days < 90) return 'Muhteşem! 🌟';
  if (days < 180) return 'Artık sigara geçmişte! ✨';
  if (days < 365) return 'Özgürlüğe yaklaşıyorsun! 🦅';
  return 'Efsanesin! 🏆';
}

export default {
  getWidgetData,
  getMiniWidgetData,
  getMediumWidgetData,
  getLargeWidgetData,
  updateWidgetData,
  setQuitDate,
  getQuitDate,
  saveWidgetConfig,
  getWidgetConfig,
  formatWidgetNumber,
  getStreakMessage,
  DEFAULT_WIDGET_CONFIGS,
  WIDGET_TIPS,
};




