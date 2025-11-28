// AI Sigara İsteği Tahmin Motoru
// Kullanıcı davranışlarını analiz ederek sigara isteğinin geleceği zamanları tahmin eder

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface CravingPrediction {
  hour: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  triggers: string[];
  recommendation: string;
}

export interface UserBehaviorData {
  id: string;
  timestamp: string;
  hour: number;
  dayOfWeek: number;
  mood: string;
  stressLevel: number; // 1-10
  cravingLevel: number; // 1-10
  activity: string;
  location?: string;
  weather?: string;
  didSmoke: boolean;
  triggers: string[];
}

export interface DailyRiskProfile {
  date: string;
  hourlyRisks: CravingPrediction[];
  overallRisk: number;
  peakHours: number[];
  safestHours: number[];
}

export interface TriggerAnalysis {
  trigger: string;
  frequency: number;
  averageCravingLevel: number;
  successRate: number; // Başarıyla atlatma oranı
}

// Storage Keys
const KEYS = {
  BEHAVIOR_DATA: '@behavior_data',
  PREDICTION_MODEL: '@prediction_model',
  TRIGGER_ANALYSIS: '@trigger_analysis',
};

// Varsayılan tetikleyiciler
export const DEFAULT_TRIGGERS = [
  { id: 'morning_coffee', name: 'Sabah Kahvesi', icon: 'cafe', category: 'routine' },
  { id: 'after_meal', name: 'Yemek Sonrası', icon: 'restaurant', category: 'routine' },
  { id: 'stress', name: 'Stres', icon: 'alert-circle', category: 'emotional' },
  { id: 'boredom', name: 'Sıkılma', icon: 'time', category: 'emotional' },
  { id: 'social', name: 'Sosyal Ortam', icon: 'people', category: 'social' },
  { id: 'alcohol', name: 'Alkol', icon: 'wine', category: 'social' },
  { id: 'driving', name: 'Araba Sürerken', icon: 'car', category: 'routine' },
  { id: 'work_break', name: 'İş Molası', icon: 'briefcase', category: 'routine' },
  { id: 'phone_call', name: 'Telefon Görüşmesi', icon: 'call', category: 'routine' },
  { id: 'anxiety', name: 'Endişe', icon: 'sad', category: 'emotional' },
  { id: 'anger', name: 'Öfke', icon: 'flame', category: 'emotional' },
  { id: 'celebration', name: 'Kutlama', icon: 'sparkles', category: 'social' },
  { id: 'waking_up', name: 'Uyandığımda', icon: 'sunny', category: 'routine' },
  { id: 'before_sleep', name: 'Uyumadan Önce', icon: 'moon', category: 'routine' },
  { id: 'waiting', name: 'Beklerken', icon: 'hourglass', category: 'routine' },
];

// Saat bazlı varsayılan risk profili (genel popülasyon verilerine göre)
const DEFAULT_HOURLY_RISK: { [key: number]: number } = {
  0: 15, 1: 10, 2: 5, 3: 5, 4: 5, 5: 10,
  6: 25, 7: 45, 8: 60, 9: 55, 10: 50, 11: 45,
  12: 55, 13: 50, 14: 45, 15: 50, 16: 55, 17: 60,
  18: 65, 19: 70, 20: 65, 21: 55, 22: 40, 23: 25,
};

// Haftanın günlerine göre risk faktörleri
const DAY_RISK_MULTIPLIERS: { [key: number]: number } = {
  0: 0.9,  // Pazar
  1: 1.1,  // Pazartesi
  2: 1.0,  // Salı
  3: 1.0,  // Çarşamba
  4: 1.0,  // Perşembe
  5: 1.2,  // Cuma
  6: 1.1,  // Cumartesi
};

// Ruh haline göre risk faktörleri
const MOOD_RISK_FACTORS: { [key: string]: number } = {
  great: 0.7,
  good: 0.85,
  neutral: 1.0,
  bad: 1.3,
  terrible: 1.5,
};

// Risk seviyesi belirleme
const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
};

// Öneriler
const getRecommendation = (riskLevel: string, hour: number, triggers: string[]): string => {
  const recommendations: { [key: string]: string[] } = {
    critical: [
      'SOS modunu kullanmaya hazır ol, nefes egzersizi başlat',
      'Hemen su iç ve bir aktiviteye başla',
      'Bir arkadaşını ara veya toplulukta paylaşım yap',
      'Meditasyon veya nefes egzersizi ile hazırlan',
    ],
    high: [
      'Dikkat dağıtıcı bir aktivite planla',
      'Sağlıklı atıştırmalıklar hazır tut',
      'Yürüyüşe çıkmayı düşün',
      'Motivasyon videolarını izle',
    ],
    medium: [
      'Su şişeni yanında bulundur',
      'Sakız veya şeker hazır tut',
      'Hedeflerini gözden geçir',
      'Başarılarını hatırla',
    ],
    low: [
      'Harika gidiyorsun, devam et!',
      'Bugünkü başarını kutla',
      'Günlüğüne not ekle',
      'İlerleme istatistiklerini kontrol et',
    ],
  };

  const options = recommendations[riskLevel] || recommendations.medium;
  return options[Math.floor(Math.random() * options.length)];
};

// Davranış verisi kaydetme
export const saveBehaviorData = async (data: Omit<UserBehaviorData, 'id'>): Promise<void> => {
  try {
    const existingData = await getBehaviorData();
    const newEntry: UserBehaviorData = {
      ...data,
      id: Date.now().toString(),
    };
    existingData.push(newEntry);
    
    // Son 90 günlük veriyi tut
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const filteredData = existingData.filter(
      entry => new Date(entry.timestamp).getTime() > ninetyDaysAgo
    );
    
    await AsyncStorage.setItem(KEYS.BEHAVIOR_DATA, JSON.stringify(filteredData));
    
    // Trigger analizini güncelle
    await updateTriggerAnalysis(filteredData);
  } catch (error) {
    console.error('Error saving behavior data:', error);
  }
};

// Davranış verilerini getirme
export const getBehaviorData = async (): Promise<UserBehaviorData[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.BEHAVIOR_DATA);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting behavior data:', error);
    return [];
  }
};

// Trigger analizi güncelleme
const updateTriggerAnalysis = async (data: UserBehaviorData[]): Promise<void> => {
  try {
    const triggerMap: { [key: string]: { total: number; cravingSum: number; successCount: number } } = {};
    
    data.forEach(entry => {
      entry.triggers.forEach(trigger => {
        if (!triggerMap[trigger]) {
          triggerMap[trigger] = { total: 0, cravingSum: 0, successCount: 0 };
        }
        triggerMap[trigger].total += 1;
        triggerMap[trigger].cravingSum += entry.cravingLevel;
        if (!entry.didSmoke) {
          triggerMap[trigger].successCount += 1;
        }
      });
    });
    
    const analysis: TriggerAnalysis[] = Object.entries(triggerMap).map(([trigger, stats]) => ({
      trigger,
      frequency: stats.total,
      averageCravingLevel: stats.cravingSum / stats.total,
      successRate: (stats.successCount / stats.total) * 100,
    }));
    
    await AsyncStorage.setItem(KEYS.TRIGGER_ANALYSIS, JSON.stringify(analysis));
  } catch (error) {
    console.error('Error updating trigger analysis:', error);
  }
};

// Trigger analizi getirme
export const getTriggerAnalysis = async (): Promise<TriggerAnalysis[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TRIGGER_ANALYSIS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting trigger analysis:', error);
    return [];
  }
};

// Belirli bir saat için risk tahmini
export const predictCravingRisk = async (
  hour: number,
  currentMood: string = 'neutral',
  currentStress: number = 5
): Promise<CravingPrediction> => {
  try {
    const behaviorData = await getBehaviorData();
    const dayOfWeek = new Date().getDay();
    
    // Temel risk skoru
    let baseRisk = DEFAULT_HOURLY_RISK[hour] || 50;
    
    // Kullanıcının geçmiş verilerine göre ayarlama
    const hourData = behaviorData.filter(d => d.hour === hour);
    if (hourData.length >= 3) {
      const avgCraving = hourData.reduce((sum, d) => sum + d.cravingLevel, 0) / hourData.length;
      baseRisk = avgCraving * 10; // 1-10 ölçeğini 10-100'e çevir
    }
    
    // Gün çarpanı uygula
    baseRisk *= DAY_RISK_MULTIPLIERS[dayOfWeek] || 1;
    
    // Ruh hali çarpanı uygula
    baseRisk *= MOOD_RISK_FACTORS[currentMood] || 1;
    
    // Stres etkisi (stres arttıkça risk artar)
    baseRisk *= (1 + (currentStress - 5) * 0.1);
    
    // 0-100 aralığına sınırla
    const riskScore = Math.min(100, Math.max(0, Math.round(baseRisk)));
    const riskLevel = getRiskLevel(riskScore);
    
    // Bu saat için yaygın tetikleyiciler
    const triggerAnalysis = await getTriggerAnalysis();
    const triggers = triggerAnalysis
      .filter(t => t.frequency >= 2)
      .sort((a, b) => b.averageCravingLevel - a.averageCravingLevel)
      .slice(0, 3)
      .map(t => t.trigger);
    
    return {
      hour,
      riskLevel,
      riskScore,
      triggers,
      recommendation: getRecommendation(riskLevel, hour, triggers),
    };
  } catch (error) {
    console.error('Error predicting craving risk:', error);
    return {
      hour,
      riskLevel: 'medium',
      riskScore: 50,
      triggers: [],
      recommendation: 'Dikkatli ol ve hazırlıklı ol.',
    };
  }
};

// Günlük risk profili oluşturma
export const generateDailyRiskProfile = async (
  currentMood: string = 'neutral',
  currentStress: number = 5
): Promise<DailyRiskProfile> => {
  try {
    const hourlyRisks: CravingPrediction[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const prediction = await predictCravingRisk(hour, currentMood, currentStress);
      hourlyRisks.push(prediction);
    }
    
    // Genel risk hesaplama
    const overallRisk = Math.round(
      hourlyRisks.reduce((sum, p) => sum + p.riskScore, 0) / 24
    );
    
    // Pik saatler (en riskli 5 saat)
    const peakHours = [...hourlyRisks]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)
      .map(p => p.hour);
    
    // En güvenli saatler
    const safestHours = [...hourlyRisks]
      .sort((a, b) => a.riskScore - b.riskScore)
      .slice(0, 5)
      .map(p => p.hour);
    
    return {
      date: new Date().toISOString().split('T')[0],
      hourlyRisks,
      overallRisk,
      peakHours,
      safestHours,
    };
  } catch (error) {
    console.error('Error generating daily risk profile:', error);
    return {
      date: new Date().toISOString().split('T')[0],
      hourlyRisks: [],
      overallRisk: 50,
      peakHours: [8, 12, 18, 20, 21],
      safestHours: [2, 3, 4, 5, 6],
    };
  }
};

// Anlık risk kontrolü (şu an için)
export const getCurrentRisk = async (
  mood: string = 'neutral',
  stress: number = 5
): Promise<CravingPrediction> => {
  const currentHour = new Date().getHours();
  return predictCravingRisk(currentHour, mood, stress);
};

// Yüksek riskli saatleri getir (bildirim için)
export const getHighRiskHours = async (): Promise<number[]> => {
  try {
    const profile = await generateDailyRiskProfile();
    return profile.hourlyRisks
      .filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical')
      .map(p => p.hour);
  } catch (error) {
    console.error('Error getting high risk hours:', error);
    return [8, 12, 18, 20]; // Varsayılan riskli saatler
  }
};

// Haftalık risk trend analizi
export const getWeeklyRiskTrend = async (): Promise<{ day: string; avgRisk: number }[]> => {
  try {
    const behaviorData = await getBehaviorData();
    const lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weekData = behaviorData.filter(d => new Date(d.timestamp).getTime() > lastWeek);
    
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const dayRisks: { [key: number]: number[] } = {};
    
    weekData.forEach(d => {
      if (!dayRisks[d.dayOfWeek]) {
        dayRisks[d.dayOfWeek] = [];
      }
      dayRisks[d.dayOfWeek].push(d.cravingLevel * 10);
    });
    
    return days.map((day, index) => ({
      day,
      avgRisk: dayRisks[index]?.length > 0
        ? Math.round(dayRisks[index].reduce((a, b) => a + b, 0) / dayRisks[index].length)
        : DEFAULT_HOURLY_RISK[12] * DAY_RISK_MULTIPLIERS[index],
    }));
  } catch (error) {
    console.error('Error getting weekly risk trend:', error);
    return [];
  }
};

// En tehlikeli tetikleyiciler
export const getMostDangerousTriggers = async (limit: number = 5): Promise<TriggerAnalysis[]> => {
  try {
    const analysis = await getTriggerAnalysis();
    return analysis
      .sort((a, b) => b.averageCravingLevel - a.averageCravingLevel)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting dangerous triggers:', error);
    return [];
  }
};

// En başarılı stratejiler (tetikleyicileri yenme)
export const getMostSuccessfulStrategies = async (): Promise<TriggerAnalysis[]> => {
  try {
    const analysis = await getTriggerAnalysis();
    return analysis
      .filter(t => t.frequency >= 3)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);
  } catch (error) {
    console.error('Error getting successful strategies:', error);
    return [];
  }
};

// AI Önerileri - Kişiselleştirilmiş tavsiyeler
export const getPersonalizedAdvice = async (): Promise<string[]> => {
  try {
    const triggerAnalysis = await getTriggerAnalysis();
    const weeklyTrend = await getWeeklyRiskTrend();
    const currentRisk = await getCurrentRisk();
    
    const advice: string[] = [];
    
    // En riskli tetikleyici için öneri
    const topTrigger = triggerAnalysis.sort((a, b) => b.averageCravingLevel - a.averageCravingLevel)[0];
    if (topTrigger) {
      const triggerInfo = DEFAULT_TRIGGERS.find(t => t.id === topTrigger.trigger);
      if (triggerInfo) {
        advice.push(`"${triggerInfo.name}" senin için en büyük tetikleyici. Bu durumlar için önceden plan yap.`);
      }
    }
    
    // Güncel risk durumu
    if (currentRisk.riskLevel === 'high' || currentRisk.riskLevel === 'critical') {
      advice.push('Şu an yüksek riskli bir saattesin. SOS modunu aktif tut ve su iç.');
    } else if (currentRisk.riskLevel === 'low') {
      advice.push('Şu an düşük riskli bir periyotdasın. Bu enerjiyi motivasyon için kullan!');
    }
    
    // Haftalık trend analizi
    const highRiskDays = weeklyTrend.filter(d => d.avgRisk > 60);
    if (highRiskDays.length > 0) {
      advice.push(`${highRiskDays.map(d => d.day).join(', ')} günleri senin için daha zor. Bu günlerde ekstra dikkatli ol.`);
    }
    
    // Genel motivasyon
    const successfulTriggers = triggerAnalysis.filter(t => t.successRate > 70);
    if (successfulTriggers.length > 0) {
      advice.push(`Harika! Birçok tetikleyiciyi %70+ oranla yeniyorsun. Devam et!`);
    }
    
    return advice.length > 0 ? advice : [
      'Verilerini toplamaya devam et, sana özel öneriler sunacağız.',
      'Günlük modülünü kullanarak ruh halini ve isteğini kaydet.',
    ];
  } catch (error) {
    console.error('Error getting personalized advice:', error);
    return ['Verilerini analiz ediyoruz, yakında öneriler sunacağız.'];
  }
};

// Risk rengi belirleme (UI için)
export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'critical': return '#DC2626';
    default: return '#6B7280';
  }
};

// Risk ikonu belirleme (UI için)
export const getRiskIcon = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low': return 'shield-checkmark';
    case 'medium': return 'warning';
    case 'high': return 'alert-circle';
    case 'critical': return 'flame';
    default: return 'help-circle';
  }
};







