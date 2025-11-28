// Analytics Hub - Gelişmiş Analitik Dashboard
// İstatistikler, grafikler, raporlar, insights

import React, { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { SemanticColors, Palette, Gradients, withAlpha } from '../constants/Colors';
import { Spacing, BorderRadius } from '../constants/DesignTokens';
import {
  getAnalyticsSummary,
  getTrendData,
  analyzeCravings,
  generateWeeklyReport,
  AnalyticsSummary,
  TrendData,
  CravingAnalysis,
  WeeklyReport,
  COMMON_TRIGGERS,
  COPING_STRATEGIES,
} from '../utils/analyticsSystem';
import { ScalePressable } from '../components/interactions';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

type TimeRange = '7d' | '30d' | '90d' | 'all';
type MetricType = 'mood' | 'craving' | 'energy' | 'stress';

export default function AnalyticsHubScreen() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [cravingAnalysis, setCravingAnalysis] = useState<CravingAnalysis | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('mood');
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTrendData();
  }, [selectedMetric, timeRange]);

  const loadData = async () => {
    const [summaryData, cravingData] = await Promise.all([
      getAnalyticsSummary(),
      analyzeCravings(),
    ]);
    
    setSummary(summaryData);
    setCravingAnalysis(cravingData);
    
    // Generate weekly report for current week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const reportData = await generateWeeklyReport(weekStart.toISOString().split('T')[0]);
    setWeeklyReport(reportData);
  };

  const loadTrendData = async () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data = await getTrendData(selectedMetric, days);
    setTrendData(data);
  };

  const metrics: { id: MetricType; label: string; icon: string; color: string }[] = [
    { id: 'mood', label: 'Ruh Hali', icon: '😊', color: Palette.success[500] },
    { id: 'craving', label: 'Sigara İsteği', icon: '🚬', color: Palette.error[500] },
    { id: 'energy', label: 'Enerji', icon: '⚡', color: Palette.accent[500] },
    { id: 'stress', label: 'Stres', icon: '😰', color: Palette.purple[500] },
  ];

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: '7d', label: '7 Gün' },
    { id: '30d', label: '30 Gün' },
    { id: '90d', label: '90 Gün' },
    { id: 'all', label: 'Tümü' },
  ];

  // Simple chart visualization
  const maxValue = Math.max(...trendData.map(d => d.value), 1);
  const chartHeight = 120;

  if (!summary) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analitikler</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <FadeIn delay={100}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.summaryScroll}
          >
            <SummaryCard
              title="Toplam Gün"
              value={summary.totalDaysTracked.toString()}
              icon="calendar"
              color={Palette.primary[500]}
            />
            <SummaryCard
              title="Mevcut Seri"
              value={summary.currentStreak.toString()}
              icon="flame"
              color={Palette.error[500]}
            />
            <SummaryCard
              title="En Uzun Seri"
              value={summary.longestStreak.toString()}
              icon="trophy"
              color={Palette.accent[500]}
            />
            <SummaryCard
              title="Sağlık Skoru"
              value={`${summary.healthScore}%`}
              icon="heart"
              color={Palette.success[500]}
            />
          </ScrollView>
        </FadeIn>

        {/* Trend Chart */}
        <FadeIn delay={200}>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>📊 Trend Analizi</Text>
              
              {/* Time Range Selector */}
              <View style={styles.timeRangeSelector}>
                {timeRanges.map((range) => (
                  <TouchableOpacity
                    key={range.id}
                    style={[
                      styles.timeRangeButton,
                      timeRange === range.id && styles.timeRangeButtonActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setTimeRange(range.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.timeRangeText,
                        timeRange === range.id && styles.timeRangeTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Metric Selector */}
            <View style={styles.metricSelector}>
              {metrics.map((metric) => (
                <TouchableOpacity
                  key={metric.id}
                  style={[
                    styles.metricButton,
                    selectedMetric === metric.id && { backgroundColor: withAlpha(metric.color, 0.2) },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedMetric(metric.id);
                  }}
                >
                  <Text style={styles.metricIcon}>{metric.icon}</Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      selectedMetric === metric.id && { color: metric.color },
                    ]}
                  >
                    {metric.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Simple Bar Chart */}
            <View style={[styles.chart, { height: chartHeight }]}>
              {trendData.slice(-14).map((data, index) => (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        height: `${(data.value / maxValue) * 100}%`,
                        backgroundColor: metrics.find(m => m.id === selectedMetric)?.color || Palette.primary[500],
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Average */}
            <View style={styles.chartFooter}>
              <Text style={styles.chartAverage}>
                Ortalama: {(trendData.reduce((sum, d) => sum + d.value, 0) / Math.max(trendData.length, 1)).toFixed(1)}
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* Weekly Report */}
        {weeklyReport && (
          <FadeIn delay={300}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Haftalık Rapor</Text>
              
              <View style={styles.reportCard}>
                <View style={styles.reportGrid}>
                  <View style={styles.reportItem}>
                    <Text style={styles.reportItemValue}>{weeklyReport.averageMood.toFixed(1)}</Text>
                    <Text style={styles.reportItemLabel}>Ort. Ruh Hali</Text>
                    <TrendIndicator trend={weeklyReport.moodTrend} />
                  </View>
                  <View style={styles.reportItem}>
                    <Text style={styles.reportItemValue}>{weeklyReport.averageCraving.toFixed(1)}</Text>
                    <Text style={styles.reportItemLabel}>Ort. İstek</Text>
                    <TrendIndicator trend={weeklyReport.cravingTrend} reverse />
                  </View>
                  <View style={styles.reportItem}>
                    <Text style={styles.reportItemValue}>{weeklyReport.totalCravings}</Text>
                    <Text style={styles.reportItemLabel}>Toplam İstek</Text>
                  </View>
                  <View style={styles.reportItem}>
                    <Text style={styles.reportItemValue}>{weeklyReport.overallScore}</Text>
                    <Text style={styles.reportItemLabel}>Genel Skor</Text>
                  </View>
                </View>

                {/* Top Triggers */}
                {weeklyReport.topTriggers.length > 0 && (
                  <View style={styles.triggersSection}>
                    <Text style={styles.triggersTitle}>En Yaygın Tetikleyiciler</Text>
                    <View style={styles.triggersList}>
                      {weeklyReport.topTriggers.slice(0, 3).map((trigger, index) => (
                        <View key={index} style={styles.triggerItem}>
                          <Text style={styles.triggerName}>{trigger.trigger}</Text>
                          <Text style={styles.triggerCount}>{trigger.count}x</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Recommendations */}
                <View style={styles.recommendationsSection}>
                  <Text style={styles.recommendationsTitle}>💡 Öneriler</Text>
                  {weeklyReport.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Ionicons name="bulb-outline" size={16} color={Palette.accent[500]} />
                      <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </FadeIn>
        )}

        {/* Craving Analysis */}
        {cravingAnalysis && (
          <FadeIn delay={400}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Sigara İsteği Analizi</Text>
              
              <View style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <View style={styles.successRateContainer}>
                    <Text style={styles.successRateValue}>{cravingAnalysis.successRate}%</Text>
                    <Text style={styles.successRateLabel}>Başarı Oranı</Text>
                  </View>
                </View>

                {/* Most Common Times */}
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>⏰ En Riskli Saatler</Text>
                  <View style={styles.timesList}>
                    {cravingAnalysis.mostCommonTimes.slice(0, 5).map((time, index) => (
                      <View key={index} style={styles.timeItem}>
                        <Text style={styles.timeHour}>
                          {time.hour.toString().padStart(2, '0')}:00
                        </Text>
                        <View style={styles.timeBarContainer}>
                          <View
                            style={[
                              styles.timeBar,
                              {
                                width: `${(time.count / Math.max(...cravingAnalysis.mostCommonTimes.map(t => t.count))) * 100}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.timeCount}>{time.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Coping Effectiveness */}
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>💪 En Etkili Stratejiler</Text>
                  <View style={styles.strategiesList}>
                    {cravingAnalysis.copingEffectiveness.slice(0, 5).map((strategy, index) => (
                      <View key={index} style={styles.strategyItem}>
                        <View style={styles.strategyInfo}>
                          <Text style={styles.strategyName}>{strategy.strategy}</Text>
                          <View style={styles.strategyBarContainer}>
                            <View
                              style={[
                                styles.strategyBar,
                                { width: `${strategy.successRate}%` },
                              ]}
                            />
                          </View>
                        </View>
                        <Text style={styles.strategyRate}>{strategy.successRate}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </FadeIn>
        )}

        {/* Best & Worst Days */}
        <FadeIn delay={500}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📆 Öne Çıkan Günler</Text>
            
            <View style={styles.daysRow}>
              <View style={[styles.dayCard, styles.bestDayCard]}>
                <Text style={styles.dayCardIcon}>🌟</Text>
                <Text style={styles.dayCardTitle}>En İyi Gün</Text>
                <Text style={styles.dayCardDate}>
                  {summary.bestDay.date ? new Date(summary.bestDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}
                </Text>
                <Text style={styles.dayCardScore}>Skor: {summary.bestDay.score}</Text>
              </View>
              
              <View style={[styles.dayCard, styles.worstDayCard]}>
                <Text style={styles.dayCardIcon}>💪</Text>
                <Text style={styles.dayCardTitle}>Gelişim Alanı</Text>
                <Text style={styles.dayCardDate}>
                  {summary.worstDay.date ? new Date(summary.worstDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}
                </Text>
                <Text style={styles.dayCardScore}>Skor: {summary.worstDay.score}</Text>
              </View>
            </View>
          </View>
        </FadeIn>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Summary Card Component
function SummaryCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: withAlpha(color, 0.15) }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
  );
}

// Trend Indicator Component
function TrendIndicator({ trend, reverse = false }: {
  trend: 'improving' | 'stable' | 'worsening';
  reverse?: boolean;
}) {
  const isPositive = reverse ? trend === 'worsening' : trend === 'improving';
  const isNegative = reverse ? trend === 'improving' : trend === 'worsening';
  
  return (
    <View style={[
      styles.trendIndicator,
      isPositive && styles.trendPositive,
      isNegative && styles.trendNegative,
    ]}>
      <Ionicons
        name={trend === 'stable' ? 'remove' : isPositive ? 'arrow-up' : 'arrow-down'}
        size={12}
        color={isPositive ? Palette.success[500] : isNegative ? Palette.error[500] : SemanticColors.text.tertiary}
      />
      <Text style={[
        styles.trendText,
        isPositive && styles.trendTextPositive,
        isNegative && styles.trendTextNegative,
      ]}>
        {trend === 'improving' ? 'İyileşiyor' : trend === 'worsening' ? 'Dikkat' : 'Stabil'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SemanticColors.text.primary,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Summary Cards
  summaryScroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    marginRight: Spacing.sm,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  summaryTitle: {
    fontSize: 11,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Chart Card
  chartCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SemanticColors.text.primary,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: SemanticColors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  timeRangeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: SemanticColors.surface.default,
  },
  timeRangeText: {
    fontSize: 11,
    color: SemanticColors.text.tertiary,
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: SemanticColors.text.primary,
  },
  metricSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  chartBar: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: withAlpha(Palette.primary[500], 0.1),
    borderRadius: 2,
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 2,
  },
  chartFooter: {
    alignItems: 'center',
  },
  chartAverage: {
    fontSize: 12,
    color: SemanticColors.text.secondary,
    fontWeight: '600',
  },

  // Section
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },

  // Report Card
  reportCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  reportItem: {
    width: '50%',
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  reportItemValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.primary[500],
  },
  reportItemLabel: {
    fontSize: 12,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: withAlpha(SemanticColors.text.tertiary, 0.1),
  },
  trendPositive: {
    backgroundColor: withAlpha(Palette.success[500], 0.15),
  },
  trendNegative: {
    backgroundColor: withAlpha(Palette.error[500], 0.15),
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: SemanticColors.text.tertiary,
    marginLeft: 2,
  },
  trendTextPositive: {
    color: Palette.success[500],
  },
  trendTextNegative: {
    color: Palette.error[500],
  },
  triggersSection: {
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
  },
  triggersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.sm,
  },
  triggersList: {
    gap: Spacing.xs,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.error[500], 0.1),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  triggerName: {
    fontSize: 13,
    color: SemanticColors.text.primary,
  },
  triggerCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.error[500],
  },
  recommendationsSection: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: SemanticColors.text.primary,
    lineHeight: 18,
  },

  // Analysis Card
  analysisCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  analysisHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successRateContainer: {
    alignItems: 'center',
  },
  successRateValue: {
    fontSize: 48,
    fontWeight: '900',
    color: Palette.success[500],
  },
  successRateLabel: {
    fontSize: 14,
    color: SemanticColors.text.secondary,
  },
  analysisSection: {
    marginBottom: Spacing.lg,
  },
  analysisSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.sm,
  },
  timesList: {
    gap: Spacing.sm,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeHour: {
    width: 50,
    fontSize: 13,
    fontWeight: '600',
    color: SemanticColors.text.primary,
  },
  timeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: withAlpha(Palette.error[500], 0.1),
    borderRadius: 4,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  timeBar: {
    height: '100%',
    backgroundColor: Palette.error[500],
    borderRadius: 4,
  },
  timeCount: {
    width: 30,
    fontSize: 12,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
    textAlign: 'right',
  },
  strategiesList: {
    gap: Spacing.sm,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  strategyName: {
    fontSize: 13,
    color: SemanticColors.text.primary,
    marginBottom: 4,
  },
  strategyBarContainer: {
    height: 6,
    backgroundColor: withAlpha(Palette.success[500], 0.1),
    borderRadius: 3,
    overflow: 'hidden',
  },
  strategyBar: {
    height: '100%',
    backgroundColor: Palette.success[500],
    borderRadius: 3,
  },
  strategyRate: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.success[500],
  },

  // Days Row
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dayCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  bestDayCard: {
    backgroundColor: withAlpha(Palette.success[500], 0.1),
  },
  worstDayCard: {
    backgroundColor: withAlpha(Palette.accent[500], 0.1),
  },
  dayCardIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  dayCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
  },
  dayCardDate: {
    fontSize: 16,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    marginTop: 4,
  },
  dayCardScore: {
    fontSize: 12,
    color: SemanticColors.text.tertiary,
    marginTop: 2,
  },
});




