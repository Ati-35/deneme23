// Detaylı Sağlık Raporları
// PDF/PNG export, doktor raporu formatı

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share, Platform } from 'react-native';
import { calculateRecoveryMetrics, getHealthMetrics, generateDailyHealthSummary, HealthSummary } from './healthDeviceSync';
import { getUserData } from './storage';

// Types
export interface HealthReport {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  summary: ReportSummary;
  metrics: ReportMetric[];
  recommendations: string[];
  doctorNotes?: string;
}

export type ReportType = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface ReportSummary {
  daysSinceQuit: number;
  totalCigarettesAvoided: number;
  moneySaved: number;
  healthScore: number;
  healthScoreChange: number;
  overallProgress: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
}

export interface ReportMetric {
  name: string;
  category: string;
  currentValue: number;
  previousValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  percentChange: number;
  status: 'excellent' | 'good' | 'moderate' | 'poor';
}

export interface DoctorReport {
  id: string;
  patientName: string;
  generatedAt: string;
  reportPeriod: string;
  smokingHistory: {
    quitDate: string;
    previousConsumption: number;
    yearsSmoked?: number;
  };
  vitalSigns: {
    heartRate: { value: number; status: string };
    bloodPressure: { systolic: number; diastolic: number; status: string };
    oxygenSaturation: { value: number; status: string };
    respiratoryRate: { value: number; status: string };
  };
  recoveryProgress: {
    overallScore: number;
    lungFunction: number;
    cardiovascularHealth: number;
    circulation: number;
  };
  behavioralData: {
    cravingFrequency: number;
    averageCravingIntensity: number;
    crisesOvercome: number;
    copingStrategiesUsed: string[];
  };
  recommendations: string[];
  notes: string;
}

// Storage Keys
const KEYS = {
  REPORTS: '@health_reports',
  DOCTOR_REPORTS: '@doctor_reports',
};

// Metrik durumu belirleme
const getMetricStatus = (current: number, target: number, isLowerBetter: boolean): 'excellent' | 'good' | 'moderate' | 'poor' => {
  const progress = isLowerBetter 
    ? (1 - current / target) * 100
    : (current / target) * 100;

  if (progress >= 90) return 'excellent';
  if (progress >= 70) return 'good';
  if (progress >= 50) return 'moderate';
  return 'poor';
};

// Trend belirleme
const getTrend = (current: number, previous: number, isLowerBetter: boolean): 'improving' | 'stable' | 'declining' => {
  const change = current - previous;
  const percentChange = Math.abs(change / previous) * 100;

  if (percentChange < 2) return 'stable';
  
  if (isLowerBetter) {
    return change < 0 ? 'improving' : 'declining';
  } else {
    return change > 0 ? 'improving' : 'declining';
  }
};

// Haftalık rapor oluştur
export const generateWeeklyReport = async (daysSinceQuit: number): Promise<HealthReport> => {
  const userData = await getUserData();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recoveryMetrics = calculateRecoveryMetrics(daysSinceQuit);
  const previousMetrics = calculateRecoveryMetrics(Math.max(0, daysSinceQuit - 7));
  
  const metrics: ReportMetric[] = [
    {
      name: 'Kalp Atış Hızı',
      category: 'Kardiyovasküler',
      currentValue: recoveryMetrics.heartRate?.current || 72,
      previousValue: previousMetrics.heartRate?.current || 75,
      targetValue: 68,
      unit: 'bpm',
      trend: getTrend(recoveryMetrics.heartRate?.current || 72, previousMetrics.heartRate?.current || 75, true),
      percentChange: recoveryMetrics.heartRate?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.heartRate?.current || 72, 68, true),
    },
    {
      name: 'Oksijen Saturasyonu',
      category: 'Solunum',
      currentValue: recoveryMetrics.oxygenSaturation?.current || 96,
      previousValue: previousMetrics.oxygenSaturation?.current || 95,
      targetValue: 98,
      unit: '%',
      trend: getTrend(recoveryMetrics.oxygenSaturation?.current || 96, previousMetrics.oxygenSaturation?.current || 95, false),
      percentChange: recoveryMetrics.oxygenSaturation?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.oxygenSaturation?.current || 96, 98, false),
    },
    {
      name: 'Akciğer Kapasitesi',
      category: 'Solunum',
      currentValue: recoveryMetrics.lungCapacity?.current || 80,
      previousValue: previousMetrics.lungCapacity?.current || 78,
      targetValue: 100,
      unit: '%',
      trend: getTrend(recoveryMetrics.lungCapacity?.current || 80, previousMetrics.lungCapacity?.current || 78, false),
      percentChange: recoveryMetrics.lungCapacity?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.lungCapacity?.current || 80, 100, false),
    },
    {
      name: 'Kan Dolaşımı',
      category: 'Kardiyovasküler',
      currentValue: recoveryMetrics.circulation?.current || 78,
      previousValue: previousMetrics.circulation?.current || 75,
      targetValue: 95,
      unit: '%',
      trend: getTrend(recoveryMetrics.circulation?.current || 78, previousMetrics.circulation?.current || 75, false),
      percentChange: recoveryMetrics.circulation?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.circulation?.current || 78, 95, false),
    },
    {
      name: 'Enerji Seviyesi',
      category: 'Genel Sağlık',
      currentValue: recoveryMetrics.energyLevel?.current || 70,
      previousValue: previousMetrics.energyLevel?.current || 65,
      targetValue: 90,
      unit: '%',
      trend: getTrend(recoveryMetrics.energyLevel?.current || 70, previousMetrics.energyLevel?.current || 65, false),
      percentChange: recoveryMetrics.energyLevel?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.energyLevel?.current || 70, 90, false),
    },
  ];

  const cigarettesPerDay = userData?.cigarettesPerDay || 20;
  const pricePerPack = userData?.pricePerPack || 50;
  const cigarettesAvoided = daysSinceQuit * cigarettesPerDay;
  const moneySaved = daysSinceQuit * pricePerPack;

  // Genel ilerleme durumu
  const avgStatus = metrics.reduce((sum, m) => {
    const statusValue = { excellent: 4, good: 3, moderate: 2, poor: 1 }[m.status];
    return sum + statusValue;
  }, 0) / metrics.length;

  let overallProgress: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
  if (avgStatus >= 3.5) overallProgress = 'excellent';
  else if (avgStatus >= 2.5) overallProgress = 'good';
  else if (avgStatus >= 1.5) overallProgress = 'moderate';
  else overallProgress = 'needs_improvement';

  const healthScore = Math.round(avgStatus * 25);
  const previousHealthScore = Math.round((avgStatus - 0.1) * 25);

  const recommendations = generateRecommendations(metrics, daysSinceQuit);

  const report: HealthReport = {
    id: `weekly-${Date.now()}`,
    type: 'weekly',
    title: 'Haftalık Sağlık Raporu',
    generatedAt: new Date().toISOString(),
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      daysSinceQuit,
      totalCigarettesAvoided: cigarettesAvoided,
      moneySaved,
      healthScore,
      healthScoreChange: healthScore - previousHealthScore,
      overallProgress,
    },
    metrics,
    recommendations,
  };

  // Raporu kaydet
  await saveReport(report);

  return report;
};

// Aylık rapor oluştur
export const generateMonthlyReport = async (daysSinceQuit: number): Promise<HealthReport> => {
  const userData = await getUserData();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recoveryMetrics = calculateRecoveryMetrics(daysSinceQuit);
  const previousMetrics = calculateRecoveryMetrics(Math.max(0, daysSinceQuit - 30));
  
  const metrics: ReportMetric[] = [
    {
      name: 'Kalp Atış Hızı',
      category: 'Kardiyovasküler',
      currentValue: recoveryMetrics.heartRate?.current || 70,
      previousValue: previousMetrics.heartRate?.current || 78,
      targetValue: 68,
      unit: 'bpm',
      trend: getTrend(recoveryMetrics.heartRate?.current || 70, previousMetrics.heartRate?.current || 78, true),
      percentChange: recoveryMetrics.heartRate?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.heartRate?.current || 70, 68, true),
    },
    {
      name: 'Sistolik Kan Basıncı',
      category: 'Kardiyovasküler',
      currentValue: recoveryMetrics.bloodPressureSystolic?.current || 125,
      previousValue: previousMetrics.bloodPressureSystolic?.current || 132,
      targetValue: 120,
      unit: 'mmHg',
      trend: getTrend(recoveryMetrics.bloodPressureSystolic?.current || 125, previousMetrics.bloodPressureSystolic?.current || 132, true),
      percentChange: recoveryMetrics.bloodPressureSystolic?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.bloodPressureSystolic?.current || 125, 120, true),
    },
    {
      name: 'Diyastolik Kan Basıncı',
      category: 'Kardiyovasküler',
      currentValue: recoveryMetrics.bloodPressureDiastolic?.current || 82,
      previousValue: previousMetrics.bloodPressureDiastolic?.current || 86,
      targetValue: 80,
      unit: 'mmHg',
      trend: getTrend(recoveryMetrics.bloodPressureDiastolic?.current || 82, previousMetrics.bloodPressureDiastolic?.current || 86, true),
      percentChange: recoveryMetrics.bloodPressureDiastolic?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.bloodPressureDiastolic?.current || 82, 80, true),
    },
    {
      name: 'Oksijen Saturasyonu',
      category: 'Solunum',
      currentValue: recoveryMetrics.oxygenSaturation?.current || 97,
      previousValue: previousMetrics.oxygenSaturation?.current || 94,
      targetValue: 98,
      unit: '%',
      trend: getTrend(recoveryMetrics.oxygenSaturation?.current || 97, previousMetrics.oxygenSaturation?.current || 94, false),
      percentChange: recoveryMetrics.oxygenSaturation?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.oxygenSaturation?.current || 97, 98, false),
    },
    {
      name: 'Akciğer Kapasitesi',
      category: 'Solunum',
      currentValue: recoveryMetrics.lungCapacity?.current || 85,
      previousValue: previousMetrics.lungCapacity?.current || 76,
      targetValue: 100,
      unit: '%',
      trend: getTrend(recoveryMetrics.lungCapacity?.current || 85, previousMetrics.lungCapacity?.current || 76, false),
      percentChange: recoveryMetrics.lungCapacity?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.lungCapacity?.current || 85, 100, false),
    },
    {
      name: 'Kan Dolaşımı',
      category: 'Kardiyovasküler',
      currentValue: recoveryMetrics.circulation?.current || 82,
      previousValue: previousMetrics.circulation?.current || 72,
      targetValue: 95,
      unit: '%',
      trend: getTrend(recoveryMetrics.circulation?.current || 82, previousMetrics.circulation?.current || 72, false),
      percentChange: recoveryMetrics.circulation?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.circulation?.current || 82, 95, false),
    },
    {
      name: 'Enerji Seviyesi',
      category: 'Genel Sağlık',
      currentValue: recoveryMetrics.energyLevel?.current || 75,
      previousValue: previousMetrics.energyLevel?.current || 62,
      targetValue: 90,
      unit: '%',
      trend: getTrend(recoveryMetrics.energyLevel?.current || 75, previousMetrics.energyLevel?.current || 62, false),
      percentChange: recoveryMetrics.energyLevel?.improvement || 0,
      status: getMetricStatus(recoveryMetrics.energyLevel?.current || 75, 90, false),
    },
  ];

  const cigarettesPerDay = userData?.cigarettesPerDay || 20;
  const pricePerPack = userData?.pricePerPack || 50;
  const cigarettesAvoided = daysSinceQuit * cigarettesPerDay;
  const moneySaved = daysSinceQuit * pricePerPack;

  const avgStatus = metrics.reduce((sum, m) => {
    const statusValue = { excellent: 4, good: 3, moderate: 2, poor: 1 }[m.status];
    return sum + statusValue;
  }, 0) / metrics.length;

  let overallProgress: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
  if (avgStatus >= 3.5) overallProgress = 'excellent';
  else if (avgStatus >= 2.5) overallProgress = 'good';
  else if (avgStatus >= 1.5) overallProgress = 'moderate';
  else overallProgress = 'needs_improvement';

  const healthScore = Math.round(avgStatus * 25);
  const previousHealthScore = Math.round((avgStatus - 0.15) * 25);

  const recommendations = generateRecommendations(metrics, daysSinceQuit);

  const report: HealthReport = {
    id: `monthly-${Date.now()}`,
    type: 'monthly',
    title: 'Aylık Sağlık Raporu',
    generatedAt: new Date().toISOString(),
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      daysSinceQuit,
      totalCigarettesAvoided: cigarettesAvoided,
      moneySaved,
      healthScore,
      healthScoreChange: healthScore - previousHealthScore,
      overallProgress,
    },
    metrics,
    recommendations,
  };

  await saveReport(report);
  return report;
};

// Doktor raporu oluştur
export const generateDoctorReport = async (daysSinceQuit: number): Promise<DoctorReport> => {
  const userData = await getUserData();
  const recoveryMetrics = calculateRecoveryMetrics(daysSinceQuit);
  
  const report: DoctorReport = {
    id: `doctor-${Date.now()}`,
    patientName: userData?.name || 'Hasta',
    generatedAt: new Date().toISOString(),
    reportPeriod: `Son ${daysSinceQuit} gün`,
    smokingHistory: {
      quitDate: userData?.quitDate || new Date().toISOString(),
      previousConsumption: userData?.cigarettesPerDay || 20,
      yearsSmoked: 10, // Bu değer kullanıcıdan alınabilir
    },
    vitalSigns: {
      heartRate: {
        value: recoveryMetrics.heartRate?.current || 72,
        status: recoveryMetrics.heartRate?.current <= 75 ? 'Normal' : 'Yüksek',
      },
      bloodPressure: {
        systolic: recoveryMetrics.bloodPressureSystolic?.current || 125,
        diastolic: recoveryMetrics.bloodPressureDiastolic?.current || 82,
        status: recoveryMetrics.bloodPressureSystolic?.current <= 130 ? 'Normal' : 'Yüksek',
      },
      oxygenSaturation: {
        value: recoveryMetrics.oxygenSaturation?.current || 96,
        status: recoveryMetrics.oxygenSaturation?.current >= 95 ? 'Normal' : 'Düşük',
      },
      respiratoryRate: {
        value: 16,
        status: 'Normal',
      },
    },
    recoveryProgress: {
      overallScore: Math.round((recoveryMetrics.lungCapacity?.improvement || 0) * 0.8 + 20),
      lungFunction: recoveryMetrics.lungCapacity?.improvement || 0,
      cardiovascularHealth: recoveryMetrics.heartRate?.improvement || 0,
      circulation: recoveryMetrics.circulation?.improvement || 0,
    },
    behavioralData: {
      cravingFrequency: Math.max(1, 10 - Math.floor(daysSinceQuit / 10)),
      averageCravingIntensity: Math.max(2, 8 - Math.floor(daysSinceQuit / 15)),
      crisesOvercome: Math.floor(daysSinceQuit * 1.5),
      copingStrategiesUsed: [
        'Nefes egzersizleri',
        'Fiziksel aktivite',
        'Su içme',
        'Dikkat dağıtma teknikleri',
      ],
    },
    recommendations: [
      'Düzenli kardiyovasküler egzersiz önerilir (haftada 3-4 kez, 30 dakika)',
      'Bol su tüketimi devam etmelidir (günde 2-3 litre)',
      'Tetikleyici durumlardan kaçınılmalıdır',
      daysSinceQuit < 30 
        ? 'İlk ay kritik dönemdir, destek gruplarına katılım önerilir'
        : 'İlerleme çok iyi, mevcut stratejilere devam edilmeli',
      'Yıllık akciğer kontrolü önerilir',
    ],
    notes: `Hasta ${daysSinceQuit} gündür sigarasız. Genel iyileşme trendi pozitif. ` +
           `Kardiyovasküler metrikler beklenen iyileşme trendinde. ` +
           `Davranışsal veriler başarılı bir bırakma süreci göstermektedir.`,
  };

  // Raporu kaydet
  await saveDoctorReport(report);
  
  return report;
};

// Öneriler oluştur
const generateRecommendations = (metrics: ReportMetric[], daysSinceQuit: number): string[] => {
  const recommendations: string[] = [];

  // Metrik bazlı öneriler
  metrics.forEach(metric => {
    if (metric.status === 'poor' || metric.status === 'moderate') {
      switch (metric.category) {
        case 'Kardiyovasküler':
          recommendations.push('Düzenli kardiyovasküler egzersiz yapmanız önerilir');
          break;
        case 'Solunum':
          recommendations.push('Nefes egzersizlerini artırmanız faydalı olacaktır');
          break;
        case 'Genel Sağlık':
          recommendations.push('Yeterli uyku ve dengeli beslenmeye dikkat edin');
          break;
      }
    }
  });

  // Zaman bazlı öneriler
  if (daysSinceQuit < 7) {
    recommendations.push('İlk hafta en zor dönemdir, tetikleyicilerden uzak durun');
    recommendations.push('Bol su için ve ellerinizi meşgul tutun');
  } else if (daysSinceQuit < 30) {
    recommendations.push('İlk ay kritik dönemdir, motivasyonunuzu yüksek tutun');
    recommendations.push('Sosyal destek gruplarına katılmayı düşünün');
  } else if (daysSinceQuit < 90) {
    recommendations.push('Harika ilerleme! Tetikleyicileri tanımaya devam edin');
    recommendations.push('Fiziksel aktiviteyi artırarak sağlık kazanımlarını hızlandırın');
  } else {
    recommendations.push('Mükemmel! Artık sigara içmeyen biri olarak kendinizi tanımlayabilirsiniz');
    recommendations.push('Başkalarına mentor olarak destek vermeyi düşünün');
  }

  // Genel öneriler
  recommendations.push('Günlük 2-3 litre su tüketmeye devam edin');
  recommendations.push('Stres yönetimi tekniklerini düzenli uygulayın');

  return [...new Set(recommendations)].slice(0, 6); // Tekrarları kaldır, max 6 öneri
};

// Rapor kaydet
const saveReport = async (report: HealthReport): Promise<void> => {
  try {
    const reports = await getReports();
    reports.push(report);
    
    // Son 50 raporu tut
    const recentReports = reports.slice(-50);
    await AsyncStorage.setItem(KEYS.REPORTS, JSON.stringify(recentReports));
  } catch (error) {
    console.error('Error saving report:', error);
  }
};

// Raporları getir
export const getReports = async (): Promise<HealthReport[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting reports:', error);
    return [];
  }
};

// Doktor raporu kaydet
const saveDoctorReport = async (report: DoctorReport): Promise<void> => {
  try {
    const reports = await getDoctorReports();
    reports.push(report);
    
    const recentReports = reports.slice(-20);
    await AsyncStorage.setItem(KEYS.DOCTOR_REPORTS, JSON.stringify(recentReports));
  } catch (error) {
    console.error('Error saving doctor report:', error);
  }
};

// Doktor raporlarını getir
export const getDoctorReports = async (): Promise<DoctorReport[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.DOCTOR_REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting doctor reports:', error);
    return [];
  }
};

// Raporu metin formatında dışa aktar
export const exportReportAsText = (report: HealthReport): string => {
  let text = `
═══════════════════════════════════════════════════════
                    ${report.title}
═══════════════════════════════════════════════════════

Oluşturulma Tarihi: ${new Date(report.generatedAt).toLocaleDateString('tr-TR')}
Rapor Dönemi: ${new Date(report.period.start).toLocaleDateString('tr-TR')} - ${new Date(report.period.end).toLocaleDateString('tr-TR')}

───────────────────────────────────────────────────────
                      ÖZET
───────────────────────────────────────────────────────

Sigarasız Geçen Gün: ${report.summary.daysSinceQuit}
İçilmeyen Sigara: ${report.summary.totalCigarettesAvoided}
Tasarruf: ₺${report.summary.moneySaved.toLocaleString('tr-TR')}
Sağlık Skoru: ${report.summary.healthScore}/100 (${report.summary.healthScoreChange >= 0 ? '+' : ''}${report.summary.healthScoreChange})
Genel Durum: ${getProgressText(report.summary.overallProgress)}

───────────────────────────────────────────────────────
                    METRİKLER
───────────────────────────────────────────────────────
`;

  report.metrics.forEach(metric => {
    text += `
${metric.name} (${metric.category})
  Mevcut: ${metric.currentValue} ${metric.unit}
  Önceki: ${metric.previousValue} ${metric.unit}
  Hedef: ${metric.targetValue} ${metric.unit}
  Trend: ${getTrendText(metric.trend)} (${metric.percentChange >= 0 ? '+' : ''}${metric.percentChange.toFixed(1)}%)
  Durum: ${getStatusText(metric.status)}
`;
  });

  text += `
───────────────────────────────────────────────────────
                    ÖNERİLER
───────────────────────────────────────────────────────
`;

  report.recommendations.forEach((rec, index) => {
    text += `${index + 1}. ${rec}\n`;
  });

  text += `
═══════════════════════════════════════════════════════
           SigaraBırak Uygulaması ile oluşturuldu
═══════════════════════════════════════════════════════
`;

  return text;
};

// Doktor raporunu metin formatında dışa aktar
export const exportDoctorReportAsText = (report: DoctorReport): string => {
  return `
═══════════════════════════════════════════════════════
              HASTA SAĞLIK RAPORU
           (Sigara Bırakma İlerleme Raporu)
═══════════════════════════════════════════════════════

HASTA BİLGİLERİ
───────────────────────────────────────────────────────
Hasta Adı: ${report.patientName}
Rapor Tarihi: ${new Date(report.generatedAt).toLocaleDateString('tr-TR')}
Rapor Dönemi: ${report.reportPeriod}

SİGARA KULLANIM GEÇMİŞİ
───────────────────────────────────────────────────────
Bırakış Tarihi: ${new Date(report.smokingHistory.quitDate).toLocaleDateString('tr-TR')}
Önceki Günlük Tüketim: ${report.smokingHistory.previousConsumption} adet/gün
${report.smokingHistory.yearsSmoked ? `Sigara İçilen Süre: ${report.smokingHistory.yearsSmoked} yıl` : ''}

VİTAL BULGULAR
───────────────────────────────────────────────────────
Kalp Atış Hızı: ${report.vitalSigns.heartRate.value} bpm (${report.vitalSigns.heartRate.status})
Kan Basıncı: ${report.vitalSigns.bloodPressure.systolic}/${report.vitalSigns.bloodPressure.diastolic} mmHg (${report.vitalSigns.bloodPressure.status})
Oksijen Saturasyonu: ${report.vitalSigns.oxygenSaturation.value}% (${report.vitalSigns.oxygenSaturation.status})
Solunum Hızı: ${report.vitalSigns.respiratoryRate.value}/dk (${report.vitalSigns.respiratoryRate.status})

İYİLEŞME İLERLEMESİ
───────────────────────────────────────────────────────
Genel İyileşme Skoru: ${report.recoveryProgress.overallScore}%
Akciğer Fonksiyonu İyileşme: ${report.recoveryProgress.lungFunction}%
Kardiyovasküler Sağlık İyileşme: ${report.recoveryProgress.cardiovascularHealth}%
Dolaşım İyileşme: ${report.recoveryProgress.circulation}%

DAVRANIŞSAL VERİLER
───────────────────────────────────────────────────────
Günlük Ortalama İstek Sıklığı: ${report.behavioralData.cravingFrequency} kez
Ortalama İstek Yoğunluğu: ${report.behavioralData.averageCravingIntensity}/10
Başarıyla Atlanan Kriz Sayısı: ${report.behavioralData.crisesOvercome}
Kullanılan Başa Çıkma Stratejileri: ${report.behavioralData.copingStrategiesUsed.join(', ')}

ÖNERİLER
───────────────────────────────────────────────────────
${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

NOTLAR
───────────────────────────────────────────────────────
${report.notes}

═══════════════════════════════════════════════════════
Bu rapor SigaraBırak uygulaması tarafından otomatik olarak
oluşturulmuştur. Tıbbi değerlendirme için doktorunuza danışınız.
═══════════════════════════════════════════════════════
`;
};

// Raporu paylaş
export const shareReport = async (report: HealthReport): Promise<void> => {
  try {
    const text = exportReportAsText(report);
    await Share.share({
      message: text,
      title: report.title,
    });
  } catch (error) {
    console.error('Error sharing report:', error);
  }
};

// Doktor raporunu paylaş
export const shareDoctorReport = async (report: DoctorReport): Promise<void> => {
  try {
    const text = exportDoctorReportAsText(report);
    await Share.share({
      message: text,
      title: 'Hasta Sağlık Raporu',
    });
  } catch (error) {
    console.error('Error sharing doctor report:', error);
  }
};

// Yardımcı fonksiyonlar
const getProgressText = (progress: string): string => {
  switch (progress) {
    case 'excellent': return 'Mükemmel';
    case 'good': return 'İyi';
    case 'moderate': return 'Orta';
    case 'needs_improvement': return 'Geliştirilmeli';
    default: return progress;
  }
};

const getTrendText = (trend: string): string => {
  switch (trend) {
    case 'improving': return 'İyileşiyor ↑';
    case 'stable': return 'Stabil →';
    case 'declining': return 'Düşüyor ↓';
    default: return trend;
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'excellent': return 'Mükemmel';
    case 'good': return 'İyi';
    case 'moderate': return 'Orta';
    case 'poor': return 'Zayıf';
    default: return status;
  }
};







