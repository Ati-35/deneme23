// Analytics & Reporting System
// Gelişmiş analitikler, raporlar, insights, veri görselleştirme

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface DailyLog {
  date: string;
  moodScore: number; // 1-10
  cravingLevel: number; // 1-10
  cravingCount: number;
  energyLevel: number; // 1-10
  sleepQuality: number; // 1-10
  stressLevel: number; // 1-10
  exerciseMinutes: number;
  waterGlasses: number;
  notes?: string;
  triggers: string[];
  copingStrategiesUsed: string[];
  cigarettesSmoked: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  averageMood: number;
  averageCraving: number;
  totalCravings: number;
  cravingTrend: 'improving' | 'stable' | 'worsening';
  moodTrend: 'improving' | 'stable' | 'worsening';
  moneySaved: number;
  cigarettesAvoided: number;
  achievements: string[];
  topTriggers: { trigger: string; count: number }[];
  topCopingStrategies: { strategy: string; count: number }[];
  recommendations: string[];
  overallScore: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  averageMood: number;
  averageCraving: number;
  streakDays: number;
  longestStreak: number;
  moneySaved: number;
  cigarettesAvoided: number;
  healthImprovement: number;
  exerciseMinutes: number;
  achievements: string[];
  insights: Insight[];
  comparedToLastMonth: {
    moodChange: number;
    cravingChange: number;
    streakChange: number;
  };
}

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'tip';
  title: string;
  description: string;
  icon: string;
  priority: number;
  actionable: boolean;
  action?: string;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface AnalyticsSummary {
  totalDaysTracked: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number;
  averageCraving: number;
  totalMoneySaved: number;
  totalCigarettesAvoided: number;
  healthScore: number;
  bestDay: { date: string; score: number };
  worstDay: { date: string; score: number };
}

export interface CravingAnalysis {
  mostCommonTimes: { hour: number; count: number }[];
  mostCommonTriggers: { trigger: string; count: number }[];
  averageDuration: number;
  successRate: number;
  copingEffectiveness: { strategy: string; successRate: number }[];
}

// Storage Keys
const STORAGE_KEYS = {
  DAILY_LOGS: '@analytics_daily_logs',
  WEEKLY_REPORTS: '@analytics_weekly_reports',
  MONTHLY_REPORTS: '@analytics_monthly_reports',
  INSIGHTS: '@analytics_insights',
};

// Common Triggers
export const COMMON_TRIGGERS = [
  'Stres',
  'Kahve',
  'Alkol',
  'Yemek Sonrası',
  'Sıkılma',
  'Sosyal Ortam',
  'İş Stresi',
  'Öfke',
  'Üzüntü',
  'Kutlama',
  'Araba Sürerken',
  'Telefonda Konuşurken',
  'Sabah Kalktığında',
  'Yatmadan Önce',
];

// Coping Strategies
export const COPING_STRATEGIES = [
  'Derin Nefes',
  'Su İçmek',
  'Yürüyüş',
  'Sakız Çiğnemek',
  'Meditasyon',
  'Arkadaşla Konuşmak',
  'Egzersiz',
  'Dikkat Dağıtma',
  'Uygulama Kullanımı',
  'Sağlık Faydalarını Düşünmek',
  'Tasarrufu Düşünmek',
  'Müzik Dinlemek',
  'El İşi Yapmak',
];

// Get Daily Logs
export async function getDailyLogs(): Promise<DailyLog[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting daily logs:', error);
    return [];
  }
}

// Get Daily Log for Date
export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const logs = await getDailyLogs();
  return logs.find(l => l.date === date) || null;
}

// Save Daily Log
export async function saveDailyLog(log: DailyLog): Promise<void> {
  try {
    const logs = await getDailyLogs();
    const existingIndex = logs.findIndex(l => l.date === log.date);
    
    if (existingIndex !== -1) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }
    
    // Sort by date
    logs.sort((a, b) => b.date.localeCompare(a.date));
    
    // Keep only last 365 days
    const trimmed = logs.slice(0, 365);
    
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving daily log:', error);
  }
}

// Generate Weekly Report
export async function generateWeeklyReport(weekStart: string): Promise<WeeklyReport> {
  const logs = await getDailyLogs();
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  const weekLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= start && logDate <= end;
  });
  
  const prevWeekStart = new Date(start);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(prevWeekStart);
  prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
  
  const prevWeekLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= prevWeekStart && logDate <= prevWeekEnd;
  });
  
  // Calculate averages
  const avgMood = weekLogs.length > 0
    ? weekLogs.reduce((sum, l) => sum + l.moodScore, 0) / weekLogs.length
    : 0;
  
  const avgCraving = weekLogs.length > 0
    ? weekLogs.reduce((sum, l) => sum + l.cravingLevel, 0) / weekLogs.length
    : 0;
  
  const prevAvgMood = prevWeekLogs.length > 0
    ? prevWeekLogs.reduce((sum, l) => sum + l.moodScore, 0) / prevWeekLogs.length
    : avgMood;
  
  const prevAvgCraving = prevWeekLogs.length > 0
    ? prevWeekLogs.reduce((sum, l) => sum + l.cravingLevel, 0) / prevWeekLogs.length
    : avgCraving;
  
  // Determine trends
  const moodTrend = avgMood > prevAvgMood + 0.5 ? 'improving' 
    : avgMood < prevAvgMood - 0.5 ? 'worsening' : 'stable';
  
  const cravingTrend = avgCraving < prevAvgCraving - 0.5 ? 'improving'
    : avgCraving > prevAvgCraving + 0.5 ? 'worsening' : 'stable';
  
  // Count triggers and strategies
  const triggerCounts: Record<string, number> = {};
  const strategyCounts: Record<string, number> = {};
  
  weekLogs.forEach(log => {
    log.triggers.forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
    log.copingStrategiesUsed.forEach(s => {
      strategyCounts[s] = (strategyCounts[s] || 0) + 1;
    });
  });
  
  const topTriggers = Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const topCopingStrategies = Object.entries(strategyCounts)
    .map(([strategy, count]) => ({ strategy, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Generate recommendations
  const recommendations = generateRecommendations(weekLogs, topTriggers);
  
  // Calculate overall score
  const overallScore = calculateOverallScore(weekLogs);
  
  return {
    weekStart,
    weekEnd: end.toISOString().split('T')[0],
    averageMood: Math.round(avgMood * 10) / 10,
    averageCraving: Math.round(avgCraving * 10) / 10,
    totalCravings: weekLogs.reduce((sum, l) => sum + l.cravingCount, 0),
    cravingTrend,
    moodTrend,
    moneySaved: weekLogs.length * 50, // Assuming 50 TL/day
    cigarettesAvoided: weekLogs.length * 20,
    achievements: [],
    topTriggers,
    topCopingStrategies,
    recommendations,
    overallScore,
  };
}

// Generate Monthly Report
export async function generateMonthlyReport(month: number, year: number): Promise<MonthlyReport> {
  const logs = await getDailyLogs();
  
  const monthLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === month && logDate.getFullYear() === year;
  });
  
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  
  const prevMonthLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === prevMonth && logDate.getFullYear() === prevYear;
  });
  
  const avgMood = monthLogs.length > 0
    ? monthLogs.reduce((sum, l) => sum + l.moodScore, 0) / monthLogs.length
    : 0;
  
  const avgCraving = monthLogs.length > 0
    ? monthLogs.reduce((sum, l) => sum + l.cravingLevel, 0) / monthLogs.length
    : 0;
  
  const prevAvgMood = prevMonthLogs.length > 0
    ? prevMonthLogs.reduce((sum, l) => sum + l.moodScore, 0) / prevMonthLogs.length
    : 0;
  
  const prevAvgCraving = prevMonthLogs.length > 0
    ? prevMonthLogs.reduce((sum, l) => sum + l.cravingLevel, 0) / prevMonthLogs.length
    : 0;
  
  // Calculate streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const sortedLogs = [...monthLogs].sort((a, b) => a.date.localeCompare(b.date));
  
  sortedLogs.forEach((log, index) => {
    if (log.cigarettesSmoked === 0) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      if (index === sortedLogs.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  });
  
  // Generate insights
  const insights = generateInsights(monthLogs, avgMood, avgCraving);
  
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  
  return {
    month: monthNames[month],
    year,
    averageMood: Math.round(avgMood * 10) / 10,
    averageCraving: Math.round(avgCraving * 10) / 10,
    streakDays: currentStreak,
    longestStreak,
    moneySaved: monthLogs.length * 50,
    cigarettesAvoided: monthLogs.length * 20,
    healthImprovement: Math.min(monthLogs.length * 2, 100),
    exerciseMinutes: monthLogs.reduce((sum, l) => sum + l.exerciseMinutes, 0),
    achievements: [],
    insights,
    comparedToLastMonth: {
      moodChange: Math.round((avgMood - prevAvgMood) * 10) / 10,
      cravingChange: Math.round((prevAvgCraving - avgCraving) * 10) / 10,
      streakChange: currentStreak - prevMonthLogs.length,
    },
  };
}

// Get Analytics Summary
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const logs = await getDailyLogs();
  
  if (logs.length === 0) {
    return {
      totalDaysTracked: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageMood: 0,
      averageCraving: 0,
      totalMoneySaved: 0,
      totalCigarettesAvoided: 0,
      healthScore: 0,
      bestDay: { date: '', score: 0 },
      worstDay: { date: '', score: 0 },
    };
  }
  
  // Calculate streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  
  sortedLogs.forEach((log, index) => {
    if (log.cigarettesSmoked === 0) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      if (index === sortedLogs.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  });
  
  // Calculate averages
  const avgMood = logs.reduce((sum, l) => sum + l.moodScore, 0) / logs.length;
  const avgCraving = logs.reduce((sum, l) => sum + l.cravingLevel, 0) / logs.length;
  
  // Calculate daily scores
  const dailyScores = logs.map(log => ({
    date: log.date,
    score: calculateDayScore(log),
  }));
  
  dailyScores.sort((a, b) => b.score - a.score);
  
  return {
    totalDaysTracked: logs.length,
    currentStreak,
    longestStreak,
    averageMood: Math.round(avgMood * 10) / 10,
    averageCraving: Math.round(avgCraving * 10) / 10,
    totalMoneySaved: logs.length * 50,
    totalCigarettesAvoided: logs.length * 20,
    healthScore: Math.min(logs.length * 2, 100),
    bestDay: dailyScores[0] || { date: '', score: 0 },
    worstDay: dailyScores[dailyScores.length - 1] || { date: '', score: 0 },
  };
}

// Get Trend Data
export async function getTrendData(
  metric: 'mood' | 'craving' | 'energy' | 'stress',
  days: number = 30
): Promise<TrendData[]> {
  const logs = await getDailyLogs();
  const now = new Date();
  
  const trends: TrendData[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const log = logs.find(l => l.date === dateStr);
    
    let value = 0;
    if (log) {
      switch (metric) {
        case 'mood': value = log.moodScore; break;
        case 'craving': value = log.cravingLevel; break;
        case 'energy': value = log.energyLevel; break;
        case 'stress': value = log.stressLevel; break;
      }
    }
    
    trends.push({ date: dateStr, value });
  }
  
  return trends;
}

// Analyze Cravings
export async function analyzeCravings(): Promise<CravingAnalysis> {
  const logs = await getDailyLogs();
  
  // Count by hour (simulated since we don't have hourly data)
  const hourCounts: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }
  
  // Most common times (simulated data)
  const commonHours = [8, 10, 12, 15, 18, 21];
  logs.forEach(log => {
    const randomHour = commonHours[Math.floor(Math.random() * commonHours.length)];
    hourCounts[randomHour] += log.cravingCount;
  });
  
  const mostCommonTimes = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Count triggers
  const triggerCounts: Record<string, number> = {};
  logs.forEach(log => {
    log.triggers.forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });
  
  const mostCommonTriggers = Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Coping effectiveness
  const strategySuccess: Record<string, { used: number; succeeded: number }> = {};
  logs.forEach(log => {
    const succeeded = log.cigarettesSmoked === 0;
    log.copingStrategiesUsed.forEach(s => {
      if (!strategySuccess[s]) {
        strategySuccess[s] = { used: 0, succeeded: 0 };
      }
      strategySuccess[s].used++;
      if (succeeded) {
        strategySuccess[s].succeeded++;
      }
    });
  });
  
  const copingEffectiveness = Object.entries(strategySuccess)
    .map(([strategy, data]) => ({
      strategy,
      successRate: Math.round((data.succeeded / data.used) * 100),
    }))
    .sort((a, b) => b.successRate - a.successRate);
  
  const totalCravings = logs.reduce((sum, l) => sum + l.cravingCount, 0);
  const successfulDays = logs.filter(l => l.cigarettesSmoked === 0).length;
  
  return {
    mostCommonTimes,
    mostCommonTriggers,
    averageDuration: 5, // minutes (would need more detailed tracking)
    successRate: logs.length > 0 ? Math.round((successfulDays / logs.length) * 100) : 0,
    copingEffectiveness,
  };
}

// Helper Functions
function calculateDayScore(log: DailyLog): number {
  let score = 0;
  score += log.moodScore * 10;
  score += (10 - log.cravingLevel) * 8;
  score += log.energyLevel * 6;
  score += (10 - log.stressLevel) * 5;
  score += log.sleepQuality * 7;
  score += Math.min(log.exerciseMinutes / 3, 30);
  score += Math.min(log.waterGlasses * 3, 24);
  score -= log.cigarettesSmoked * 50;
  return Math.round(score);
}

function calculateOverallScore(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;
  const totalScore = logs.reduce((sum, log) => sum + calculateDayScore(log), 0);
  return Math.round(totalScore / logs.length);
}

function generateRecommendations(logs: DailyLog[], topTriggers: { trigger: string; count: number }[]): string[] {
  const recommendations: string[] = [];
  
  if (logs.length === 0) {
    recommendations.push('Günlük kayıt tutmaya başlayın!');
    return recommendations;
  }
  
  const avgStress = logs.reduce((sum, l) => sum + l.stressLevel, 0) / logs.length;
  const avgSleep = logs.reduce((sum, l) => sum + l.sleepQuality, 0) / logs.length;
  const avgExercise = logs.reduce((sum, l) => sum + l.exerciseMinutes, 0) / logs.length;
  
  if (avgStress > 6) {
    recommendations.push('Stres seviyeniz yüksek. Meditasyon veya nefes egzersizlerini deneyin.');
  }
  
  if (avgSleep < 6) {
    recommendations.push('Uyku kalitenizi artırın. Düzenli uyku saatleri belirleyin.');
  }
  
  if (avgExercise < 15) {
    recommendations.push('Günde en az 30 dakika egzersiz yapmayı hedefleyin.');
  }
  
  if (topTriggers.length > 0) {
    recommendations.push(`En yaygın tetikleyiciniz "${topTriggers[0].trigger}". Bu durumlar için alternatif stratejiler geliştirin.`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Harika gidiyorsunuz! Böyle devam edin!');
  }
  
  return recommendations;
}

function generateInsights(logs: DailyLog[], avgMood: number, avgCraving: number): Insight[] {
  const insights: Insight[] = [];
  
  if (avgMood >= 7) {
    insights.push({
      id: 'mood_positive',
      type: 'positive',
      title: 'Ruh Haliniz Harika! 🎉',
      description: 'Bu ay ruh haliniz oldukça iyi. Böyle devam edin!',
      icon: '😊',
      priority: 1,
      actionable: false,
    });
  }
  
  if (avgCraving <= 4) {
    insights.push({
      id: 'craving_low',
      type: 'positive',
      title: 'Sigara İsteği Azalıyor 📉',
      description: 'Sigara isteğiniz kontrol altında. Başarıyorsunuz!',
      icon: '💪',
      priority: 1,
      actionable: false,
    });
  }
  
  if (avgCraving > 6) {
    insights.push({
      id: 'craving_high',
      type: 'tip',
      title: 'Sigara İsteği Yüksek',
      description: 'Başa çıkma stratejilerinizi gözden geçirin.',
      icon: '💡',
      priority: 2,
      actionable: true,
      action: 'Nefes egzersizi yap',
    });
  }
  
  return insights;
}

export default {
  getDailyLogs,
  getDailyLog,
  saveDailyLog,
  generateWeeklyReport,
  generateMonthlyReport,
  getAnalyticsSummary,
  getTrendData,
  analyzeCravings,
  COMMON_TRIGGERS,
  COPING_STRATEGIES,
};




