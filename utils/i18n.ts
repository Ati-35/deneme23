// Uluslararasılaştırma (i18n)
// Çoklu dil desteği, RTL dil, dinamik dil değiştirme

import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

// Types
export type Language = 'tr' | 'en' | 'de' | 'fr' | 'ar';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  isRTL: boolean;
  flag: string;
}

export interface Translations {
  [key: string]: string | Translations;
}

// Storage Keys
const KEYS = {
  CURRENT_LANGUAGE: '@current_language',
};

// Desteklenen diller
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', isRTL: false, flag: '🇹🇷' },
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false, flag: '🇬🇧' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false, flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false, flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true, flag: '🇸🇦' },
];

// Çeviriler
const TRANSLATIONS: Record<Language, Translations> = {
  tr: {
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      back: 'Geri',
      next: 'İleri',
      done: 'Tamam',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      yes: 'Evet',
      no: 'Hayır',
      ok: 'Tamam',
    },
    home: {
      title: 'Ana Sayfa',
      daysSmokeFree: 'gün sigarasız',
      cigarettesNotSmoked: 'sigara içilmedi',
      moneySaved: 'tasarruf edildi',
      lifeSaved: 'kazanılan ömür',
      todayMotivation: 'Günün Motivasyonu',
      quickActions: 'Hızlı İşlemler',
      healthProgress: 'Sağlık İlerlemesi',
    },
    stats: {
      title: 'İstatistikler',
      weekly: 'Haftalık',
      monthly: 'Aylık',
      yearly: 'Yıllık',
      allTime: 'Tüm Zamanlar',
      trend: 'Trend',
      average: 'Ortalama',
    },
    community: {
      title: 'Topluluk',
      newPost: 'Yeni Paylaşım',
      likes: 'beğeni',
      comments: 'yorum',
      share: 'Paylaş',
      report: 'Şikayet Et',
    },
    education: {
      title: 'Eğitim',
      videos: 'Videolar',
      articles: 'Makaleler',
      tips: 'İpuçları',
      progress: 'İlerleme',
    },
    profile: {
      title: 'Profil',
      settings: 'Ayarlar',
      achievements: 'Başarılar',
      notifications: 'Bildirimler',
      language: 'Dil',
      theme: 'Tema',
      privacy: 'Gizlilik',
      logout: 'Çıkış Yap',
    },
    crisis: {
      title: 'SOS',
      needHelp: 'Yardım mı lazım?',
      breathingExercise: 'Nefes Egzersizi',
      distractions: 'Dikkat Dağıtıcılar',
      callSupport: 'Destek Ara',
      youCanDoThis: 'Başarabilirsin!',
    },
    journal: {
      title: 'Günlük',
      newEntry: 'Yeni Kayıt',
      mood: 'Ruh Hali',
      craving: 'İstek Seviyesi',
      triggers: 'Tetikleyiciler',
      notes: 'Notlar',
    },
    achievements: {
      title: 'Başarılar',
      unlocked: 'Açıldı',
      locked: 'Kilitli',
      progress: 'İlerleme',
      points: 'puan',
      level: 'Seviye',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
    },
    home: {
      title: 'Home',
      daysSmokeFree: 'days smoke-free',
      cigarettesNotSmoked: 'cigarettes not smoked',
      moneySaved: 'money saved',
      lifeSaved: 'life regained',
      todayMotivation: 'Today\'s Motivation',
      quickActions: 'Quick Actions',
      healthProgress: 'Health Progress',
    },
    stats: {
      title: 'Statistics',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      allTime: 'All Time',
      trend: 'Trend',
      average: 'Average',
    },
    community: {
      title: 'Community',
      newPost: 'New Post',
      likes: 'likes',
      comments: 'comments',
      share: 'Share',
      report: 'Report',
    },
    education: {
      title: 'Education',
      videos: 'Videos',
      articles: 'Articles',
      tips: 'Tips',
      progress: 'Progress',
    },
    profile: {
      title: 'Profile',
      settings: 'Settings',
      achievements: 'Achievements',
      notifications: 'Notifications',
      language: 'Language',
      theme: 'Theme',
      privacy: 'Privacy',
      logout: 'Log Out',
    },
    crisis: {
      title: 'SOS',
      needHelp: 'Need help?',
      breathingExercise: 'Breathing Exercise',
      distractions: 'Distractions',
      callSupport: 'Call Support',
      youCanDoThis: 'You can do this!',
    },
    journal: {
      title: 'Journal',
      newEntry: 'New Entry',
      mood: 'Mood',
      craving: 'Craving Level',
      triggers: 'Triggers',
      notes: 'Notes',
    },
    achievements: {
      title: 'Achievements',
      unlocked: 'Unlocked',
      locked: 'Locked',
      progress: 'Progress',
      points: 'points',
      level: 'Level',
    },
  },
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      back: 'Zurück',
      next: 'Weiter',
      done: 'Fertig',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      yes: 'Ja',
      no: 'Nein',
      ok: 'OK',
    },
    home: {
      title: 'Startseite',
      daysSmokeFree: 'Tage rauchfrei',
      cigarettesNotSmoked: 'Zigaretten nicht geraucht',
      moneySaved: 'Geld gespart',
      lifeSaved: 'Leben zurückgewonnen',
      todayMotivation: 'Motivation des Tages',
      quickActions: 'Schnellaktionen',
      healthProgress: 'Gesundheitsfortschritt',
    },
    stats: {
      title: 'Statistiken',
      weekly: 'Wöchentlich',
      monthly: 'Monatlich',
      yearly: 'Jährlich',
      allTime: 'Gesamt',
      trend: 'Trend',
      average: 'Durchschnitt',
    },
    community: {
      title: 'Gemeinschaft',
      newPost: 'Neuer Beitrag',
      likes: 'Gefällt mir',
      comments: 'Kommentare',
      share: 'Teilen',
      report: 'Melden',
    },
    education: {
      title: 'Bildung',
      videos: 'Videos',
      articles: 'Artikel',
      tips: 'Tipps',
      progress: 'Fortschritt',
    },
    profile: {
      title: 'Profil',
      settings: 'Einstellungen',
      achievements: 'Erfolge',
      notifications: 'Benachrichtigungen',
      language: 'Sprache',
      theme: 'Thema',
      privacy: 'Datenschutz',
      logout: 'Abmelden',
    },
    crisis: {
      title: 'SOS',
      needHelp: 'Brauchen Sie Hilfe?',
      breathingExercise: 'Atemübung',
      distractions: 'Ablenkungen',
      callSupport: 'Support anrufen',
      youCanDoThis: 'Du schaffst das!',
    },
    journal: {
      title: 'Tagebuch',
      newEntry: 'Neuer Eintrag',
      mood: 'Stimmung',
      craving: 'Verlangen',
      triggers: 'Auslöser',
      notes: 'Notizen',
    },
    achievements: {
      title: 'Erfolge',
      unlocked: 'Freigeschaltet',
      locked: 'Gesperrt',
      progress: 'Fortschritt',
      points: 'Punkte',
      level: 'Stufe',
    },
  },
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      back: 'Retour',
      next: 'Suivant',
      done: 'Terminé',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      yes: 'Oui',
      no: 'Non',
      ok: 'OK',
    },
    home: {
      title: 'Accueil',
      daysSmokeFree: 'jours sans fumer',
      cigarettesNotSmoked: 'cigarettes non fumées',
      moneySaved: 'argent économisé',
      lifeSaved: 'vie récupérée',
      todayMotivation: 'Motivation du jour',
      quickActions: 'Actions rapides',
      healthProgress: 'Progrès de santé',
    },
    stats: {
      title: 'Statistiques',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      yearly: 'Annuel',
      allTime: 'Tout le temps',
      trend: 'Tendance',
      average: 'Moyenne',
    },
    community: {
      title: 'Communauté',
      newPost: 'Nouveau post',
      likes: 'mentions j\'aime',
      comments: 'commentaires',
      share: 'Partager',
      report: 'Signaler',
    },
    education: {
      title: 'Éducation',
      videos: 'Vidéos',
      articles: 'Articles',
      tips: 'Conseils',
      progress: 'Progrès',
    },
    profile: {
      title: 'Profil',
      settings: 'Paramètres',
      achievements: 'Réalisations',
      notifications: 'Notifications',
      language: 'Langue',
      theme: 'Thème',
      privacy: 'Confidentialité',
      logout: 'Déconnexion',
    },
    crisis: {
      title: 'SOS',
      needHelp: 'Besoin d\'aide?',
      breathingExercise: 'Exercice de respiration',
      distractions: 'Distractions',
      callSupport: 'Appeler le support',
      youCanDoThis: 'Tu peux le faire!',
    },
    journal: {
      title: 'Journal',
      newEntry: 'Nouvelle entrée',
      mood: 'Humeur',
      craving: 'Niveau d\'envie',
      triggers: 'Déclencheurs',
      notes: 'Notes',
    },
    achievements: {
      title: 'Réalisations',
      unlocked: 'Débloqué',
      locked: 'Verrouillé',
      progress: 'Progrès',
      points: 'points',
      level: 'Niveau',
    },
  },
  ar: {
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      back: 'رجوع',
      next: 'التالي',
      done: 'تم',
      loading: 'جار التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      yes: 'نعم',
      no: 'لا',
      ok: 'موافق',
    },
    home: {
      title: 'الرئيسية',
      daysSmokeFree: 'أيام بدون تدخين',
      cigarettesNotSmoked: 'سجائر لم تدخن',
      moneySaved: 'المال المدخر',
      lifeSaved: 'العمر المستعاد',
      todayMotivation: 'تحفيز اليوم',
      quickActions: 'إجراءات سريعة',
      healthProgress: 'تقدم الصحة',
    },
    stats: {
      title: 'الإحصائيات',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      yearly: 'سنوي',
      allTime: 'كل الوقت',
      trend: 'الاتجاه',
      average: 'المتوسط',
    },
    community: {
      title: 'المجتمع',
      newPost: 'منشور جديد',
      likes: 'إعجاب',
      comments: 'تعليقات',
      share: 'مشاركة',
      report: 'إبلاغ',
    },
    education: {
      title: 'التعليم',
      videos: 'فيديوهات',
      articles: 'مقالات',
      tips: 'نصائح',
      progress: 'التقدم',
    },
    profile: {
      title: 'الملف الشخصي',
      settings: 'الإعدادات',
      achievements: 'الإنجازات',
      notifications: 'الإشعارات',
      language: 'اللغة',
      theme: 'المظهر',
      privacy: 'الخصوصية',
      logout: 'تسجيل الخروج',
    },
    crisis: {
      title: 'طوارئ',
      needHelp: 'تحتاج مساعدة؟',
      breathingExercise: 'تمرين التنفس',
      distractions: 'الإلهاء',
      callSupport: 'اتصل بالدعم',
      youCanDoThis: 'يمكنك فعلها!',
    },
    journal: {
      title: 'اليوميات',
      newEntry: 'إدخال جديد',
      mood: 'المزاج',
      craving: 'مستوى الرغبة',
      triggers: 'المحفزات',
      notes: 'ملاحظات',
    },
    achievements: {
      title: 'الإنجازات',
      unlocked: 'مفتوح',
      locked: 'مقفل',
      progress: 'التقدم',
      points: 'نقاط',
      level: 'المستوى',
    },
  },
};

// Mevcut dil
let currentLanguage: Language = 'tr';

// Dili getir
export const getCurrentLanguage = async (): Promise<Language> => {
  try {
    const saved = await AsyncStorage.getItem(KEYS.CURRENT_LANGUAGE);
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      currentLanguage = saved as Language;
    }
    return currentLanguage;
  } catch (error) {
    console.error('Error getting current language:', error);
    return 'tr';
  }
};

// Dili değiştir
export const setLanguage = async (language: Language): Promise<void> => {
  try {
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === language);
    if (!langInfo) {
      throw new Error(`Unsupported language: ${language}`);
    }

    currentLanguage = language;
    await AsyncStorage.setItem(KEYS.CURRENT_LANGUAGE, language);

    // RTL ayarı
    if (I18nManager.isRTL !== langInfo.isRTL) {
      I18nManager.forceRTL(langInfo.isRTL);
      // Uygulamanın yeniden başlatılması gerekebilir
    }

    console.log(`Language changed to: ${language}`);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

// Çeviri getir
export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let translation: any = TRANSLATIONS[currentLanguage];

  for (const k of keys) {
    if (translation && typeof translation === 'object') {
      translation = translation[k];
    } else {
      // Bulunamazsa Türkçe'ye dön
      translation = getNestedValue(TRANSLATIONS.tr, keys);
      break;
    }
  }

  if (typeof translation !== 'string') {
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }

  // Parametreleri değiştir
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    });
  }

  return translation;
};

// İç içe değer getir
const getNestedValue = (obj: any, keys: string[]): any => {
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
};

// Dil bilgisini getir
export const getLanguageInfo = (code: Language): LanguageInfo | undefined => {
  return SUPPORTED_LANGUAGES.find(l => l.code === code);
};

// Mevcut dil RTL mi?
export const isRTL = (): boolean => {
  const langInfo = getLanguageInfo(currentLanguage);
  return langInfo?.isRTL ?? false;
};

// Sayıyı formatla (dil bazlı)
export const formatNumber = (num: number): string => {
  const locale = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
    ar: 'ar-SA',
  }[currentLanguage];

  return new Intl.NumberFormat(locale).format(num);
};

// Tarihi formatla (dil bazlı)
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const locale = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
    ar: 'ar-SA',
  }[currentLanguage];

  return new Intl.DateTimeFormat(locale, options).format(date);
};

// Para birimini formatla (dil bazlı)
export const formatCurrency = (amount: number): string => {
  const currencyMap = {
    tr: { currency: 'TRY', locale: 'tr-TR' },
    en: { currency: 'USD', locale: 'en-US' },
    de: { currency: 'EUR', locale: 'de-DE' },
    fr: { currency: 'EUR', locale: 'fr-FR' },
    ar: { currency: 'SAR', locale: 'ar-SA' },
  };

  const { currency, locale } = currencyMap[currentLanguage];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Çoğul form (basit)
export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

// Dili başlat
export const initLanguage = async (): Promise<void> => {
  await getCurrentLanguage();
  console.log(`Language initialized: ${currentLanguage}`);
};




