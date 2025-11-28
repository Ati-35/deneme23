// Smart Notification System
// Akıllı bildirimler, kişiselleştirilmiş hatırlatıcılar, motivasyon mesajları

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export interface NotificationSettings {
  enabled: boolean;
  dailyMotivation: boolean;
  dailyMotivationTime: string; // HH:mm format
  streakReminders: boolean;
  healthMilestones: boolean;
  cravingAlerts: boolean;
  socialUpdates: boolean;
  challengeReminders: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeCount: boolean;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  scheduledTime: string;
  repeat: 'none' | 'daily' | 'weekly';
  data?: Record<string, any>;
  sent: boolean;
}

export type NotificationType = 
  | 'motivation'
  | 'streak'
  | 'health'
  | 'craving'
  | 'social'
  | 'challenge'
  | 'milestone'
  | 'tip'
  | 'reminder';

export interface NotificationHistory {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  sentAt: string;
  opened: boolean;
  actionTaken?: string;
}

// Storage Keys
const STORAGE_KEYS = {
  SETTINGS: '@notification_settings',
  SCHEDULED: '@scheduled_notifications',
  HISTORY: '@notification_history',
  CRAVING_PATTERNS: '@craving_patterns',
};

// Default Settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyMotivation: true,
  dailyMotivationTime: '09:00',
  streakReminders: true,
  healthMilestones: true,
  cravingAlerts: true,
  socialUpdates: true,
  challengeReminders: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  soundEnabled: true,
  vibrationEnabled: true,
  badgeCount: true,
};

// Motivation Messages
const MOTIVATION_MESSAGES = [
  { title: 'Günaydın! ☀️', body: 'Bugün de güçlü ol! Her an bir zafer.' },
  { title: 'Harika Gidiyorsun! 💪', body: 'Bugün bir adım daha özgürlüğe yaklaştın.' },
  { title: 'Sen Yapabilirsin! 🌟', body: 'Güçlü ol, sigara isteği geçici, sağlık kalıcı.' },
  { title: 'Bugün Senin Günün! 🎯', body: 'Her "hayır" dediğinde daha güçleniyorsun.' },
  { title: 'Tebrikler! 🎉', body: 'Başardıklarınla gurur duy!' },
  { title: 'İnanıyorum Sana! ❤️', body: 'Zorluklara rağmen ilerliyorsun, harikasın!' },
  { title: 'Bir Gün Daha! 🔥', body: 'Streak\'ini koru, pes etme!' },
  { title: 'Sağlığın Değerli! 🫁', body: 'Her nefes temiz hava, her an bir kazanım.' },
  { title: 'Güçlü Kal! 💎', body: 'Zor anlar geçici, başarın kalıcı olacak.' },
  { title: 'Bugün Farklı! ✨', body: 'Geçmişi değil, geleceğini düşün.' },
];

// Craving Time Patterns (common high-risk times)
const COMMON_CRAVING_TIMES = [
  { time: '08:00', label: 'Sabah kahvesi' },
  { time: '10:30', label: 'Sabah molası' },
  { time: '12:30', label: 'Öğle yemeği sonrası' },
  { time: '15:00', label: 'Öğleden sonra' },
  { time: '18:00', label: 'İş çıkışı' },
  { time: '20:00', label: 'Akşam yemeği sonrası' },
  { time: '22:00', label: 'Yatmadan önce' },
];

// Tips for different times
const TIPS_BY_TIME: Record<string, string[]> = {
  morning: [
    'Güne bir bardak su ile başla - toksinleri atmana yardımcı olur.',
    'Sabah kahveni farklı bir yerde iç, alışkanlığı kır.',
    '5 dakika nefes egzersizi günü güzel başlatır.',
  ],
  afternoon: [
    'Stresli hissediyorsan kısa bir yürüyüş yap.',
    'Bir bardak su iç, bazen susuzluk sigara isteği gibi hissedilir.',
    'Derin nefes al, 4 saniye tut, 4 saniye ver.',
  ],
  evening: [
    'Akşam yemeğinden sonra diş fırçala.',
    'Ellerini meşgul tut - puzzle, çizim, el işi dene.',
    'Rahatlatıcı müzik dinle veya meditasyon yap.',
  ],
  night: [
    'Yatmadan önce lavanta çayı dene.',
    'Telefondan uzak dur, kitap oku.',
    'Yarın için pozitif bir niyet belirle.',
  ],
};

// Get Notification Settings
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error getting notification settings:', error);
  }
  return DEFAULT_SETTINGS;
}

// Save Notification Settings
export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Check if in quiet hours
function isQuietHours(settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) return false;
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const start = settings.quietHoursStart;
  const end = settings.quietHoursEnd;
  
  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (start > end) {
    return currentTime >= start || currentTime < end;
  }
  return currentTime >= start && currentTime < end;
}

// Get random motivation message
export function getRandomMotivation(): { title: string; body: string } {
  return MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
}

// Get tip based on time of day
export function getTipForCurrentTime(): string {
  const hour = new Date().getHours();
  
  let period: string;
  if (hour >= 5 && hour < 12) period = 'morning';
  else if (hour >= 12 && hour < 17) period = 'afternoon';
  else if (hour >= 17 && hour < 21) period = 'evening';
  else period = 'night';
  
  const tips = TIPS_BY_TIME[period];
  return tips[Math.floor(Math.random() * tips.length)];
}

// Schedule Notification
export async function scheduleNotification(
  notification: Omit<ScheduledNotification, 'id' | 'sent'>
): Promise<string> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newNotification: ScheduledNotification = {
    ...notification,
    id,
    sent: false,
  };
  
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED);
    const scheduled: ScheduledNotification[] = data ? JSON.parse(data) : [];
    scheduled.push(newNotification);
    await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULED, JSON.stringify(scheduled));
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
  
  return id;
}

// Cancel Scheduled Notification
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED);
    const scheduled: ScheduledNotification[] = data ? JSON.parse(data) : [];
    const filtered = scheduled.filter(n => n.id !== notificationId);
    await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULED, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Get Scheduled Notifications
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Record Craving Time
export async function recordCravingTime(): Promise<void> {
  try {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CRAVING_PATTERNS);
    const patterns: { hour: number; day: number; count: number }[] = data ? JSON.parse(data) : [];
    
    const existing = patterns.find(p => p.hour === hour && p.day === dayOfWeek);
    if (existing) {
      existing.count++;
    } else {
      patterns.push({ hour, day: dayOfWeek, count: 1 });
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.CRAVING_PATTERNS, JSON.stringify(patterns));
  } catch (error) {
    console.error('Error recording craving time:', error);
  }
}

// Get Craving Patterns
export async function getCravingPatterns(): Promise<{ hour: number; day: number; count: number }[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CRAVING_PATTERNS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting craving patterns:', error);
    return [];
  }
}

// Get High Risk Times (based on patterns)
export async function getHighRiskTimes(): Promise<{ time: string; risk: 'high' | 'medium' | 'low' }[]> {
  const patterns = await getCravingPatterns();
  
  // Combine with common craving times
  const riskTimes = COMMON_CRAVING_TIMES.map(({ time }) => {
    const hour = parseInt(time.split(':')[0]);
    const patternCount = patterns
      .filter(p => p.hour === hour)
      .reduce((sum, p) => sum + p.count, 0);
    
    let risk: 'high' | 'medium' | 'low';
    if (patternCount >= 5) risk = 'high';
    else if (patternCount >= 2) risk = 'medium';
    else risk = 'low';
    
    return { time, risk };
  });
  
  return riskTimes;
}

// Get Notification History
export async function getNotificationHistory(): Promise<NotificationHistory[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
}

// Add to Notification History
export async function addToHistory(notification: Omit<NotificationHistory, 'id' | 'sentAt' | 'opened'>): Promise<void> {
  try {
    const history = await getNotificationHistory();
    
    const newEntry: NotificationHistory = {
      ...notification,
      id: `history_${Date.now()}`,
      sentAt: new Date().toISOString(),
      opened: false,
    };
    
    history.unshift(newEntry);
    
    // Keep only last 100 notifications
    const trimmed = history.slice(0, 100);
    
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error adding to notification history:', error);
  }
}

// Mark Notification as Opened
export async function markNotificationOpened(notificationId: string): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const notification = history.find(n => n.id === notificationId);
    if (notification) {
      notification.opened = true;
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Error marking notification as opened:', error);
  }
}

// Generate Smart Notification Based on Context
export function generateSmartNotification(context: {
  daysSober: number;
  currentStreak: number;
  lastCravingTime?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  stressLevel?: number;
}): { title: string; body: string; type: NotificationType } {
  const { daysSober, currentStreak, timeOfDay, stressLevel } = context;
  
  // Milestone notifications
  if ([1, 3, 7, 14, 30, 60, 90, 180, 365].includes(daysSober)) {
    return {
      title: `🎉 ${daysSober} Gün!`,
      body: `Tebrikler! ${daysSober} gündür sigarasız! Harika bir başarı!`,
      type: 'milestone',
    };
  }
  
  // Streak notifications
  if (currentStreak > 0 && currentStreak % 7 === 0) {
    return {
      title: `🔥 ${currentStreak} Günlük Seri!`,
      body: 'Streak\'ini sürdürüyorsun, harika!',
      type: 'streak',
    };
  }
  
  // Time-based tips
  if (timeOfDay === 'morning') {
    return {
      title: '☀️ Günaydın!',
      body: getTipForCurrentTime(),
      type: 'tip',
    };
  }
  
  // Stress-based notifications
  if (stressLevel && stressLevel > 7) {
    return {
      title: '😌 Sakin Ol',
      body: 'Stresli bir an gibi görünüyor. Derin nefes al, bu da geçecek.',
      type: 'craving',
    };
  }
  
  // Default motivation
  return {
    ...getRandomMotivation(),
    type: 'motivation',
  };
}

// Setup Daily Motivation Notification
export async function setupDailyMotivation(): Promise<void> {
  const settings = await getNotificationSettings();
  
  if (!settings.enabled || !settings.dailyMotivation) return;
  
  const motivation = getRandomMotivation();
  
  await scheduleNotification({
    title: motivation.title,
    body: motivation.body,
    type: 'motivation',
    scheduledTime: settings.dailyMotivationTime,
    repeat: 'daily',
  });
}

// Get Notification Badge Count
export async function getBadgeCount(): Promise<number> {
  const history = await getNotificationHistory();
  return history.filter(n => !n.opened).length;
}

// Clear All Notifications
export async function clearAllNotifications(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SCHEDULED,
      STORAGE_KEYS.HISTORY,
    ]);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

export default {
  getNotificationSettings,
  saveNotificationSettings,
  scheduleNotification,
  cancelNotification,
  getScheduledNotifications,
  recordCravingTime,
  getCravingPatterns,
  getHighRiskTimes,
  getNotificationHistory,
  addToHistory,
  markNotificationOpened,
  generateSmartNotification,
  setupDailyMotivation,
  getBadgeCount,
  clearAllNotifications,
  getRandomMotivation,
  getTipForCurrentTime,
  MOTIVATION_MESSAGES,
  COMMON_CRAVING_TIMES,
};




