import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

interface SleepData {
  date: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes?: string;
}

const weeklyData: SleepData[] = [
  { date: 'Pzt', sleepTime: '23:30', wakeTime: '07:00', duration: 7.5, quality: 85 },
  { date: 'Sal', sleepTime: '00:15', wakeTime: '07:30', duration: 7.25, quality: 72 },
  { date: 'Çar', sleepTime: '23:00', wakeTime: '06:45', duration: 7.75, quality: 90 },
  { date: 'Per', sleepTime: '23:45', wakeTime: '07:15', duration: 7.5, quality: 78 },
  { date: 'Cum', sleepTime: '00:30', wakeTime: '08:00', duration: 7.5, quality: 68 },
  { date: 'Cmt', sleepTime: '01:00', wakeTime: '09:30', duration: 8.5, quality: 82 },
  { date: 'Paz', sleepTime: '23:15', wakeTime: '07:00', duration: 7.75, quality: 88 },
];

const sleepTips = [
  {
    id: '1',
    icon: 'moon',
    title: 'Düzenli Uyku Saati',
    description: 'Her gün aynı saatte yatıp kalkmak uyku kalitenizi artırır.',
  },
  {
    id: '2',
    icon: 'phone-portrait',
    title: 'Ekranlardan Uzak Dur',
    description: 'Yatmadan 1 saat önce telefon ve bilgisayar kullanımını bırakın.',
  },
  {
    id: '3',
    icon: 'cafe',
    title: 'Kafein Kontrolü',
    description: 'Öğleden sonra kafeinli içeceklerden kaçının.',
  },
];

export default function SleepTrackerScreen() {
  const [selectedDay, setSelectedDay] = useState(6);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;

  const averageDuration = weeklyData.reduce((a, b) => a + b.duration, 0) / weeklyData.length;
  const averageQuality = Math.round(weeklyData.reduce((a, b) => a + b.quality, 0) / weeklyData.length);
  const todayData = weeklyData[selectedDay];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: todayData.quality / 100,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(starAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(starAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [selectedDay]);

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return Palette.success[500];
    if (quality >= 60) return Palette.accent[500];
    return Palette.error[500];
  };

  const getQualityText = (quality: number) => {
    if (quality >= 80) return 'Mükemmel';
    if (quality >= 60) return 'İyi';
    return 'Geliştirilebilir';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <FadeIn delay={0}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>😴 Uyku Takibi</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color={SemanticColors.text.primary} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Main Sleep Card */}
        <FadeIn delay={100}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460'] as [string, string, string]}
            style={styles.mainCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Stars decoration */}
            {[...Array(12)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.star,
                  {
                    left: `${8 + (i * 8)}%`,
                    top: `${10 + ((i % 4) * 15)}%`,
                    opacity: starAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.8],
                    }),
                    transform: [{
                      scale: starAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    }],
                  },
                ]}
              >
                <Ionicons name="star" size={8 + (i % 3) * 4} color="#fff" />
              </Animated.View>
            ))}

            <View style={styles.moonContainer}>
              <View style={styles.moon}>
                <Ionicons name="moon" size={48} color="#FFE66D" />
              </View>
            </View>

            <View style={styles.sleepInfo}>
              <Text style={styles.sleepLabel}>Dün Gece Uyku</Text>
              <Text style={styles.sleepDuration}>
                {Math.floor(todayData.duration)}s {Math.round((todayData.duration % 1) * 60)}dk
              </Text>
              <View style={styles.sleepTimes}>
                <View style={styles.timeItem}>
                  <Ionicons name="bed" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.timeText}>{todayData.sleepTime}</Text>
                </View>
                <View style={styles.timeDivider} />
                <View style={styles.timeItem}>
                  <Ionicons name="sunny" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.timeText}>{todayData.wakeTime}</Text>
                </View>
              </View>
            </View>

            {/* Quality Circle */}
            <View style={styles.qualityContainer}>
              <View style={styles.qualityCircle}>
                <Animated.View
                  style={[
                    styles.qualityProgress,
                    {
                      transform: [{
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      }],
                    },
                  ]}
                />
                <View style={styles.qualityInner}>
                  <Text style={styles.qualityValue}>{todayData.quality}%</Text>
                  <Text style={styles.qualityLabel}>Kalite</Text>
                </View>
              </View>
              <Text style={[styles.qualityText, { color: getQualityColor(todayData.quality) }]}>
                {getQualityText(todayData.quality)}
              </Text>
            </View>
          </LinearGradient>
        </FadeIn>

        {/* Weekly Chart */}
        <FadeIn delay={200}>
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>📊 Haftalık Özet</Text>
            <View style={styles.chart}>
              {weeklyData.map((day, index) => {
                const isSelected = index === selectedDay;
                const barHeight = (day.quality / 100) * 100;
                
                return (
                  <TouchableOpacity
                    key={day.date}
                    style={styles.barContainer}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDay(index);
                    }}
                  >
                    <View style={styles.barWrapper}>
                      <LinearGradient
                        colors={isSelected 
                          ? Gradients.primary as [string, string]
                          : [withAlpha(Palette.primary[500], 0.3), withAlpha(Palette.primary[500], 0.5)]
                        }
                        style={[styles.bar, { height: `${barHeight}%` }]}
                      />
                    </View>
                    <Text style={[
                      styles.barLabel,
                      isSelected && styles.barLabelActive,
                    ]}>
                      {day.date}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Palette.primary[500] }]} />
                <Text style={styles.legendText}>Uyku Kalitesi</Text>
              </View>
              <Text style={styles.legendValue}>Ort: {averageQuality}%</Text>
            </View>
          </View>
        </FadeIn>

        {/* Stats Grid */}
        <FadeIn delay={300}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: withAlpha(Palette.info[500], 0.15) }]}>
                <Ionicons name="time" size={24} color={Palette.info[500]} />
              </View>
              <Text style={styles.statValue}>{averageDuration.toFixed(1)}s</Text>
              <Text style={styles.statLabel}>Ort. Süre</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: withAlpha(Palette.success[500], 0.15) }]}>
                <Ionicons name="trending-up" size={24} color={Palette.success[500]} />
              </View>
              <Text style={styles.statValue}>+12%</Text>
              <Text style={styles.statLabel}>Bu Hafta</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: withAlpha(Palette.purple[500], 0.15) }]}>
                <Ionicons name="calendar" size={24} color={Palette.purple[500]} />
              </View>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Gün Seri</Text>
            </View>
          </View>
        </FadeIn>

        {/* Sigara & Uyku Bağlantısı */}
        <FadeIn delay={350}>
          <View style={styles.connectionCard}>
            <LinearGradient
              colors={[withAlpha(Palette.success[500], 0.15), withAlpha(Palette.success[500], 0.05)]}
              style={styles.connectionGradient}
            >
              <View style={styles.connectionIcon}>
                <Ionicons name="sparkles" size={24} color={Palette.success[500]} />
              </View>
              <View style={styles.connectionContent}>
                <Text style={styles.connectionTitle}>Uyku Kaliten Artıyor! 🎉</Text>
                <Text style={styles.connectionText}>
                  Sigarayı bıraktığından beri uyku kaliten %23 arttı. Nikotin olmadan vücudun daha iyi dinleniyor.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </FadeIn>

        {/* Sleep Tips */}
        <FadeIn delay={400}>
          <Text style={styles.sectionTitle}>💡 Uyku İpuçları</Text>
          <View style={styles.tipsContainer}>
            {sleepTips.map((tip) => (
              <ScalePressable key={tip.id} style={styles.tipCard} scaleValue={0.98}>
                <View style={styles.tipIcon}>
                  <Ionicons name={tip.icon as any} size={24} color={Palette.primary[500]} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDescription}>{tip.description}</Text>
                </View>
              </ScalePressable>
            ))}
          </View>
        </FadeIn>

        <View style={{ height: ComponentHeight.tabBar + 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading.h3,
    color: SemanticColors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
    ...Shadows.lg,
  },
  star: {
    position: 'absolute',
  },
  moonContainer: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  moon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: withAlpha('#FFE66D', 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepInfo: {
    marginTop: Spacing.md,
  },
  sleepLabel: {
    ...Typography.label.medium,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.xs,
  },
  sleepDuration: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: Spacing.md,
  },
  sleepTimes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeText: {
    ...Typography.label.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  timeDivider: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: Spacing.md,
  },
  qualityContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'center',
  },
  qualityCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  qualityProgress: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Palette.success[500],
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  qualityInner: {
    alignItems: 'center',
  },
  qualityValue: {
    ...Typography.stat.small,
    color: '#fff',
  },
  qualityLabel: {
    ...Typography.caption.small,
    color: 'rgba(255,255,255,0.6)',
  },
  qualityText: {
    ...Typography.label.small,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: 28,
    height: 100,
    backgroundColor: SemanticColors.background.tertiary,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 14,
  },
  barLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
    marginTop: Spacing.sm,
  },
  barLabelActive: {
    color: Palette.primary[500],
    fontWeight: '600',
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.primary[500],
    marginTop: Spacing.xs,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
  },
  legendValue: {
    ...Typography.label.small,
    color: Palette.primary[500],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.stat.small,
    color: SemanticColors.text.primary,
  },
  statLabel: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  connectionCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: withAlpha(Palette.success[500], 0.2),
  },
  connectionGradient: {
    flexDirection: 'row',
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  connectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withAlpha(Palette.success[500], 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionContent: {
    flex: 1,
  },
  connectionTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  connectionText: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    lineHeight: 20,
  },
  tipsContainer: {
    gap: Spacing.sm,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: 2,
  },
  tipDescription: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    lineHeight: 18,
  },
});

