import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors, { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../../constants/DesignTokens';
import { healthMilestones, achievements } from '../../constants/Data';
import { ScalePressable } from '../../components/interactions';
import { FadeIn } from '../../components/animations';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [quitDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barAnims = useRef([...Array(7)].map(() => new Animated.Value(0))).current;
  
  // Calculations
  const getTimeSinceQuit = () => {
    const now = new Date();
    const diff = now.getTime() - quitDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysSinceQuit = getTimeSinceQuit();
  const cigarettesNotSmoked = daysSinceQuit * 20;
  const moneySaved = daysSinceQuit * 50;
  const timeSaved = daysSinceQuit * 10;
  const tarNotInhaled = (cigarettesNotSmoked * 10).toFixed(0);

  // Weekly data
  const weeklyData = [
    { day: 'Pzt', value: 85 },
    { day: 'Sal', value: 90 },
    { day: 'Çar', value: 75 },
    { day: 'Per', value: 95 },
    { day: 'Cum', value: 88 },
    { day: 'Cmt', value: 100 },
    { day: 'Paz', value: 92 },
  ];

  const maxValue = Math.max(...weeklyData.map(d => d.value));

  useEffect(() => {
    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();

    // Rotating ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bar animations
    barAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: weeklyData[index].value / maxValue,
        duration: 1000,
        delay: index * 100,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
    });
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
            <View>
              <Text style={styles.title}>📊 İstatistikler</Text>
              <Text style={styles.subtitle}>İlerlemenizi takip edin</Text>
            </View>
            <ScalePressable 
              onPress={() => router.push('/weeklyReport')}
              haptic="light"
            >
              <LinearGradient
                colors={Gradients.primary as [string, string]}
                style={styles.reportBtn}
              >
                <Ionicons name="document-text" size={20} color="#fff" />
              </LinearGradient>
            </ScalePressable>
          </View>
        </FadeIn>

        {/* Main Stats Card */}
        <FadeIn delay={100}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient
              colors={Gradients.primaryVibrant as [string, string, string]}
              style={styles.mainCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Rotating decorative ring */}
              <Animated.View style={[styles.decorRing, { transform: [{ rotate: spin }] }]}>
                {[...Array(8)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.ringDot,
                      { transform: [{ rotate: `${i * 45}deg` }, { translateY: -60 }] }
                    ]}
                  />
                ))}
              </Animated.View>

              <View style={styles.mainCardContent}>
                <View style={styles.progressRing}>
                  <Text style={styles.progressNumber}>{daysSinceQuit}</Text>
                  <Text style={styles.progressLabel}>GÜN</Text>
                </View>
                <View style={styles.mainStats}>
                  <View style={styles.mainStatItem}>
                    <Ionicons name="ban-outline" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.mainStatValue}>{cigarettesNotSmoked}</Text>
                    <Text style={styles.mainStatLabel}>sigara içilmedi</Text>
                  </View>
                  <View style={styles.mainStatItem}>
                    <Ionicons name="cash-outline" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.mainStatValue}>₺{moneySaved}</Text>
                    <Text style={styles.mainStatLabel}>tasarruf edildi</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </FadeIn>

        {/* Weekly Chart */}
        <FadeIn delay={200}>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>📈 Haftalık Performans</Text>
              <TouchableOpacity 
                style={styles.chartBtn}
                onPress={() => router.push('/weeklyReport')}
              >
                <Text style={styles.chartBtnText}>Detay</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.chartSubtitle}>Motivasyon seviyeniz</Text>
            <View style={styles.chart}>
              {weeklyData.map((item, index) => (
                <View key={item.day} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <Animated.View style={[styles.barBg]}>
                      <Animated.View
                        style={[
                          styles.bar,
                          {
                            height: barAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={Gradients.primary as [string, string]}
                          style={styles.barGradient}
                        />
                      </Animated.View>
                    </Animated.View>
                  </View>
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeIn>

        {/* Detailed Stats */}
        <FadeIn delay={300}>
          <Text style={styles.sectionTitle}>💪 Detaylı Başarılar</Text>
          <View style={styles.statsGrid}>
            <ScalePressable style={styles.detailCard} onPress={() => router.push('/sleepTracker')}>
              <LinearGradient
                colors={Gradients.info as [string, string]}
                style={styles.detailIcon}
              >
                <Ionicons name="time-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.detailValue}>{Math.floor(timeSaved / 60)}s {timeSaved % 60}dk</Text>
              <Text style={styles.detailLabel}>Kazanılan Zaman</Text>
              <Text style={styles.detailDescription}>Sigara içmeden geçirilen süre</Text>
            </ScalePressable>

            <ScalePressable style={styles.detailCard} onPress={() => router.push('/healthDiary')}>
              <LinearGradient
                colors={Gradients.error as [string, string]}
                style={styles.detailIcon}
              >
                <Ionicons name="heart-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.detailValue}>{tarNotInhaled}mg</Text>
              <Text style={styles.detailLabel}>Alınmayan Katran</Text>
              <Text style={styles.detailDescription}>Akciğerlerinize girmeyen zehir</Text>
            </ScalePressable>

            <ScalePressable style={styles.detailCard} onPress={() => router.push('/healthDiary')}>
              <LinearGradient
                colors={Gradients.success as [string, string]}
                style={styles.detailIcon}
              >
                <Ionicons name="pulse-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.detailValue}>+15%</Text>
              <Text style={styles.detailLabel}>Oksijen Seviyesi</Text>
              <Text style={styles.detailDescription}>Kandaki oksijen artışı</Text>
            </ScalePressable>

            <ScalePressable style={styles.detailCard} onPress={() => router.push('/breathingExercise')}>
              <LinearGradient
                colors={Gradients.ocean as [string, string]}
                style={styles.detailIcon}
              >
                <Ionicons name="fitness-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.detailValue}>+8%</Text>
              <Text style={styles.detailLabel}>Akciğer Kapasitesi</Text>
              <Text style={styles.detailDescription}>Nefes alma kapasitesi</Text>
            </ScalePressable>
          </View>
        </FadeIn>

        {/* Health Timeline */}
        <FadeIn delay={400}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❤️ Sağlık İyileşmesi</Text>
            <TouchableOpacity onPress={() => router.push('/health')}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeline}>
            {healthMilestones.slice(0, 4).map((milestone, index) => {
              const isCompleted = index < 2;
              const isActive = index === 2;
              
              return (
                <View key={milestone.id} style={styles.timelineItem}>
                  <View style={styles.timelineLine}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: isCompleted ? Palette.success[500] : isActive ? Palette.accent[500] : SemanticColors.text.tertiary },
                      ]}
                    >
                      {isCompleted && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                    {index < 3 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          { backgroundColor: isCompleted ? withAlpha(Palette.success[500], 0.3) : SemanticColors.border.subtle },
                        ]}
                      />
                    )}
                  </View>
                  <View style={[
                    styles.timelineContent,
                    isActive && styles.timelineContentActive,
                  ]}>
                    <Text style={[styles.timelineTime, { color: milestone.color }]}>
                      {milestone.time}
                    </Text>
                    <Text style={styles.timelineTitle}>{milestone.title}</Text>
                    <Text style={styles.timelineDescription} numberOfLines={2}>
                      {milestone.description}
                    </Text>
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={Palette.success[500]} />
                        <Text style={styles.completedText}>Tamamlandı</Text>
                      </View>
                    )}
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Ionicons name="time" size={14} color={Palette.accent[500]} />
                        <Text style={styles.activeText}>Devam ediyor</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </FadeIn>

        {/* Achievements Preview */}
        <FadeIn delay={500}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Rozetleriniz</Text>
            <TouchableOpacity onPress={() => router.push('/gamification')}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}
          >
            {achievements.slice(0, 5).map((achievement) => {
              const isEarned = daysSinceQuit >= achievement.requiredDays;
              
              return (
                <ScalePressable
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !isEarned && styles.achievementCardLocked,
                  ]}
                  onPress={() => router.push('/gamification')}
                >
                  <View
                    style={[
                      styles.achievementIcon,
                      { backgroundColor: isEarned ? withAlpha(achievement.color, 0.2) : SemanticColors.background.tertiary },
                    ]}
                  >
                    <Ionicons
                      name={achievement.icon as any}
                      size={32}
                      color={isEarned ? achievement.color : SemanticColors.text.tertiary}
                    />
                    {!isEarned && (
                      <View style={styles.lockIcon}>
                        <Ionicons name="lock-closed" size={12} color={SemanticColors.text.tertiary} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.achievementTitle, !isEarned && styles.textMuted]}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription} numberOfLines={2}>
                    {achievement.description}
                  </Text>
                  {isEarned ? (
                    <View style={styles.earnedBadge}>
                      <Ionicons name="checkmark" size={12} color={Palette.success[500]} />
                      <Text style={styles.earnedText}>Kazanıldı</Text>
                    </View>
                  ) : (
                    <Text style={styles.remainingDays}>
                      {achievement.requiredDays - daysSinceQuit} gün kaldı
                    </Text>
                  )}
                </ScalePressable>
              );
            })}
          </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.heading.h2,
    color: SemanticColors.text.primary,
  },
  subtitle: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    marginTop: Spacing.xs,
  },
  reportBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
  },
  mainCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.primary,
  },
  decorRing: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: withAlpha('#fff', 0.3),
  },
  mainCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
  mainStats: {
    flex: 1,
    marginLeft: Spacing.xl,
    gap: Spacing.md,
  },
  mainStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mainStatValue: {
    ...Typography.stat.small,
    color: '#fff',
  },
  mainStatLabel: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  chartCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    ...Typography.label.large,
    color: SemanticColors.text.primary,
  },
  chartBtn: {
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  chartBtnText: {
    ...Typography.caption.medium,
    color: Palette.primary[500],
    fontWeight: '600',
  },
  chartSubtitle: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: 28,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
  },
  barBg: {
    flex: 1,
    backgroundColor: SemanticColors.background.tertiary,
    borderRadius: 14,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  barGradient: {
    flex: 1,
    borderRadius: 14,
  },
  barLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.secondary,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.label.small,
    color: Palette.primary[500],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  detailCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  detailValue: {
    ...Typography.stat.small,
    color: SemanticColors.text.primary,
    marginBottom: 4,
  },
  detailLabel: {
    ...Typography.label.small,
    color: SemanticColors.text.primary,
    marginBottom: 4,
  },
  detailDescription: {
    ...Typography.caption.small,
    color: SemanticColors.text.secondary,
    lineHeight: 16,
  },
  timeline: {
    marginBottom: Spacing.xl,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 90,
  },
  timelineLine: {
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
  timelineConnector: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  timelineContentActive: {
    borderColor: Palette.accent[500],
    borderWidth: 2,
  },
  timelineTime: {
    ...Typography.caption.large,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: 4,
  },
  timelineDescription: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    ...Typography.caption.small,
    color: Palette.success[500],
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeText: {
    ...Typography.caption.small,
    color: Palette.accent[500],
    fontWeight: '600',
  },
  achievementsContainer: {
    paddingBottom: Spacing.sm,
  },
  achievementCard: {
    width: 140,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  lockIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementTitle: {
    ...Typography.label.small,
    color: SemanticColors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    ...Typography.caption.small,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  textMuted: {
    color: SemanticColors.text.tertiary,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withAlpha(Palette.success[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  earnedText: {
    ...Typography.caption.small,
    color: Palette.success[500],
    fontWeight: '600',
  },
  remainingDays: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
    fontWeight: '500',
  },
});
