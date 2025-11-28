// Akıllı Bildirim Sistemi
// Risk saati uyarıları, motivasyon mesajları, başarı kutlamaları

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getHighRiskHours, getCurrentRisk } from './aiPrediction';
import { getUserData } from './storage';

// Types
export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledTime: string;
  isDelivered: boolean;
  data?: Record<string, any>;
}

export type NotificationType = 
  | 'morning_motivation'
  | 'high_risk_warning'
  | 'milestone_celebration'
  | 'daily_reminder'
  | 'streak_alert'
  | 'community_update'
  | 'health_tip'
  | 'challenge_reminder'
  | 'achievement_unlock'
  | 'crisis_support';

export interface NotificationSettings {
  enabled: boolean;
  morningMotivation: { enabled: boolean; time: string }; // "08:00"
  dailyReminder: { enabled: boolean; time: string };
  highRiskAlerts: boolean;
  milestoneAlerts: boolean;
  communityUpdates: boolean;
  healthTips: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "07:00"
}

// Storage Keys
const KEYS = {
  NOTIFICATION_SETTINGS: '@notification_settings',
  SCHEDULED_NOTIFICATIONS: '@scheduled_notifications',
  NOTIFICATION_HISTORY: '@notification_history',
};

// Sabah motivasyon mesajları
const MORNING_MOTIVATIONS = [
  { title: '🌅 Günaydın!', body: 'Bugün de güçlüsün! Yeni bir gün, yeni fırsatlar.' },
  { title: '☀️ Harika bir gün!', body: 'Her gün bir öncekinden daha güçlüsün. Devam et!' },
  { title: '💪 Güç sende!', body: 'Bugün de başaracaksın! Sana güveniyoruz.' },
  { title: '🌟 Yıldız gibi parlıyorsun!', body: 'Sigarasız geçen her gün bir zafer!' },
  { title: '🚀 Harika gidiyorsun!', body: 'Bugün de bu yolculukta yanındayız.' },
  { title: '💚 Sağlık senin!', body: 'Akciğerlerin her gün daha temiz. Devam!' },
  { title: '🏆 Şampiyon!', body: 'Bugün de kazanacaksın! Önce kendinle savaş.' },
  { title: '🌈 Yeni başlangıçlar!', body: 'Her sabah yeni bir fırsat. Değerlendir!' },
];

// Yüksek risk uyarı mesajları
const HIGH_RISK_WARNINGS = [
  { title: '⚠️ Dikkat!', body: 'Şu an yüksek riskli bir zaman diliminde olabilirsin. Hazırlıklı ol!' },
  { title: '🔔 Hatırlatma', body: 'Bu saatler senin için zor olabilir. SOS modunu hazır tut!' },
  { title: '💪 Güçlü ol!', body: 'Tetikleyicilere dikkat! Bir nefes egzersizi yapmak ister misin?' },
  { title: '🌊 Dalga geliyor!', body: 'İstek dalgası yaklaşıyor olabilir. Bir bardak su iç!' },
];

// Kilometre taşı kutlama mesajları
const MILESTONE_CELEBRATIONS: { [key: number]: { title: string; body: string } } = {
  1: { title: '🎉 İlk Gün Tamamlandı!', body: 'En zor adımı attın! Devam et, harikasın!' },
  3: { title: '🌟 3 Gün Sigarasız!', body: 'Nikotin vücudundan çıkmaya başladı. Süper gidiyorsun!' },
  7: { title: '🏆 1 Hafta!', body: 'Bir haftayı geride bıraktın! Bu büyük bir başarı!' },
  14: { title: '💪 2 Hafta!', body: 'İki hafta! Sigara isteği azalmaya başladı, değil mi?' },
  21: { title: '🧠 21 Gün - Alışkanlık Kırıldı!', body: 'Bilim insanları diyor ki alışkanlık değişti. Tebrikler!' },
  30: { title: '🎊 1 Ay!', body: 'Bir ay sigarasız! İnanılmaz bir başarı. Gurur duy!' },
  60: { title: '⭐ 2 Ay!', body: 'İki aydır sigarasız yaşıyorsun. Sen bir kahramansın!' },
  90: { title: '💎 3 Ay - Çeyrek Yıl!', body: 'Çeyrek yıl geride kaldı. Sağlığın geri dönüyor!' },
  100: { title: '🌟 100 Gün Efsanesi!', body: '100 gün! Bu rakama ulaşan çok az kişi var. Efsanesin!' },
  180: { title: '👑 Yarım Yıl!', body: 'Altı aydır sigarasız! Artık sigara içmeyen birisin.' },
  365: { title: '🎆 1 YIL!!!', body: 'Bir yıl sigarasız!!! Bu inanılmaz bir başarı. TEBRIKLER!' },
  730: { title: '🏅 2 YIL!', body: 'İki yıl! Artık sigara geçmişte kaldı. Efsanesin!' },
};

// Sağlık ipuçları
const HEALTH_TIPS = [
  { title: '💧 Su İç!', body: 'Günde 2-3 litre su içmek sigara isteğini azaltır.' },
  { title: '🏃 Hareket Et!', body: '15 dakikalık yürüyüş endorfin salgılar ve isteği bastırır.' },
  { title: '🍎 Sağlıklı Atıştır!', body: 'Meyve ve sebzeler sigara isteğini azaltmaya yardımcı olur.' },
  { title: '😴 Uyku Önemli!', body: 'Yeterli uyku almak stres ve sigara isteğini azaltır.' },
  { title: '🧘 Nefes Al!', body: 'Derin nefes egzersizleri anksiyeteyi azaltır.' },
  { title: '☕ Kafeine Dikkat!', body: 'Çok fazla kafein sigara isteğini tetikleyebilir.' },
  { title: '🍬 Sakız Çiğne!', body: 'Şekersiz sakız ağzını meşgul tutar ve isteği azaltır.' },
  { title: '🤝 Destek Al!', body: 'Zor anlarında bir arkadaşınla konuşmak yardımcı olur.' },
];

// Varsayılan ayarlar
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  morningMotivation: { enabled: true, time: '08:00' },
  dailyReminder: { enabled: true, time: '20:00' },
  highRiskAlerts: true,
  milestoneAlerts: true,
  communityUpdates: true,
  healthTips: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

// Bildirim ayarlarını getir
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Bildirim ayarlarını kaydet
export const saveNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<void> => {
  try {
    const currentSettings = await getNotificationSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

// Sessiz saatlerde mi kontrol et
const isInQuietHours = async (): Promise<boolean> => {
  const settings = await getNotificationSettings();
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const quietStart = settings.quietHoursStart;
  const quietEnd = settings.quietHoursEnd;
  
  // Gece yarısını geçen sessiz saatler için
  if (quietStart > quietEnd) {
    return currentTime >= quietStart || currentTime < quietEnd;
  }
  
  return currentTime >= quietStart && currentTime < quietEnd;
};

// Rastgele mesaj seç
const getRandomMessage = <T>(messages: T[]): T => {
  return messages[Math.floor(Math.random() * messages.length)];
};

// Sabah motivasyon bildirimi oluştur
export const createMorningMotivation = async (): Promise<ScheduledNotification | null> => {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.morningMotivation.enabled) return null;
  
  const message = getRandomMessage(MORNING_MOTIVATIONS);
  
  return {
    id: `morning-${Date.now()}`,
    type: 'morning_motivation',
    title: message.title,
    body: message.body,
    scheduledTime: settings.morningMotivation.time,
    isDelivered: false,
  };
};

// Yüksek risk uyarısı oluştur
export const createHighRiskWarning = async (): Promise<ScheduledNotification | null> => {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.highRiskAlerts) return null;
  if (await isInQuietHours()) return null;
  
  const currentRisk = await getCurrentRisk();
  if (currentRisk.riskLevel !== 'high' && currentRisk.riskLevel !== 'critical') return null;
  
  const message = getRandomMessage(HIGH_RISK_WARNINGS);
  
  return {
    id: `risk-${Date.now()}`,
    type: 'high_risk_warning',
    title: message.title,
    body: message.body,
    scheduledTime: new Date().toISOString(),
    isDelivered: false,
    data: { riskLevel: currentRisk.riskLevel },
  };
};

// Kilometre taşı bildirimi oluştur
export const createMilestoneNotification = async (daysSinceQuit: number): Promise<ScheduledNotification | null> => {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.milestoneAlerts) return null;
  
  const milestone = MILESTONE_CELEBRATIONS[daysSinceQuit];
  if (!milestone) return null;
  
  return {
    id: `milestone-${daysSinceQuit}`,
    type: 'milestone_celebration',
    title: milestone.title,
    body: milestone.body,
    scheduledTime: new Date().toISOString(),
    isDelivered: false,
    data: { days: daysSinceQuit },
  };
};

// Sağlık ipucu bildirimi oluştur
export const createHealthTipNotification = async (): Promise<ScheduledNotification | null> => {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.healthTips) return null;
  if (await isInQuietHours()) return null;
  
  const tip = getRandomMessage(HEALTH_TIPS);
  
  return {
    id: `health-tip-${Date.now()}`,
    type: 'health_tip',
    title: tip.title,
    body: tip.body,
    scheduledTime: new Date().toISOString(),
    isDelivered: false,
  };
};

// Günlük hatırlatıcı oluştur
export const createDailyReminder = async (daysSinceQuit: number): Promise<ScheduledNotification | null> => {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.dailyReminder.enabled) return null;
  
  const userData = await getUserData();
  const moneySaved = daysSinceQuit * (userData?.pricePerPack || 50);
  const cigarettesAvoided = daysSinceQuit * (userData?.cigarettesPerDay || 20);
  
  return {
    id: `daily-${Date.now()}`,
    type: 'daily_reminder',
    title: '📊 Günlük Özet',
    body: `${daysSinceQuit} gün sigarasız! ₺${moneySaved} tasarruf, ${cigarettesAvoided} sigara içilmedi.`,
    scheduledTime: settings.dailyReminder.time,
    isDelivered: false,
    data: { daysSinceQuit, moneySaved, cigarettesAvoided },
  };
};

// Başarı kilidi açma bildirimi
export const createAchievementNotification = (
  achievementTitle: string,
  points: number
): ScheduledNotification => {
  return {
    id: `achievement-${Date.now()}`,
    type: 'achievement_unlock',
    title: '🏆 Yeni Başarı!',
    body: `"${achievementTitle}" rozetini kazandın! +${points} puan`,
    scheduledTime: new Date().toISOString(),
    isDelivered: false,
    data: { achievementTitle, points },
  };
};

// Seri uyarısı oluştur
export const createStreakAlertNotification = (currentStreak: number): ScheduledNotification => {
  return {
    id: `streak-${Date.now()}`,
    type: 'streak_alert',
    title: '🔥 Seri Devam Ediyor!',
    body: `${currentStreak} günlük seri! Bugün de uygulamayı kullanmayı unutma.`,
    scheduledTime: new Date().toISOString(),
    isDelivered: false,
    data: { streak: currentStreak },
  };
};

// Kriz destek bildirimi
export const createCrisisSupportNotification = (): ScheduledNotification => {
  return {
    id: `crisis-${Date.now()}`,
    type: 'crisis_support',
    title: '💪 Güçlü Ol!',
    body: 'Zor bir an geçiriyor olabilirsin. SOS modunu kullanmayı düşün!',
    scheduledTime: new Date().toISOString(),
    isDelivered: false,
  };
};

// Bildirim geçmişini kaydet
export const saveNotificationToHistory = async (notification: ScheduledNotification): Promise<void> => {
  try {
    const history = await getNotificationHistory();
    history.push({
      ...notification,
      isDelivered: true,
      deliveredAt: new Date().toISOString(),
    });
    
    // Son 100 bildirimi tut
    const recentHistory = history.slice(-100);
    await AsyncStorage.setItem(KEYS.NOTIFICATION_HISTORY, JSON.stringify(recentHistory));
  } catch (error) {
    console.error('Error saving notification to history:', error);
  }
};

// Bildirim geçmişini getir
export const getNotificationHistory = async (): Promise<ScheduledNotification[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
};

// Yüksek risk saatlerini planla
export const scheduleHighRiskNotifications = async (): Promise<void> => {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.highRiskAlerts) return;
  
  const highRiskHours = await getHighRiskHours();
  
  // Her yüksek riskli saat için bildirim planla
  for (const hour of highRiskHours) {
    // Bu saat sessiz saatlerde değilse planla
    const quietStart = parseInt(settings.quietHoursStart.split(':')[0]);
    const quietEnd = parseInt(settings.quietHoursEnd.split(':')[0]);
    
    let isQuiet = false;
    if (quietStart > quietEnd) {
      isQuiet = hour >= quietStart || hour < quietEnd;
    } else {
      isQuiet = hour >= quietStart && hour < quietEnd;
    }
    
    if (!isQuiet) {
      const notification = await createHighRiskWarning();
      if (notification) {
        // Burada gerçek bildirim planlaması yapılır
        // Expo Notifications veya benzeri bir kütüphane kullanılabilir
        console.log('Scheduled high risk notification for hour:', hour);
      }
    }
  }
};

// Günlük bildirimleri planla
export const scheduleDailyNotifications = async (daysSinceQuit: number): Promise<void> => {
  const settings = await getNotificationSettings();
  if (!settings.enabled) return;
  
  // Sabah motivasyonu
  if (settings.morningMotivation.enabled) {
    const morningNotification = await createMorningMotivation();
    if (morningNotification) {
      console.log('Scheduled morning motivation');
    }
  }
  
  // Günlük hatırlatıcı
  if (settings.dailyReminder.enabled) {
    const dailyNotification = await createDailyReminder(daysSinceQuit);
    if (dailyNotification) {
      console.log('Scheduled daily reminder');
    }
  }
  
  // Kilometre taşı kontrolü
  const milestoneNotification = await createMilestoneNotification(daysSinceQuit);
  if (milestoneNotification) {
    console.log('Scheduled milestone notification for day:', daysSinceQuit);
  }
  
  // Yüksek risk bildirimleri
  await scheduleHighRiskNotifications();
};

// Tüm bildirimleri iptal et
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.SCHEDULED_NOTIFICATIONS);
    // Gerçek bildirim iptalı burada yapılır
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};

// Bildirim türüne göre ikon getir
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'morning_motivation': return 'sunny';
    case 'high_risk_warning': return 'warning';
    case 'milestone_celebration': return 'trophy';
    case 'daily_reminder': return 'calendar';
    case 'streak_alert': return 'flame';
    case 'community_update': return 'people';
    case 'health_tip': return 'heart';
    case 'challenge_reminder': return 'flag';
    case 'achievement_unlock': return 'medal';
    case 'crisis_support': return 'hand-left';
    default: return 'notifications';
  }
};

// Bildirim türüne göre renk getir
export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'morning_motivation': return '#F59E0B';
    case 'high_risk_warning': return '#EF4444';
    case 'milestone_celebration': return '#FFD700';
    case 'daily_reminder': return '#3B82F6';
    case 'streak_alert': return '#F97316';
    case 'community_update': return '#8B5CF6';
    case 'health_tip': return '#10B981';
    case 'challenge_reminder': return '#EC4899';
    case 'achievement_unlock': return '#FFD700';
    case 'crisis_support': return '#EF4444';
    default: return '#6B7280';
  }
};







