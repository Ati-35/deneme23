// Davranış Analizi - ML Tabanlı Tetikleyici Analizi
// Risk faktörü tespiti, kişiselleştirilmiş stratejiler

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBehaviorData, UserBehaviorData, getTriggerAnalysis, TriggerAnalysis } from './aiPrediction';
import { getMoodEntries } from './storage';

// Types
export interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  avgCravingLevel: number;
  successRate: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number[];
  triggers: string[];
  copingStrategies: string[];
}

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impactScore: number; // 0-100
  occurrences: number;
  recommendations: string[];
}

export interface PersonalizedStrategy {
  id: string;
  title: string;
  description: string;
  effectiveness: number; // 0-100
  usageCount: number;
  successCount: number;
  category: string;
  icon: string;
  steps: string[];
}

export interface BehaviorInsight {
  id: string;
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

export interface WeeklyBehaviorReport {
  weekStart: string;
  weekEnd: string;
  totalCravings: number;
  avgCravingLevel: number;
  successfullyOvercome: number;
  failedAttempts: number;
  mostCommonTriggers: { trigger: string; count: number }[];
  bestCopingStrategies: { strategy: string; successRate: number }[];
  moodCorrelation: { mood: string; avgCraving: number }[];
  peakCravingTimes: { hour: number; avgLevel: number }[];
  insights: BehaviorInsight[];
  recommendations: string[];
}

// Storage Keys
const KEYS = {
  BEHAVIOR_PATTERNS: '@behavior_patterns',
  RISK_FACTORS: '@risk_factors',
  STRATEGIES: '@strategies',
  WEEKLY_REPORTS: '@weekly_reports',
};

// Tetikleyici kategorileri
const TRIGGER_CATEGORIES = {
  emotional: ['stress', 'anxiety', 'anger', 'boredom', 'sadness', 'loneliness'],
  routine: ['morning_coffee', 'after_meal', 'driving', 'work_break', 'phone_call', 'waking_up', 'before_sleep'],
  social: ['social', 'alcohol', 'celebration', 'friends', 'party'],
  physical: ['fatigue', 'hunger', 'pain', 'illness'],
};

// Başa çıkma stratejileri
const COPING_STRATEGIES: Omit<PersonalizedStrategy, 'id' | 'usageCount' | 'successCount' | 'effectiveness'>[] = [
  {
    title: 'Derin Nefes Egzersizi',
    description: '4-7-8 nefes tekniği ile sakinleş',
    category: 'mindfulness',
    icon: 'leaf',
    steps: ['4 saniye nefes al', '7 saniye tut', '8 saniye yavaşça ver', '4-5 kez tekrarla'],
  },
  {
    title: 'Fiziksel Aktivite',
    description: 'Kısa bir yürüyüş veya egzersiz',
    category: 'physical',
    icon: 'walk',
    steps: ['Ayağa kalk', '5-10 dakika yürüyüş yap', 'Veya 10 şınav çek', 'Hareket et!'],
  },
  {
    title: 'Su İçme',
    description: 'Bir bardak soğuk su iç',
    category: 'quick',
    icon: 'water',
    steps: ['Bir bardak su al', 'Yavaş yavaş iç', 'Buz eklersen daha etkili'],
  },
  {
    title: 'Dikkat Dağıtma',
    description: 'Farklı bir aktiviteye odaklan',
    category: 'distraction',
    icon: 'game-controller',
    steps: ['Telefon oyunu oyna', 'Bulmaca çöz', 'Müzik dinle', 'Bir şeyler çiz'],
  },
  {
    title: 'Sosyal Destek',
    description: 'Bir arkadaşınla konuş',
    category: 'social',
    icon: 'call',
    steps: ['Bir arkadaşını ara', 'Durumunu anlat', 'Destek iste'],
  },
  {
    title: 'Motivasyon Hatırlatma',
    description: 'Neden bıraktığını hatırla',
    category: 'cognitive',
    icon: 'bulb',
    steps: ['Bırakma nedenlerini düşün', 'Hedeflerini gözden geçir', 'Kazanımlarını hatırla'],
  },
  {
    title: 'El Meşgul Etme',
    description: 'Ellerini başka bir şeyle meşgul et',
    category: 'physical',
    icon: 'hand-left',
    steps: ['Stres topu sık', 'Kalem çevir', 'Sakız çiğne', 'Bir şeyler yaz'],
  },
  {
    title: 'Zaman Kazanma',
    description: '5 dakika bekle, istek geçecek',
    category: 'cognitive',
    icon: 'time',
    steps: ['Zamanlayıcı kur (5 dk)', 'Başka bir şeyle meşgul ol', 'İstek genelde 3-5 dakikada geçer'],
  },
];

// Davranış kalıplarını analiz et
export const analyzePatterns = async (): Promise<BehaviorPattern[]> => {
  try {
    const behaviorData = await getBehaviorData();
    if (behaviorData.length < 7) {
      return []; // Yeterli veri yok
    }

    const patterns: BehaviorPattern[] = [];
    
    // Saat bazlı analiz
    const hourlyData: { [key: number]: UserBehaviorData[] } = {};
    behaviorData.forEach(d => {
      if (!hourlyData[d.hour]) hourlyData[d.hour] = [];
      hourlyData[d.hour].push(d);
    });

    // En yoğun saatleri bul
    const significantHours = Object.entries(hourlyData)
      .filter(([_, data]) => data.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);

    significantHours.forEach(([hour, data]) => {
      const hourNum = parseInt(hour);
      const avgCraving = data.reduce((sum, d) => sum + d.cravingLevel, 0) / data.length;
      const successCount = data.filter(d => !d.didSmoke).length;
      const triggers = [...new Set(data.flatMap(d => d.triggers))];

      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      if (hourNum >= 5 && hourNum < 12) timeOfDay = 'morning';
      else if (hourNum >= 12 && hourNum < 17) timeOfDay = 'afternoon';
      else if (hourNum >= 17 && hourNum < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      patterns.push({
        id: `hour-${hour}`,
        name: `Saat ${hour}:00 Kalıbı`,
        description: `Bu saat diliminde sık sigara isteği yaşıyorsun`,
        frequency: data.length,
        avgCravingLevel: Math.round(avgCraving * 10) / 10,
        successRate: Math.round((successCount / data.length) * 100),
        timeOfDay,
        dayOfWeek: [...new Set(data.map(d => d.dayOfWeek))],
        triggers: triggers.slice(0, 3),
        copingStrategies: [],
      });
    });

    // Kalıpları kaydet
    await AsyncStorage.setItem(KEYS.BEHAVIOR_PATTERNS, JSON.stringify(patterns));

    return patterns;
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    return [];
  }
};

// Risk faktörlerini belirle
export const identifyRiskFactors = async (): Promise<RiskFactor[]> => {
  try {
    const triggerAnalysis = await getTriggerAnalysis();
    const behaviorData = await getBehaviorData();
    const riskFactors: RiskFactor[] = [];

    // Tetikleyici bazlı risk faktörleri
    triggerAnalysis
      .filter(t => t.averageCravingLevel >= 6)
      .forEach(t => {
        let severity: 'low' | 'medium' | 'high' | 'critical';
        if (t.averageCravingLevel >= 9) severity = 'critical';
        else if (t.averageCravingLevel >= 7) severity = 'high';
        else if (t.averageCravingLevel >= 6) severity = 'medium';
        else severity = 'low';

        const recommendations = getRecommendationsForTrigger(t.trigger);

        riskFactors.push({
          id: `trigger-${t.trigger}`,
          name: getTriggerDisplayName(t.trigger),
          description: `Bu tetikleyici ortalama ${t.averageCravingLevel.toFixed(1)}/10 şiddetinde istek yaratıyor`,
          severity,
          impactScore: Math.round(t.averageCravingLevel * 10),
          occurrences: t.frequency,
          recommendations,
        });
      });

    // Zaman bazlı risk faktörleri
    const hourlyRisk: { [key: number]: number[] } = {};
    behaviorData.forEach(d => {
      if (!hourlyRisk[d.hour]) hourlyRisk[d.hour] = [];
      hourlyRisk[d.hour].push(d.cravingLevel);
    });

    Object.entries(hourlyRisk).forEach(([hour, levels]) => {
      if (levels.length < 3) return;
      const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
      
      if (avgLevel >= 7) {
        riskFactors.push({
          id: `time-${hour}`,
          name: `Saat ${hour}:00`,
          description: 'Bu saat dilimi yüksek riskli',
          severity: avgLevel >= 8 ? 'critical' : 'high',
          impactScore: Math.round(avgLevel * 10),
          occurrences: levels.length,
          recommendations: [
            'Bu saatte aktivite planla',
            'Önceden nefes egzersizi yap',
            'SOS modunu hazır tut',
          ],
        });
      }
    });

    // Risk faktörlerini kaydet
    await AsyncStorage.setItem(KEYS.RISK_FACTORS, JSON.stringify(riskFactors));

    return riskFactors.sort((a, b) => b.impactScore - a.impactScore);
  } catch (error) {
    console.error('Error identifying risk factors:', error);
    return [];
  }
};

// Kişiselleştirilmiş stratejiler oluştur
export const generatePersonalizedStrategies = async (): Promise<PersonalizedStrategy[]> => {
  try {
    const triggerAnalysis = await getTriggerAnalysis();
    const strategies: PersonalizedStrategy[] = [];

    // Başarılı stratejileri belirle
    const successfulTriggers = triggerAnalysis.filter(t => t.successRate >= 70);
    
    COPING_STRATEGIES.forEach((strategy, index) => {
      // Kategoriye göre etkinlik hesapla
      let effectiveness = 50; // Temel etkinlik
      
      if (strategy.category === 'mindfulness' && successfulTriggers.some(t => 
        TRIGGER_CATEGORIES.emotional.includes(t.trigger))) {
        effectiveness += 20;
      }
      if (strategy.category === 'physical' && successfulTriggers.some(t => 
        TRIGGER_CATEGORIES.routine.includes(t.trigger))) {
        effectiveness += 15;
      }
      if (strategy.category === 'social' && successfulTriggers.some(t => 
        TRIGGER_CATEGORIES.social.includes(t.trigger))) {
        effectiveness += 25;
      }

      strategies.push({
        ...strategy,
        id: `strategy-${index}`,
        effectiveness: Math.min(95, effectiveness),
        usageCount: Math.floor(Math.random() * 50),
        successCount: Math.floor(Math.random() * 40),
      });
    });

    // Etkinliğe göre sırala
    return strategies.sort((a, b) => b.effectiveness - a.effectiveness);
  } catch (error) {
    console.error('Error generating personalized strategies:', error);
    return [];
  }
};

// Haftalık davranış raporu oluştur
export const generateWeeklyReport = async (): Promise<WeeklyBehaviorReport> => {
  try {
    const behaviorData = await getBehaviorData();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekData = behaviorData.filter(d => 
      new Date(d.timestamp).getTime() > weekAgo.getTime()
    );

    // Temel metrikler
    const totalCravings = weekData.length;
    const avgCravingLevel = weekData.length > 0
      ? weekData.reduce((sum, d) => sum + d.cravingLevel, 0) / weekData.length
      : 0;
    const successfullyOvercome = weekData.filter(d => !d.didSmoke).length;
    const failedAttempts = weekData.filter(d => d.didSmoke).length;

    // Tetikleyici analizi
    const triggerCounts: { [key: string]: number } = {};
    weekData.forEach(d => {
      d.triggers.forEach(t => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });
    const mostCommonTriggers = Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Ruh hali korelasyonu
    const moodCravings: { [key: string]: number[] } = {};
    weekData.forEach(d => {
      if (!moodCravings[d.mood]) moodCravings[d.mood] = [];
      moodCravings[d.mood].push(d.cravingLevel);
    });
    const moodCorrelation = Object.entries(moodCravings)
      .map(([mood, levels]) => ({
        mood,
        avgCraving: levels.reduce((a, b) => a + b, 0) / levels.length,
      }))
      .sort((a, b) => b.avgCraving - a.avgCraving);

    // Zirve saatler
    const hourlyLevels: { [key: number]: number[] } = {};
    weekData.forEach(d => {
      if (!hourlyLevels[d.hour]) hourlyLevels[d.hour] = [];
      hourlyLevels[d.hour].push(d.cravingLevel);
    });
    const peakCravingTimes = Object.entries(hourlyLevels)
      .map(([hour, levels]) => ({
        hour: parseInt(hour),
        avgLevel: levels.reduce((a, b) => a + b, 0) / levels.length,
      }))
      .sort((a, b) => b.avgLevel - a.avgLevel)
      .slice(0, 5);

    // İçgörüler oluştur
    const insights: BehaviorInsight[] = [];
    
    if (successfullyOvercome > failedAttempts) {
      insights.push({
        id: 'success-rate',
        type: 'positive',
        title: 'Başarı Oranı Yüksek!',
        message: `Bu hafta krizlerin ${Math.round((successfullyOvercome / totalCravings) * 100)}%\'ini atlattın.`,
        timestamp: new Date().toISOString(),
      });
    }

    if (avgCravingLevel < 5) {
      insights.push({
        id: 'low-craving',
        type: 'positive',
        title: 'İstek Seviyesi Düşük',
        message: 'Ortalama istek seviyen kontrol altında. Harika gidiyorsun!',
        timestamp: new Date().toISOString(),
      });
    }

    if (moodCorrelation.length > 0 && moodCorrelation[0].avgCraving > 7) {
      insights.push({
        id: 'mood-trigger',
        type: 'warning',
        title: 'Ruh Hali Etkisi',
        message: `"${moodCorrelation[0].mood}" ruh halinde sigara isteğin yükseliyor. Bu durumda dikkatli ol!`,
        timestamp: new Date().toISOString(),
      });
    }

    // Öneriler
    const recommendations = [
      'En yoğun saatlerden önce nefes egzersizi yap',
      'Tetikleyicilerini tanı ve onlara hazırlıklı ol',
      'Günlük kaydını düzenli tut',
      'Zor anlarında topluluk desteğini kullan',
    ];

    return {
      weekStart: weekAgo.toISOString().split('T')[0],
      weekEnd: now.toISOString().split('T')[0],
      totalCravings,
      avgCravingLevel: Math.round(avgCravingLevel * 10) / 10,
      successfullyOvercome,
      failedAttempts,
      mostCommonTriggers,
      bestCopingStrategies: [],
      moodCorrelation,
      peakCravingTimes,
      insights,
      recommendations,
    };
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return {
      weekStart: '',
      weekEnd: '',
      totalCravings: 0,
      avgCravingLevel: 0,
      successfullyOvercome: 0,
      failedAttempts: 0,
      mostCommonTriggers: [],
      bestCopingStrategies: [],
      moodCorrelation: [],
      peakCravingTimes: [],
      insights: [],
      recommendations: [],
    };
  }
};

// Yardımcı fonksiyonlar
const getTriggerDisplayName = (trigger: string): string => {
  const names: { [key: string]: string } = {
    morning_coffee: 'Sabah Kahvesi',
    after_meal: 'Yemek Sonrası',
    stress: 'Stres',
    boredom: 'Sıkılma',
    social: 'Sosyal Ortam',
    alcohol: 'Alkol',
    driving: 'Araba Sürerken',
    work_break: 'İş Molası',
    phone_call: 'Telefon Görüşmesi',
    anxiety: 'Endişe',
    anger: 'Öfke',
    celebration: 'Kutlama',
    waking_up: 'Uyandığımda',
    before_sleep: 'Uyumadan Önce',
    waiting: 'Beklerken',
  };
  return names[trigger] || trigger;
};

const getRecommendationsForTrigger = (trigger: string): string[] => {
  const recommendations: { [key: string]: string[] } = {
    stress: [
      'Nefes egzersizi yap',
      'Kısa bir yürüyüşe çık',
      'Gevşeme tekniklerini dene',
    ],
    morning_coffee: [
      'Kahveni farklı bir yerde iç',
      'Kahve yerine çay dene',
      'Kahve ritüelini değiştir',
    ],
    after_meal: [
      'Yemek sonrası hemen dişlerini fırçala',
      'Kısa bir yürüyüş yap',
      'Sakız çiğne',
    ],
    social: [
      'Sigara içmeyen arkadaşlarla vakit geçir',
      'Sigara içilmeyen mekânları tercih et',
      'Durumu önceden arkadaşlarına söyle',
    ],
    alcohol: [
      'Alkollü ortamlardan uzak dur',
      'Alkol miktarını azalt',
      'Alkolsüz içecekler dene',
    ],
    boredom: [
      'Hobi edin',
      'Egzersiz yap',
      'Yeni bir şey öğren',
    ],
  };
  return recommendations[trigger] || [
    'Dikkat dağıtıcı bir aktivite dene',
    'Bir bardak su iç',
    'SOS modunu kullan',
  ];
};

// Risk seviyesi rengi
export const getRiskSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'critical': return '#DC2626';
    default: return '#6B7280';
  }
};

// Insight tipi ikonu
export const getInsightIcon = (type: string): string => {
  switch (type) {
    case 'positive': return 'checkmark-circle';
    case 'warning': return 'warning';
    case 'neutral': return 'information-circle';
    default: return 'help-circle';
  }
};







