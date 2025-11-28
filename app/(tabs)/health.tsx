import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  improvement: number;
  icon: string;
  color: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
}

const healthMetrics: HealthMetric[] = [
  {
    id: '1',
    name: 'Oksijen Seviyesi',
    value: 98,
    unit: '%',
    improvement: 15,
    icon: 'airplane',
    color: Colors.info,
    description: 'Kandaki oksijen seviyesi',
    trend: 'up',
  },
  {
    id: '2',
    name: 'Akciğer Kapasitesi',
    value: 85,
    unit: '%',
    improvement: 8,
    icon: 'medical',
    color: Colors.primary,
    description: 'Nefes alma kapasitesi',
    trend: 'up',
  },
  {
    id: '3',
    name: 'Kalp Atış Hızı',
    value: 72,
    unit: 'bpm',
    improvement: -8,
    icon: 'heart',
    color: Colors.error,
    description: 'Dinlenme kalp atış hızı',
    trend: 'down',
  },
  {
    id: '4',
    name: 'Kan Basıncı',
    value: 120,
    unit: '/80',
    improvement: -5,
    icon: 'pulse',
    color: Colors.success,
    description: 'Sistolik / Diyastolik',
    trend: 'down',
  },
  {
    id: '5',
    name: 'Dolaşım',
    value: 92,
    unit: '%',
    improvement: 12,
    icon: 'water',
    color: Colors.accent,
    description: 'Kan dolaşımı iyileşmesi',
    trend: 'up',
  },
  {
    id: '6',
    name: 'Enerji Seviyesi',
    value: 78,
    unit: '%',
    improvement: 20,
    icon: 'flash',
    color: Colors.warning,
    description: 'Günlük enerji seviyesi',
    trend: 'up',
  },
];

const weeklyHealthData = [
  { day: 'Pzt', oxygen: 95, lung: 80, energy: 70 },
  { day: 'Sal', oxygen: 96, lung: 82, energy: 72 },
  { day: 'Çar', oxygen: 97, lung: 83, energy: 75 },
  { day: 'Per', oxygen: 97, lung: 84, energy: 76 },
  { day: 'Cum', oxygen: 98, lung: 85, energy: 78 },
  { day: 'Cmt', oxygen: 98, lung: 85, energy: 78 },
  { day: 'Paz', oxygen: 98, lung: 85, energy: 78 },
];

export default function HealthScreen() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: string, improvement: number) => {
    if (trend === 'up' || improvement > 0) return Colors.success;
    if (trend === 'down' && improvement < 0) return Colors.success; // Kalp atışı ve tansiyon için düşüş iyi
    return Colors.textSecondary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>❤️ Sağlık Metrikleri</Text>
            <Text style={styles.subtitle}>Sağlığınızdaki iyileşmeyi takip edin</Text>
          </View>
        </View>

        {/* Genel Sağlık Skoru */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.healthScoreCard}
        >
          <View style={styles.scoreContent}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>87</Text>
              <Text style={styles.scoreLabel}>Sağlık Skoru</Text>
            </View>
            <View style={styles.scoreInfo}>
              <View style={styles.scoreItem}>
                <Ionicons name="arrow-up" size={20} color="#fff" />
                <Text style={styles.scoreText}>+18% İyileşme</Text>
              </View>
              <View style={styles.scoreItem}>
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={styles.scoreText}>7 Gün Sigarasız</Text>
              </View>
              <View style={styles.scoreItem}>
                <Ionicons name="trophy" size={20} color="#fff" />
                <Text style={styles.scoreText}>Harika Gidiyorsun!</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Sağlık Metrikleri Grid */}
        <Text style={styles.sectionTitle}>📊 Detaylı Metrikler</Text>
        <View style={styles.metricsGrid}>
          {healthMetrics.map((metric) => (
            <TouchableOpacity
              key={metric.id}
              style={[
                styles.metricCard,
                selectedMetric === metric.id && styles.metricCardSelected,
              ]}
              onPress={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
            >
              <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                <Ionicons name={metric.icon as any} size={24} color={metric.color} />
              </View>
              <Text style={styles.metricName}>{metric.name}</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>
                  {metric.value}
                  {metric.unit}
                </Text>
                <View
                  style={[
                    styles.trendBadge,
                    { backgroundColor: getTrendColor(metric.trend, metric.improvement) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getTrendIcon(metric.trend) as any}
                    size={12}
                    color={getTrendColor(metric.trend, metric.improvement)}
                  />
                  <Text
                    style={[
                      styles.trendText,
                      { color: getTrendColor(metric.trend, metric.improvement) },
                    ]}
                  >
                    {metric.improvement > 0 ? '+' : ''}
                    {metric.improvement}%
                  </Text>
                </View>
              </View>
              <Text style={styles.metricDescription}>{metric.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Haftalık Grafik */}
        <Text style={styles.sectionTitle}>📈 Haftalık İyileşme</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Oksijen Seviyesi</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
                <Text style={styles.legendText}>Oksijen</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.legendText}>Akciğer</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.legendText}>Enerji</Text>
              </View>
            </View>
          </View>
          <View style={styles.chart}>
            {weeklyHealthData.map((data, index) => {
              const maxValue = 100;
              return (
                <View key={data.day} style={styles.chartBarContainer}>
                  <View style={styles.chartBars}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${(data.oxygen / maxValue) * 100}%`,
                          backgroundColor: Colors.info,
                          marginRight: 2,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${(data.lung / maxValue) * 100}%`,
                          backgroundColor: Colors.primary,
                          marginRight: 2,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${(data.energy / maxValue) * 100}%`,
                          backgroundColor: Colors.warning,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{data.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Sağlık İyileşme Zaman Çizelgesi */}
        <Text style={styles.sectionTitle}>⏱️ İyileşme Zaman Çizelgesi</Text>
        <View style={styles.timelineCard}>
          {[
            { time: '20 dk', title: 'Kalp Atışı Normalleşir', completed: true },
            { time: '12 saat', title: 'Karbonmonoksit Düşer', completed: true },
            { time: '2-12 hafta', title: 'Dolaşım İyileşir', completed: true },
            { time: '1-9 ay', title: 'Öksürük Azalır', completed: false },
            { time: '1 yıl', title: 'Kalp Hastalığı Riski Yarıya İner', completed: false },
          ].map((milestone, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDotContainer}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: milestone.completed ? Colors.success : Colors.border },
                  ]}
                >
                  {milestone.completed && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </View>
                {index < 4 && (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: milestone.completed ? Colors.success + '50' : Colors.border },
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{milestone.time}</Text>
                <Text
                  style={[
                    styles.timelineTitle,
                    { color: milestone.completed ? Colors.text : Colors.textSecondary },
                  ]}
                >
                  {milestone.title}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sağlık İpuçları */}
        <Text style={styles.sectionTitle}>💡 Sağlık İpuçları</Text>
        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Ionicons name="leaf" size={24} color={Colors.primary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Düzenli Egzersiz</Text>
              <Text style={styles.tipText}>
                Günde 30 dakika yürüyüş akciğer kapasitenizi artırır
              </Text>
            </View>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="water" size={24} color={Colors.info} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Bol Su İçin</Text>
              <Text style={styles.tipText}>
                Günde 2-3 litre su içmek vücudunuzun temizlenmesine yardımcı olur
              </Text>
            </View>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="moon" size={24} color={Colors.accent} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>İyi Uyuyun</Text>
              <Text style={styles.tipText}>
                7-8 saat kaliteli uyku vücudunuzun iyileşmesini hızlandırır
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Tab bar için alan
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  healthScoreCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scoreInfo: {
    flex: 1,
    marginLeft: 24,
    gap: 12,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    alignItems: 'flex-end',
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  timelineCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineDotContainer: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tipsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tipContent: {
    flex: 1,
    marginLeft: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});




