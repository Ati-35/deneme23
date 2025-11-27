// Sağlık Cihaz Entegrasyonu
// Apple Health, Google Fit ve akıllı saat bağlantısı

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export interface HealthMetric {
  id: string;
  type: MetricType;
  value: number;
  unit: string;
  timestamp: string;
  source: DataSource;
}

export type MetricType = 
  | 'heartRate'
  | 'bloodPressureSystolic'
  | 'bloodPressureDiastolic'
  | 'oxygenSaturation'
  | 'respiratoryRate'
  | 'steps'
  | 'activeCalories'
  | 'sleepDuration'
  | 'sleepQuality'
  | 'stressLevel'
  | 'weight'
  | 'bodyMassIndex';

export type DataSource = 
  | 'apple_health'
  | 'google_fit'
  | 'fitbit'
  | 'samsung_health'
  | 'garmin'
  | 'manual'
  | 'calculated';

export interface HealthSummary {
  date: string;
  heartRate: {
    average: number;
    min: number;
    max: number;
    resting: number;
  };
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  oxygenSaturation: number;
  steps: number;
  activeCalories: number;
  sleepDuration: number; // dakika
  sleepQuality: number; // 0-100
  stressLevel: number; // 0-100
  smokingRecoveryScore: number; // 0-100
}

export interface DeviceConnection {
  id: string;
  name: string;
  type: DataSource;
  isConnected: boolean;
  lastSync: string | null;
  permissions: string[];
}

// Storage Keys
const KEYS = {
  HEALTH_METRICS: '@health_metrics',
  DEVICE_CONNECTIONS: '@device_connections',
  HEALTH_SUMMARY: '@health_summary',
  SYNC_SETTINGS: '@sync_settings',
};

// Sigara bırakma sonrası sağlık iyileşme faktörleri
const RECOVERY_FACTORS = {
  heartRate: { baseImprovement: 0.05, maxDays: 30 },
  bloodPressure: { baseImprovement: 0.03, maxDays: 60 },
  oxygenSaturation: { baseImprovement: 0.02, maxDays: 14 },
  lungCapacity: { baseImprovement: 0.01, maxDays: 365 },
  circulation: { baseImprovement: 0.02, maxDays: 90 },
};

// Varsayılan sağlık metrikleri (sigara içen bir kişi için)
const SMOKER_BASELINE: { [key: string]: { value: number; unit: string } } = {
  heartRate: { value: 80, unit: 'bpm' },
  bloodPressureSystolic: { value: 135, unit: 'mmHg' },
  bloodPressureDiastolic: { value: 88, unit: 'mmHg' },
  oxygenSaturation: { value: 94, unit: '%' },
  respiratoryRate: { value: 18, unit: 'breaths/min' },
  lungCapacity: { value: 75, unit: '%' },
  circulation: { value: 70, unit: '%' },
  energyLevel: { value: 60, unit: '%' },
};

// Non-smoker hedef değerler
const HEALTHY_TARGETS: { [key: string]: { value: number; unit: string } } = {
  heartRate: { value: 68, unit: 'bpm' },
  bloodPressureSystolic: { value: 118, unit: 'mmHg' },
  bloodPressureDiastolic: { value: 76, unit: 'mmHg' },
  oxygenSaturation: { value: 98, unit: '%' },
  respiratoryRate: { value: 14, unit: 'breaths/min' },
  lungCapacity: { value: 100, unit: '%' },
  circulation: { value: 95, unit: '%' },
  energyLevel: { value: 90, unit: '%' },
};

// Sağlık metriği kaydetme
export const saveHealthMetric = async (metric: Omit<HealthMetric, 'id'>): Promise<void> => {
  try {
    const metrics = await getHealthMetrics();
    const newMetric: HealthMetric = {
      ...metric,
      id: Date.now().toString(),
    };
    metrics.push(newMetric);
    
    // Son 365 günlük veriyi tut
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    const filteredMetrics = metrics.filter(
      m => new Date(m.timestamp).getTime() > oneYearAgo
    );
    
    await AsyncStorage.setItem(KEYS.HEALTH_METRICS, JSON.stringify(filteredMetrics));
  } catch (error) {
    console.error('Error saving health metric:', error);
  }
};

// Sağlık metriklerini getirme
export const getHealthMetrics = async (): Promise<HealthMetric[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.HEALTH_METRICS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting health metrics:', error);
    return [];
  }
};

// Belirli tip için son metrik
export const getLatestMetric = async (type: MetricType): Promise<HealthMetric | null> => {
  try {
    const metrics = await getHealthMetrics();
    const typeMetrics = metrics.filter(m => m.type === type);
    if (typeMetrics.length === 0) return null;
    
    return typeMetrics.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  } catch (error) {
    console.error('Error getting latest metric:', error);
    return null;
  }
};

// Sigara bırakma sonrası tahmini sağlık değerleri hesaplama
export const calculateRecoveryMetrics = (
  daysSinceQuit: number,
  baselineMetrics?: { [key: string]: number }
): { [key: string]: { current: number; target: number; improvement: number; unit: string } } => {
  const metrics: { [key: string]: { current: number; target: number; improvement: number; unit: string } } = {};
  
  Object.keys(SMOKER_BASELINE).forEach(metric => {
    const baseline = baselineMetrics?.[metric] || SMOKER_BASELINE[metric].value;
    const target = HEALTHY_TARGETS[metric].value;
    const unit = HEALTHY_TARGETS[metric].unit;
    
    // Recovery faktörünü al veya varsayılan kullan
    const factor = RECOVERY_FACTORS[metric as keyof typeof RECOVERY_FACTORS] || 
      { baseImprovement: 0.02, maxDays: 90 };
    
    // İyileşme yüzdesini hesapla (logaritmik eğri)
    const maxImprovement = Math.abs(target - baseline);
    const daysProgress = Math.min(daysSinceQuit, factor.maxDays);
    const improvementRatio = 1 - Math.exp(-factor.baseImprovement * daysProgress);
    
    // Mevcut değeri hesapla
    const improvement = maxImprovement * improvementRatio;
    const current = baseline > target 
      ? Math.round((baseline - improvement) * 10) / 10
      : Math.round((baseline + improvement) * 10) / 10;
    
    metrics[metric] = {
      current,
      target,
      improvement: Math.round(improvementRatio * 100),
      unit,
    };
  });
  
  return metrics;
};

// Genel sağlık skoru hesaplama
export const calculateHealthScore = (
  daysSinceQuit: number,
  metrics?: HealthMetric[]
): number => {
  // Temel iyileşme skoru (zamana bağlı)
  const timeScore = Math.min(100, Math.round(
    (1 - Math.exp(-0.02 * daysSinceQuit)) * 100
  ));
  
  // Eğer gerçek metrikler varsa, onları da hesaba kat
  if (metrics && metrics.length > 0) {
    let metricScore = 0;
    let metricCount = 0;
    
    // Her metrik için hedef değere yakınlığı hesapla
    const latestMetrics = new Map<MetricType, HealthMetric>();
    metrics.forEach(m => {
      const existing = latestMetrics.get(m.type);
      if (!existing || new Date(m.timestamp) > new Date(existing.timestamp)) {
        latestMetrics.set(m.type, m);
      }
    });
    
    latestMetrics.forEach((metric, type) => {
      const target = HEALTHY_TARGETS[type as string]?.value;
      const baseline = SMOKER_BASELINE[type as string]?.value;
      
      if (target && baseline) {
        const maxRange = Math.abs(baseline - target);
        const currentProgress = Math.abs(metric.value - baseline);
        const score = Math.min(100, (currentProgress / maxRange) * 100);
        metricScore += score;
        metricCount++;
      }
    });
    
    if (metricCount > 0) {
      return Math.round((timeScore + metricScore / metricCount) / 2);
    }
  }
  
  return timeScore;
};

// Cihaz bağlantılarını getir
export const getDeviceConnections = async (): Promise<DeviceConnection[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.DEVICE_CONNECTIONS);
    if (data) {
      return JSON.parse(data);
    }
    
    // Varsayılan cihaz listesi
    return [
      {
        id: '1',
        name: 'Apple Health',
        type: 'apple_health',
        isConnected: false,
        lastSync: null,
        permissions: ['heartRate', 'steps', 'sleep', 'bloodPressure'],
      },
      {
        id: '2',
        name: 'Google Fit',
        type: 'google_fit',
        isConnected: false,
        lastSync: null,
        permissions: ['heartRate', 'steps', 'calories', 'sleep'],
      },
      {
        id: '3',
        name: 'Fitbit',
        type: 'fitbit',
        isConnected: false,
        lastSync: null,
        permissions: ['heartRate', 'steps', 'sleep', 'stress'],
      },
      {
        id: '4',
        name: 'Samsung Health',
        type: 'samsung_health',
        isConnected: false,
        lastSync: null,
        permissions: ['heartRate', 'steps', 'sleep', 'bloodPressure'],
      },
      {
        id: '5',
        name: 'Garmin Connect',
        type: 'garmin',
        isConnected: false,
        lastSync: null,
        permissions: ['heartRate', 'steps', 'sleep', 'stress'],
      },
    ];
  } catch (error) {
    console.error('Error getting device connections:', error);
    return [];
  }
};

// Cihaz bağlantısı güncelle
export const updateDeviceConnection = async (
  deviceId: string,
  updates: Partial<DeviceConnection>
): Promise<void> => {
  try {
    const connections = await getDeviceConnections();
    const index = connections.findIndex(d => d.id === deviceId);
    
    if (index !== -1) {
      connections[index] = { ...connections[index], ...updates };
      await AsyncStorage.setItem(KEYS.DEVICE_CONNECTIONS, JSON.stringify(connections));
    }
  } catch (error) {
    console.error('Error updating device connection:', error);
  }
};

// Cihaz bağlama (simülasyon - gerçek API entegrasyonu için placeholder)
export const connectDevice = async (deviceType: DataSource): Promise<boolean> => {
  try {
    // Gerçek uygulamada burada platform spesifik API'ler kullanılır
    // Apple HealthKit, Google Fit API, Fitbit OAuth vb.
    
    const connections = await getDeviceConnections();
    const device = connections.find(d => d.type === deviceType);
    
    if (device) {
      await updateDeviceConnection(device.id, {
        isConnected: true,
        lastSync: new Date().toISOString(),
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error connecting device:', error);
    return false;
  }
};

// Cihazdan veri senkronizasyonu (simülasyon)
export const syncDeviceData = async (deviceType: DataSource): Promise<HealthMetric[]> => {
  try {
    // Gerçek uygulamada burada cihaz API'sinden veri çekilir
    // Simülasyon için rastgele veri üretiyoruz
    
    const now = new Date();
    const simulatedMetrics: HealthMetric[] = [];
    
    // Son 7 gün için veri üret
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      simulatedMetrics.push(
        {
          id: `hr-${i}`,
          type: 'heartRate',
          value: 65 + Math.random() * 20,
          unit: 'bpm',
          timestamp: date.toISOString(),
          source: deviceType,
        },
        {
          id: `steps-${i}`,
          type: 'steps',
          value: Math.round(4000 + Math.random() * 8000),
          unit: 'steps',
          timestamp: date.toISOString(),
          source: deviceType,
        },
        {
          id: `sleep-${i}`,
          type: 'sleepDuration',
          value: Math.round(360 + Math.random() * 120),
          unit: 'min',
          timestamp: date.toISOString(),
          source: deviceType,
        }
      );
    }
    
    // Metrikleri kaydet
    for (const metric of simulatedMetrics) {
      await saveHealthMetric(metric);
    }
    
    // Son sync zamanını güncelle
    const connections = await getDeviceConnections();
    const device = connections.find(d => d.type === deviceType);
    if (device) {
      await updateDeviceConnection(device.id, {
        lastSync: new Date().toISOString(),
      });
    }
    
    return simulatedMetrics;
  } catch (error) {
    console.error('Error syncing device data:', error);
    return [];
  }
};

// Günlük sağlık özeti oluştur
export const generateDailyHealthSummary = async (
  date: string,
  daysSinceQuit: number
): Promise<HealthSummary> => {
  try {
    const metrics = await getHealthMetrics();
    const dayMetrics = metrics.filter(m => 
      m.timestamp.startsWith(date)
    );
    
    // Kalp atışı analizi
    const heartRateMetrics = dayMetrics.filter(m => m.type === 'heartRate');
    const heartRate = {
      average: heartRateMetrics.length > 0
        ? Math.round(heartRateMetrics.reduce((sum, m) => sum + m.value, 0) / heartRateMetrics.length)
        : 72,
      min: heartRateMetrics.length > 0
        ? Math.min(...heartRateMetrics.map(m => m.value))
        : 58,
      max: heartRateMetrics.length > 0
        ? Math.max(...heartRateMetrics.map(m => m.value))
        : 95,
      resting: 65,
    };
    
    // Kan basıncı
    const systolicMetric = dayMetrics.find(m => m.type === 'bloodPressureSystolic');
    const diastolicMetric = dayMetrics.find(m => m.type === 'bloodPressureDiastolic');
    const recoveryMetrics = calculateRecoveryMetrics(daysSinceQuit);
    
    const bloodPressure = {
      systolic: systolicMetric?.value || recoveryMetrics.bloodPressureSystolic?.current || 125,
      diastolic: diastolicMetric?.value || recoveryMetrics.bloodPressureDiastolic?.current || 82,
    };
    
    // Diğer metrikler
    const stepsMetric = dayMetrics.find(m => m.type === 'steps');
    const sleepMetric = dayMetrics.find(m => m.type === 'sleepDuration');
    const caloriesMetric = dayMetrics.find(m => m.type === 'activeCalories');
    
    return {
      date,
      heartRate,
      bloodPressure,
      oxygenSaturation: recoveryMetrics.oxygenSaturation?.current || 96,
      steps: stepsMetric?.value || 0,
      activeCalories: caloriesMetric?.value || 0,
      sleepDuration: sleepMetric?.value || 0,
      sleepQuality: 75 + Math.random() * 20,
      stressLevel: 30 + Math.random() * 30,
      smokingRecoveryScore: calculateHealthScore(daysSinceQuit, metrics),
    };
  } catch (error) {
    console.error('Error generating daily health summary:', error);
    return {
      date,
      heartRate: { average: 72, min: 58, max: 95, resting: 65 },
      bloodPressure: { systolic: 120, diastolic: 80 },
      oxygenSaturation: 96,
      steps: 0,
      activeCalories: 0,
      sleepDuration: 0,
      sleepQuality: 70,
      stressLevel: 40,
      smokingRecoveryScore: 50,
    };
  }
};

// Haftalık trend analizi
export const getWeeklyHealthTrend = async (
  daysSinceQuit: number
): Promise<{ date: string; score: number }[]> => {
  try {
    const metrics = await getHealthMetrics();
    const trend: { date: string; score: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayMetrics = metrics.filter(m => m.timestamp.startsWith(dateString));
      const score = calculateHealthScore(daysSinceQuit - i, dayMetrics);
      
      trend.push({ date: dateString, score });
    }
    
    return trend;
  } catch (error) {
    console.error('Error getting weekly health trend:', error);
    return [];
  }
};

// Platform kontrolü
export const isHealthKitAvailable = (): boolean => {
  return Platform.OS === 'ios';
};

export const isGoogleFitAvailable = (): boolean => {
  return Platform.OS === 'android';
};

// Sağlık verilerini dışa aktar (JSON formatında)
export const exportHealthData = async (): Promise<string> => {
  try {
    const metrics = await getHealthMetrics();
    const connections = await getDeviceConnections();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      metrics,
      connections: connections.map(c => ({
        name: c.name,
        type: c.type,
        isConnected: c.isConnected,
        lastSync: c.lastSync,
      })),
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting health data:', error);
    return '';
  }
};

// Metrik rengi belirleme (UI için)
export const getMetricStatusColor = (
  metricType: string,
  value: number
): string => {
  const target = HEALTHY_TARGETS[metricType];
  const baseline = SMOKER_BASELINE[metricType];
  
  if (!target || !baseline) return '#6B7280';
  
  const progress = Math.abs(value - baseline.value) / Math.abs(target.value - baseline.value);
  
  if (progress >= 0.8) return '#10B981'; // Yeşil - mükemmel
  if (progress >= 0.5) return '#F59E0B'; // Turuncu - iyi
  if (progress >= 0.25) return '#EF4444'; // Kırmızı - gelişmeli
  return '#6B7280'; // Gri - başlangıç
};

// Metrik trend ikonu
export const getMetricTrendIcon = (
  current: number,
  previous: number,
  higherIsBetter: boolean
): 'trending-up' | 'trending-down' | 'remove' => {
  const diff = current - previous;
  
  if (Math.abs(diff) < 0.5) return 'remove';
  
  if (higherIsBetter) {
    return diff > 0 ? 'trending-up' : 'trending-down';
  } else {
    return diff < 0 ? 'trending-up' : 'trending-down';
  }
};




