// Günlük İpucu Sistemi
// Her gün yeni ipucu, kategori bazlı, favoriler

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyTip {
  id: string;
  category: TipCategory;
  title: string;
  content: string;
  icon: string;
  author?: string;
  source?: string;
}

export type TipCategory = 'health' | 'psychology' | 'nutrition' | 'exercise' | 'motivation' | 'finance' | 'social';

export interface TipProgress {
  currentTipIndex: number;
  lastShownDate: string;
  viewedTips: string[];
  favoriteTips: string[];
}

// Storage keys
const KEYS = {
  TIP_PROGRESS: '@tip_progress',
  FAVORITE_TIPS: '@favorite_tips',
};

// Günlük ipuçları veritabanı
export const DAILY_TIPS: DailyTip[] = [
  // Sağlık İpuçları
  {
    id: 'health_1',
    category: 'health',
    title: 'Su İç',
    content: 'Sigara isteği geldiğinde bir bardak su iç. Su, vücuttaki toksinlerin atılmasına yardımcı olur ve isteği azaltır.',
    icon: '💧',
    author: 'Sağlık Uzmanı',
  },
  {
    id: 'health_2',
    category: 'health',
    title: 'Derin Nefes Al',
    content: '4-7-8 tekniğini dene: 4 saniye nefes al, 7 saniye tut, 8 saniye ver. Bu, stres hormonlarını azaltır.',
    icon: '🌬️',
  },
  {
    id: 'health_3',
    category: 'health',
    title: 'Uyku Düzenine Dikkat',
    content: 'Yeterli uyku almak, sigara isteğiyle başa çıkma gücünü artırır. Günde 7-8 saat uyumaya çalış.',
    icon: '😴',
  },
  {
    id: 'health_4',
    category: 'health',
    title: 'Vitamin C Takviyesi',
    content: 'Sigara içmek vücuttaki C vitamini seviyesini düşürür. Portakal, kivi ve brokoli tüket.',
    icon: '🍊',
  },
  {
    id: 'health_5',
    category: 'health',
    title: 'Akciğer Egzersizi',
    content: 'Günde 10 dakika balon şişirme egzersizi yap. Bu, akciğer kapasiteni artırır.',
    icon: '🎈',
  },

  // Psikoloji İpuçları
  {
    id: 'psychology_1',
    category: 'psychology',
    title: 'Tetikleyicileri Tanı',
    content: 'Sigara içme isteğini tetikleyen durumları not et. Farkındalık, kontrolün ilk adımıdır.',
    icon: '🎯',
  },
  {
    id: 'psychology_2',
    category: 'psychology',
    title: '5 Dakika Kuralı',
    content: 'İstek geldiğinde "5 dakika bekleyeceğim" de. Çoğu istek 5 dakika içinde geçer.',
    icon: '⏱️',
  },
  {
    id: 'psychology_3',
    category: 'psychology',
    title: 'Pozitif Konuşma',
    content: '"Sigara içemiyorum" yerine "Sigara içmiyorum" de. Bu, güç ve kontrol hissi verir.',
    icon: '💬',
  },
  {
    id: 'psychology_4',
    category: 'psychology',
    title: 'Başarılarını Kutla',
    content: 'Her küçük başarı önemli! 1 saat, 1 gün, 1 hafta... Her birini kutla.',
    icon: '🎉',
  },
  {
    id: 'psychology_5',
    category: 'psychology',
    title: 'Visualization',
    content: 'Kendini sigarasız, sağlıklı bir şekilde hayal et. Bu, beynini yeniden programlar.',
    icon: '🧘',
  },

  // Beslenme İpuçları
  {
    id: 'nutrition_1',
    category: 'nutrition',
    title: 'Şekerden Kaçın',
    content: 'Şekerli gıdalar istek artırabilir. Bunun yerine meyve ye.',
    icon: '🍎',
  },
  {
    id: 'nutrition_2',
    category: 'nutrition',
    title: 'Sakız Çiğne',
    content: 'Şekersiz sakız, ağız meşguliyeti sağlar ve istek azaltır.',
    icon: '🍬',
  },
  {
    id: 'nutrition_3',
    category: 'nutrition',
    title: 'Yeşil Çay İç',
    content: 'Yeşil çay antioksidan içerir ve metabolizmayı hızlandırır.',
    icon: '🍵',
  },
  {
    id: 'nutrition_4',
    category: 'nutrition',
    title: 'Omega-3 Al',
    content: 'Balık, ceviz ve keten tohumu tüket. Omega-3, ruh halini iyileştirir.',
    icon: '🐟',
  },
  {
    id: 'nutrition_5',
    category: 'nutrition',
    title: 'Kahve Azalt',
    content: 'Fazla kafein anksiyeteyi artırabilir. Günde 2 fincana sınırla.',
    icon: '☕',
  },

  // Egzersiz İpuçları
  {
    id: 'exercise_1',
    category: 'exercise',
    title: 'Yürüyüş Yap',
    content: '15 dakikalık tempolu yürüyüş, sigara isteğini %50 azaltabilir.',
    icon: '🚶',
  },
  {
    id: 'exercise_2',
    category: 'exercise',
    title: 'Merdiven Çık',
    content: 'Asansör yerine merdiven kullan. Hem kalori yakar hem akciğerleri güçlendirir.',
    icon: '🪜',
  },
  {
    id: 'exercise_3',
    category: 'exercise',
    title: 'Sabah Esnemesi',
    content: 'Güne 5 dakikalık esneme egzersizi ile başla. Enerji ve motivasyon verir.',
    icon: '🤸',
  },
  {
    id: 'exercise_4',
    category: 'exercise',
    title: 'Bisiklet Sür',
    content: 'Bisiklet sürmek hem eğlenceli hem de kardiyovasküler sağlığa iyi gelir.',
    icon: '🚴',
  },
  {
    id: 'exercise_5',
    category: 'exercise',
    title: 'Dans Et',
    content: 'Favori müziğini aç ve 10 dakika dans et. Endorfin salgılatır!',
    icon: '💃',
  },

  // Motivasyon İpuçları
  {
    id: 'motivation_1',
    category: 'motivation',
    title: 'Nedenini Hatırla',
    content: 'Sigara bırakma nedenlerini bir yere yaz ve zor anlarda oku.',
    icon: '📝',
  },
  {
    id: 'motivation_2',
    category: 'motivation',
    title: 'Destek Al',
    content: 'Arkadaş veya aile desteği başarı şansını 2 kat artırır.',
    icon: '🤝',
  },
  {
    id: 'motivation_3',
    category: 'motivation',
    title: 'Başarı Hikayeleri',
    content: 'Başaran kişilerin hikayelerini oku. Sen de başarabilirsin!',
    icon: '⭐',
  },
  {
    id: 'motivation_4',
    category: 'motivation',
    title: 'Küçük Adımlar',
    content: 'Her gün sadece bugünü düşün. Gün gün ilerle.',
    icon: '👣',
  },
  {
    id: 'motivation_5',
    category: 'motivation',
    title: 'Affet Kendini',
    content: 'Hata yaparsan kendini affet ve devam et. Mükemmel olmak zorunda değilsin.',
    icon: '❤️',
  },

  // Finans İpuçları
  {
    id: 'finance_1',
    category: 'finance',
    title: 'Tasarrufu Hesapla',
    content: 'Günlük tasarrufunu hesapla ve bir hedefe koy. Motivasyon kaynağı olur.',
    icon: '💰',
  },
  {
    id: 'finance_2',
    category: 'finance',
    title: 'Ödül Ver',
    content: 'Her hafta tasarrufunun bir kısmını kendin için harca.',
    icon: '🎁',
  },
  {
    id: 'finance_3',
    category: 'finance',
    title: 'Kumbara Kur',
    content: 'Sigara parası için fiziksel veya sanal kumbara oluştur.',
    icon: '🐷',
  },

  // Sosyal İpuçları
  {
    id: 'social_1',
    category: 'social',
    title: 'Destek Grubu',
    content: 'Benzer yolculuktaki insanlarla bağlantı kur. Yalnız değilsin.',
    icon: '👥',
  },
  {
    id: 'social_2',
    category: 'social',
    title: 'Sigara İçenlere Dikkat',
    content: 'İlk haftalarda sigara içenlerden uzak durmaya çalış.',
    icon: '🚭',
  },
  {
    id: 'social_3',
    category: 'social',
    title: 'Yeni Hobiler',
    content: 'Sosyal aktivitelere katıl. Yeni insanlarla tanış, yeni hobiler edin.',
    icon: '🎨',
  },
];

// Kategori bilgileri
export const TIP_CATEGORIES: { id: TipCategory; name: string; icon: string; color: string }[] = [
  { id: 'health', name: 'Sağlık', icon: 'heart', color: '#EF4444' },
  { id: 'psychology', name: 'Psikoloji', icon: 'brain', color: '#8B5CF6' },
  { id: 'nutrition', name: 'Beslenme', icon: 'nutrition', color: '#F59E0B' },
  { id: 'exercise', name: 'Egzersiz', icon: 'fitness', color: '#10B981' },
  { id: 'motivation', name: 'Motivasyon', icon: 'rocket', color: '#3B82F6' },
  { id: 'finance', name: 'Finans', icon: 'cash', color: '#22C55E' },
  { id: 'social', name: 'Sosyal', icon: 'people', color: '#EC4899' },
];

// İlerleme durumunu getir
export const getTipProgress = async (): Promise<TipProgress> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TIP_PROGRESS);
    return data ? JSON.parse(data) : {
      currentTipIndex: 0,
      lastShownDate: '',
      viewedTips: [],
      favoriteTips: [],
    };
  } catch (error) {
    console.error('Error getting tip progress:', error);
    return {
      currentTipIndex: 0,
      lastShownDate: '',
      viewedTips: [],
      favoriteTips: [],
    };
  }
};

// İlerleme durumunu kaydet
export const saveTipProgress = async (progress: TipProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.TIP_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving tip progress:', error);
  }
};

// Günün ipucunu getir
export const getDailyTip = async (): Promise<DailyTip> => {
  const progress = await getTipProgress();
  const today = new Date().toISOString().split('T')[0];
  
  if (progress.lastShownDate !== today) {
    // Yeni gün, yeni ipucu
    const newIndex = (progress.currentTipIndex + 1) % DAILY_TIPS.length;
    await saveTipProgress({
      ...progress,
      currentTipIndex: newIndex,
      lastShownDate: today,
      viewedTips: [...new Set([...progress.viewedTips, DAILY_TIPS[newIndex].id])],
    });
    return DAILY_TIPS[newIndex];
  }
  
  return DAILY_TIPS[progress.currentTipIndex];
};

// Rastgele ipucu getir
export const getRandomTip = (category?: TipCategory): DailyTip => {
  let tips = DAILY_TIPS;
  
  if (category) {
    tips = DAILY_TIPS.filter(t => t.category === category);
  }
  
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
};

// Kategoriye göre ipuçları getir
export const getTipsByCategory = (category: TipCategory): DailyTip[] => {
  return DAILY_TIPS.filter(t => t.category === category);
};

// Favori ekle/kaldır
export const toggleFavoriteTip = async (tipId: string): Promise<boolean> => {
  try {
    const progress = await getTipProgress();
    const isFavorite = progress.favoriteTips.includes(tipId);
    
    const newFavorites = isFavorite
      ? progress.favoriteTips.filter(id => id !== tipId)
      : [...progress.favoriteTips, tipId];
    
    await saveTipProgress({
      ...progress,
      favoriteTips: newFavorites,
    });
    
    return !isFavorite;
  } catch (error) {
    console.error('Error toggling favorite tip:', error);
    return false;
  }
};

// Favori ipuçlarını getir
export const getFavoriteTips = async (): Promise<DailyTip[]> => {
  try {
    const progress = await getTipProgress();
    return DAILY_TIPS.filter(t => progress.favoriteTips.includes(t.id));
  } catch (error) {
    console.error('Error getting favorite tips:', error);
    return [];
  }
};

// İpucu favorilerde mi?
export const isTipFavorite = async (tipId: string): Promise<boolean> => {
  try {
    const progress = await getTipProgress();
    return progress.favoriteTips.includes(tipId);
  } catch (error) {
    return false;
  }
};

// Görülen ipucu sayısı
export const getViewedTipsCount = async (): Promise<number> => {
  const progress = await getTipProgress();
  return progress.viewedTips.length;
};

// Toplam ipucu sayısı
export const getTotalTipsCount = (): number => {
  return DAILY_TIPS.length;
};

// Kategori bazlı ilerleme
export const getCategoryProgress = async (): Promise<Record<TipCategory, { viewed: number; total: number }>> => {
  const progress = await getTipProgress();
  
  const categoryProgress: Record<TipCategory, { viewed: number; total: number }> = {
    health: { viewed: 0, total: 0 },
    psychology: { viewed: 0, total: 0 },
    nutrition: { viewed: 0, total: 0 },
    exercise: { viewed: 0, total: 0 },
    motivation: { viewed: 0, total: 0 },
    finance: { viewed: 0, total: 0 },
    social: { viewed: 0, total: 0 },
  };
  
  DAILY_TIPS.forEach(tip => {
    categoryProgress[tip.category].total++;
    if (progress.viewedTips.includes(tip.id)) {
      categoryProgress[tip.category].viewed++;
    }
  });
  
  return categoryProgress;
};
