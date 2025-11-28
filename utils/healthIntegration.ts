// Health Device Integration
// Apple Health / Google Fit entegrasyonu için utility fonksiyonları
// Not: Gerçek entegrasyon için react-native-health veya expo-health-connect kullanılmalı

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  steps: number;
  sleepHours: number;
  activeMinutes: number;
  caloriesBurned: number;
  restingHeartRate: number;
  hrv: number; // Heart Rate Variability
  respiratoryRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
}

export interface SleepData {
  totalSleep: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  awakeTime: number;
  sleepQuality: number; // 0-100
  bedTime: string;
  wakeTime: string;
}

export interface ActivityData {
  steps: number;
  distance: number; // meters
  floorsClimbed: number;
  activeMinutes: number;
  caloriesBurned: number;
  workouts: WorkoutData[];
}

export interface WorkoutData {
  type: string;
  duration: number; // minutes
  calories: number;
  startTime: string;
  endTime: string;
}

export interface HealthTrend {
  date: string;
  heartRate: number;
  bloodOxygen: number;
  steps: number;
  sleepHours: number;
}

export interface SmokingHealthImpact {
  daysSinceQuit: number;
  heartRateImprovement: number; // percentage
  lungCapacityImprovement: number;
  circulationImprovement: number;
  bloodOxygenImprovement: number;
  tasteSmellImprovement: number;
  coughReduction: number;
  energyIncrease: number;
}

// Storage Keys
const STORAGE_KEYS = {
  HEALTH_DATA: '@health_data',
  SLEEP_DATA: '@sleep_data',
  ACTIVITY_DATA: '@activity_data',
  HEALTH_HISTORY: '@health_history',
  PERMISSIONS: '@health_permissions',
};

// Health milestones based on days smoke-free
export const HEALTH_MILESTONES = [
  { days: 0.0007, title: '20 Dakika', description: 'Kalp atış hızı ve kan basıncı normale dönmeye başlar', icon: '❤️' },
  { days: 0.5, title: '12 Saat', description: 'Kandaki karbon monoksit seviyesi normale döner', icon: '🫁' },
  { days: 1, title: '24 Saat', description: 'Kalp krizi riski azalmaya başlar', icon: '💓' },
  { days: 2, title: '48 Saat', description: 'Sinir uçları yenilenmeye başlar, tat ve koku duyusu iyileşir', icon: '👃' },
  { days: 3, title: '72 Saat', description: 'Bronş tüpleri gevşer, nefes almak kolaylaşır', icon: '💨' },
  { days: 14, title: '2 Hafta', description: 'Kan dolaşımı iyileşir, akciğer fonksiyonu %30 artar', icon: '🔄' },
  { days: 30, title: '1 Ay', description: 'Yorgunluk azalır, enerji seviyesi artar', icon: '⚡' },
  { days: 90, title: '3 Ay', description: 'Akciğer kapasitesi belirgin şekilde artar', icon: '🌬️' },
  { days: 180, title: '6 Ay', description: 'Öksürük ve nefes darlığı önemli ölçüde azalır', icon: '😮‍💨' },
  { days: 270, title: '9 Ay', description: 'Akciğerler temizlenir, enfeksiyon riski azalır', icon: '🛡️' },
  { days: 365, title: '1 Yıl', description: 'Kalp hastalığı riski yarıya iner', icon: '🎉' },
  { days: 1825, title: '5 Yıl', description: 'İnme riski sigara içmeyen seviyesine düşer', icon: '🧠' },
  { days: 3650, title: '10 Yıl', description: 'Akciğer kanseri riski yarıya iner', icon: '🏆' },
  { days: 5475, title: '15 Yıl', description: 'Kalp hastalığı riski sigara içmeyen seviyesine düşer', icon: '👑' },
];

// Calculate health impact based on days smoke-free
export function calculateHealthImpact(daysSinceQuit: number): SmokingHealthImpact {
  // These are simplified calculations for demonstration
  // Real values would depend on individual health factors
  
  const maxImprovement = (days: number, maxDays: number, maxValue: number): number => {
    return Math.min((days / maxDays) * maxValue, maxValue);
  };

  return {
    daysSinceQuit,
    heartRateImprovement: maxImprovement(daysSinceQuit, 30, 15), // Up to 15% in 30 days
    lungCapacityImprovement: maxImprovement(daysSinceQuit, 90, 30), // Up to 30% in 90 days
    circulationImprovement: maxImprovement(daysSinceQuit, 14, 25), // Up to 25% in 14 days
    bloodOxygenImprovement: maxImprovement(daysSinceQuit, 1, 10), // Up to 10% in 1 day
    tasteSmellImprovement: maxImprovement(daysSinceQuit, 7, 50), // Up to 50% in 7 days
    coughReduction: maxImprovement(daysSinceQuit, 90, 80), // Up to 80% in 90 days
    energyIncrease: maxImprovement(daysSinceQuit, 30, 40), // Up to 40% in 30 days
  };
}

// Get current milestone
export function getCurrentMilestone(daysSinceQuit: number) {
  let currentMilestone = HEALTH_MILESTONES[0];
  let nextMilestone = HEALTH_MILESTONES[1];
  
  for (let i = 0; i < HEALTH_MILESTONES.length; i++) {
    if (daysSinceQuit >= HEALTH_MILESTONES[i].days) {
      currentMilestone = HEALTH_MILESTONES[i];
      nextMilestone = HEALTH_MILESTONES[i + 1] || HEALTH_MILESTONES[i];
    } else {
      nextMilestone = HEALTH_MILESTONES[i];
      break;
    }
  }
  
  const progress = nextMilestone.days > currentMilestone.days
    ? ((daysSinceQuit - currentMilestone.days) / (nextMilestone.days - currentMilestone.days)) * 100
    : 100;
  
  return { currentMilestone, nextMilestone, progress };
}

// Simulated health data (would be replaced with actual API calls)
export async function getHealthData(): Promise<HealthData> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_DATA);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting health data:', error);
  }
  
  // Return simulated data for demo
  return generateSimulatedHealthData();
}

export async function getSleepData(): Promise<SleepData> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_DATA);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting sleep data:', error);
  }
  
  return generateSimulatedSleepData();
}

export async function getActivityData(): Promise<ActivityData> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_DATA);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting activity data:', error);
  }
  
  return generateSimulatedActivityData();
}

// Generate simulated data for demo purposes
function generateSimulatedHealthData(): HealthData {
  return {
    heartRate: Math.floor(Math.random() * 20) + 65, // 65-85 bpm
    bloodOxygen: Math.floor(Math.random() * 3) + 96, // 96-99%
    steps: Math.floor(Math.random() * 5000) + 3000, // 3000-8000 steps
    sleepHours: Math.random() * 2 + 6, // 6-8 hours
    activeMinutes: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
    caloriesBurned: Math.floor(Math.random() * 500) + 1500, // 1500-2000 cal
    restingHeartRate: Math.floor(Math.random() * 15) + 55, // 55-70 bpm
    hrv: Math.floor(Math.random() * 30) + 30, // 30-60 ms
    respiratoryRate: Math.floor(Math.random() * 4) + 12, // 12-16 breaths/min
    bloodPressureSystolic: Math.floor(Math.random() * 20) + 110, // 110-130
    bloodPressureDiastolic: Math.floor(Math.random() * 15) + 70, // 70-85
  };
}

function generateSimulatedSleepData(): SleepData {
  const totalSleep = Math.random() * 2 + 6;
  return {
    totalSleep,
    deepSleep: totalSleep * 0.2,
    lightSleep: totalSleep * 0.5,
    remSleep: totalSleep * 0.25,
    awakeTime: totalSleep * 0.05,
    sleepQuality: Math.floor(Math.random() * 30) + 70, // 70-100
    bedTime: '23:30',
    wakeTime: '07:30',
  };
}

function generateSimulatedActivityData(): ActivityData {
  return {
    steps: Math.floor(Math.random() * 5000) + 3000,
    distance: Math.floor(Math.random() * 3000) + 2000, // meters
    floorsClimbed: Math.floor(Math.random() * 10) + 2,
    activeMinutes: Math.floor(Math.random() * 60) + 15,
    caloriesBurned: Math.floor(Math.random() * 500) + 200,
    workouts: [],
  };
}

// Save health data (for manual entry or sync)
export async function saveHealthData(data: Partial<HealthData>): Promise<void> {
  try {
    const current = await getHealthData();
    const updated = { ...current, ...data };
    await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_DATA, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving health data:', error);
  }
}

// Get health history for charts
export async function getHealthHistory(days: number = 7): Promise<HealthTrend[]> {
  const history: HealthTrend[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    history.push({
      date: date.toISOString().split('T')[0],
      heartRate: Math.floor(Math.random() * 20) + 65,
      bloodOxygen: Math.floor(Math.random() * 3) + 96,
      steps: Math.floor(Math.random() * 5000) + 3000,
      sleepHours: Math.random() * 2 + 6,
    });
  }
  
  return history;
}

// Check health permissions
export async function checkHealthPermissions(): Promise<{
  hasPermissions: boolean;
  grantedPermissions: string[];
  deniedPermissions: string[];
}> {
  // In a real app, this would check actual permissions
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error checking health permissions:', error);
  }
  
  return {
    hasPermissions: false,
    grantedPermissions: [],
    deniedPermissions: ['heartRate', 'bloodOxygen', 'steps', 'sleep'],
  };
}

// Request health permissions
export async function requestHealthPermissions(): Promise<boolean> {
  // In a real app, this would request actual permissions
  const permissions = {
    hasPermissions: true,
    grantedPermissions: ['heartRate', 'bloodOxygen', 'steps', 'sleep', 'activity'],
    deniedPermissions: [],
  };
  
  await AsyncStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
  return true;
}

// Get health score (0-100)
export function calculateHealthScore(data: HealthData): number {
  let score = 100;
  
  // Heart rate scoring
  if (data.heartRate < 60 || data.heartRate > 100) {
    score -= 10;
  } else if (data.heartRate >= 60 && data.heartRate <= 80) {
    score += 5;
  }
  
  // Blood oxygen scoring
  if (data.bloodOxygen < 95) {
    score -= 15;
  } else if (data.bloodOxygen >= 98) {
    score += 5;
  }
  
  // Steps scoring
  if (data.steps >= 10000) {
    score += 10;
  } else if (data.steps >= 7500) {
    score += 5;
  } else if (data.steps < 3000) {
    score -= 10;
  }
  
  // Sleep scoring
  if (data.sleepHours >= 7 && data.sleepHours <= 9) {
    score += 10;
  } else if (data.sleepHours < 6) {
    score -= 15;
  }
  
  // Active minutes scoring
  if (data.activeMinutes >= 30) {
    score += 10;
  } else if (data.activeMinutes < 15) {
    score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Get health recommendations based on data
export function getHealthRecommendations(data: HealthData): string[] {
  const recommendations: string[] = [];
  
  if (data.heartRate > 90) {
    recommendations.push('Kalp atış hızınız yüksek. Rahatlama egzersizleri deneyin.');
  }
  
  if (data.bloodOxygen < 96) {
    recommendations.push('Derin nefes egzersizleri oksijen seviyenizi artırabilir.');
  }
  
  if (data.steps < 5000) {
    recommendations.push('Günde en az 7,500 adım atmaya çalışın.');
  }
  
  if (data.sleepHours < 7) {
    recommendations.push('Uyku sürenizi artırmaya çalışın. 7-9 saat ideal.');
  }
  
  if (data.activeMinutes < 30) {
    recommendations.push('Günde en az 30 dakika aktif olun.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Harika gidiyorsunuz! Böyle devam edin! 🎉');
  }
  
  return recommendations;
}

// Platform-specific health kit info
export function getHealthKitInfo(): {
  platform: string;
  healthKitName: string;
  available: boolean;
} {
  return {
    platform: Platform.OS,
    healthKitName: Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit',
    available: Platform.OS === 'ios' || Platform.OS === 'android',
  };
}

export default {
  getHealthData,
  getSleepData,
  getActivityData,
  saveHealthData,
  getHealthHistory,
  checkHealthPermissions,
  requestHealthPermissions,
  calculateHealthImpact,
  getCurrentMilestone,
  calculateHealthScore,
  getHealthRecommendations,
  getHealthKitInfo,
  HEALTH_MILESTONES,
};




