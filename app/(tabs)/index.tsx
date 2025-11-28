// Engaging Homepage - Modern, Gamified, User-Centric Design
// Kullanıcıyı bağlayan ve tutan modern anasayfa

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Constants
import { 
  SemanticColors, 
  Palette, 
  Gradients, 
  withAlpha 
} from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../../constants/DesignTokens';
import { motivationalQuotes, healthMilestones } from '../../constants/Data';

// Store
import { useUserStore } from '../../store/userStore';
import { useStoryStore } from '../../store/storyStore';
import { useAchievementStore } from '../../store/achievementStore';

// Utils
import { 
  calculateTimeSinceQuit, 
  calculateMoneySaved, 
  calculateCigarettesAvoided,
  calculateLifeRegained,
  getComparisonStats,
} from '../../utils/gamification';
import { getPersonalizedGreeting, getTimeIcon } from '../../utils/timeGreeting';

// Components
import { ScalePressable, triggerHaptic } from '../../components/interactions';
import { LiveCounter } from '../../components/counters';
import { StreakIndicator, LevelProgress, DailyTasks, XPToast } from '../../components/gamification';
import { StoryCircles, StoryViewer } from '../../components/stories';
import { TodayWinsCard, ComparisonCard, SurpriseGiftCard, LimitedTaskCard, generateRandomGift } from '../../components/cards';
import { FloatingActionButton } from '../../components/actions';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.42;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  // Store state
  const { 
    profile, 
    xp, 
    level, 
    streak,
    dailyTasks, 
    limitedTask,
    availableGift,
    completeTask,
    completeLimitedTask,
    claimDailyGift,
    generateLimitedTask,
    checkAndUpdateStreak,
    addXP,
  } = useUserStore();
  
  const {
    categories,
    viewedStoryIds,
    isViewerOpen,
    openStoryViewer,
    closeStoryViewer,
    nextContent,
    previousContent,
    getCurrentStory,
    getUnviewedCount,
  } = useStoryStore();

  const { checkAchievements } = useAchievementStore();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [showXPToast, setShowXPToast] = useState(false);
  const [xpToastAmount, setXPToastAmount] = useState(0);
  
  // Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroScrollRef = useRef<ScrollView>(null);

  // Calculations
  const quitDate = new Date(profile.quitDate);
  const timeSinceQuit = calculateTimeSinceQuit(quitDate);
  const moneySaved = calculateMoneySaved(
    timeSinceQuit.days,
    profile.cigarettesPerDay,
    profile.pricePerPack,
    profile.cigarettesPerPack
  );
  const cigarettesAvoided = calculateCigarettesAvoided(timeSinceQuit.days, profile.cigarettesPerDay);
  const lifeRegained = calculateLifeRegained(cigarettesAvoided);
  const comparisonStats = getComparisonStats(
    timeSinceQuit.days,
    profile.cigarettesPerDay,
    profile.pricePerPack,
    profile.cigarettesPerPack,
    streak
  );

  // Greeting
  const greeting = getPersonalizedGreeting(profile.name, timeSinceQuit.days);
  const timeIcon = getTimeIcon();

  // Effects
  useEffect(() => {
    // Check and update streak on mount
    checkAndUpdateStreak();
    
    // Generate limited task if none exists
    if (!limitedTask) {
      generateLimitedTask();
    }

    // Quote rotation
    const quoteInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCurrentQuote(motivationalQuotes[randomIndex]);
    }, 30000);

    return () => clearInterval(quoteInterval);
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Refresh data
    checkAndUpdateStreak();
    if (!limitedTask || new Date(limitedTask.expiresAt) < new Date()) {
      generateLimitedTask();
    }
    
    setTimeout(() => setRefreshing(false), 1000);
  }, [limitedTask]);

  const handleTaskComplete = useCallback((taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      completeTask(taskId);
      setXPToastAmount(task.xpReward);
      setShowXPToast(true);

      // Check achievements
      const totalCompletedTasks = dailyTasks.filter(t => t.completed).length + 1;
      checkAchievements({
        days: timeSinceQuit.days,
        xp: xp + task.xpReward,
        level,
        tasks: totalCompletedTasks,
      });
    }
  }, [dailyTasks, xp, level, timeSinceQuit.days]);

  const handleGiftClaim = useCallback(() => {
    claimDailyGift();
    return generateRandomGift();
  }, []);

  const handleHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== activeHeroIndex) {
      setActiveHeroIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Get unviewed story counts
  const unviewedCounts: Record<string, number> = {};
  categories.forEach(cat => {
    unviewedCounts[cat.id] = getUnviewedCount(cat.id);
  });
  const viewedCategories = categories
    .filter(cat => getUnviewedCount(cat.id) === 0)
    .map(cat => cat.id);

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* XP Toast */}
      <XPToast
        amount={xpToastAmount}
        visible={showXPToast}
        onComplete={() => setShowXPToast(false)}
      />

      {/* Story Viewer */}
      <StoryViewer
        visible={isViewerOpen}
        story={getCurrentStory()}
        currentContentIndex={useStoryStore.getState().currentContentIndex}
        onClose={closeStoryViewer}
        onNext={nextContent}
        onPrevious={previousContent}
      />

      {/* Glassmorphic Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['rgba(15,23,42,0.95)', 'rgba(15,23,42,0.8)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            {/* Left - Logo & Level */}
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Ionicons name="leaf" size={24} color={Palette.primary[500]} />
            </View>
              <LevelProgress xp={xp} level={level} compact />
            </View>

            {/* Right - Actions */}
            <View style={styles.headerRight}>
              {/* SOS Button */}
              <ScalePressable
                onPress={() => router.push('/crisis')}
                haptic="heavy"
              >
                <View style={styles.sosButton}>
                    <Text style={styles.sosText}>SOS</Text>
                </View>
              </ScalePressable>

              {/* Profile */}
              <ScalePressable onPress={() => router.push('/profile')}>
                <View style={styles.profileButton}>
                  <Text style={styles.profileInitial}>
                    {profile.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </ScalePressable>
                  </View>
              </View>
            </LinearGradient>
          </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.primary[500]}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ScrollView
            ref={heroScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleHeroScroll}
            decelerationRate="fast"
          >
            {/* Hero Card 1: Live Counter */}
            <View style={styles.heroCard}>
                <LinearGradient
                colors={Gradients.hero as unknown as [string, string, ...string[]]}
                style={styles.heroGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                <View style={styles.heroContent}>
                  <Text style={styles.heroGreeting}>{greeting.emoji} {greeting.title}</Text>
                  <Text style={styles.heroSubtitle}>{greeting.subtitle}</Text>
                  
                  <View style={styles.heroCounter}>
                    <LiveCounter quitDate={quitDate} size="hero" showSeconds={false} />
                    </View>

            <ScalePressable 
                    onPress={() => router.push('/stats')}
                    style={styles.heroCTA}
                  >
                    <Text style={styles.heroCTAText}>İstatistiklerimi Gör</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
            </ScalePressable>
                </View>
              </LinearGradient>
            </View>

            {/* Hero Card 2: Today's Motivation */}
            <View style={styles.heroCard}>
              <LinearGradient
                colors={Gradients.accent as unknown as [string, string]}
                style={styles.heroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroContent}>
                  <Text style={styles.heroLabel}>✨ Günün Motivasyonu</Text>
                  <Text style={styles.heroQuote}>"{currentQuote.quote}"</Text>
                  <Text style={styles.heroAuthor}>— {currentQuote.author}</Text>
            
            <ScalePressable 
                    onPress={() => router.push('/journal')}
                    style={styles.heroCTA}
                  >
                    <Text style={styles.heroCTAText}>Düşüncelerimi Yaz</Text>
                    <Ionicons name="create-outline" size={18} color="#fff" />
            </ScalePressable>
          </View>
              </LinearGradient>
            </View>

            {/* Hero Card 3: Health Progress */}
            <View style={styles.heroCard}>
                <LinearGradient
                colors={Gradients.success as unknown as [string, string]}
                style={styles.heroGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                <View style={styles.heroContent}>
                  <Text style={styles.heroLabel}>❤️ Sağlık İyileşmen</Text>
                  <View style={styles.healthStats}>
                    <View style={styles.healthStat}>
                      <Text style={styles.healthValue}>{cigarettesAvoided}</Text>
                      <Text style={styles.healthLabel}>Sigara İçilmedi</Text>
                    </View>
                    <View style={styles.healthDivider} />
                    <View style={styles.healthStat}>
                      <Text style={styles.healthValue}>{lifeRegained.hours}s</Text>
                      <Text style={styles.healthLabel}>Hayat Kazandın</Text>
                  </View>
          </View>

          <ScalePressable 
                    onPress={() => router.push('/health')}
                    style={styles.heroCTA}
            >
                    <Text style={styles.heroCTAText}>Sağlık Raporumu Gör</Text>
                    <Ionicons name="heart-outline" size={18} color="#fff" />
                  </ScalePressable>
                </View>
              </LinearGradient>
                </View>
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeHeroIndex === index && styles.dotActive,
                ]}
              />
            ))}
              </View>
        </View>

        {/* Stories */}
        <View style={styles.section}>
          <StoryCircles
            categories={categories}
            viewedCategories={viewedCategories}
            unviewedCounts={unviewedCounts}
            onCategoryPress={openStoryViewer}
          />
              </View>

        {/* Streak Indicator */}
        <View style={styles.section}>
          <StreakIndicator streak={streak} showMilestone />
            </View>

        {/* Daily Tasks */}
        <View style={styles.section}>
          <DailyTasks
            tasks={dailyTasks}
            onCompleteTask={handleTaskComplete}
            compact
          />
          </View>

        {/* Limited Task (FOMO) */}
        {limitedTask && !limitedTask.completed && (
          <View style={styles.section}>
            <LimitedTaskCard
              task={limitedTask}
              onStart={() => {
                // Navigate to appropriate task
                router.push('/breathingExercise');
              }}
              onComplete={completeLimitedTask}
            />
          </View>
        )}

        {/* Today's Wins */}
        <View style={styles.section}>
          <TodayWinsCard
            moneySaved={moneySaved}
            cigarettesAvoided={cigarettesAvoided}
            healthImprovement={Math.min(Math.round(timeSinceQuit.days * 0.5), 100)}
            timeSaved={{ hours: lifeRegained.hours, minutes: lifeRegained.minutes % 60 }}
            onPress={() => router.push('/stats')}
          />
                  </View>

        {/* Comparison Card */}
        <View style={styles.section}>
          <ComparisonCard
            items={[
              {
                label: 'Tasarruf',
                yourValue: comparisonStats.moneySaved,
                avgValue: comparisonStats.avgMoneySaved,
                format: 'currency',
                icon: 'cash-outline',
              },
              {
                label: 'İçilmeyen Sigara',
                yourValue: comparisonStats.cigarettesAvoided,
                avgValue: comparisonStats.avgCigarettesAvoided,
                format: 'number',
                icon: 'ban-outline',
              },
            ]}
            percentBetter={comparisonStats.percentBetter}
            onPress={() => router.push('/stats')}
          />
                  </View>

        {/* Surprise Gift */}
        {availableGift && (
          <View style={styles.section}>
            <SurpriseGiftCard
              isAvailable={availableGift}
              onClaim={handleGiftClaim}
            />
                </View>
        )}

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          <View style={styles.quickActions}>
            {[
              { icon: 'fitness-outline', label: 'Nefes', color: Palette.success[500], route: '/breathingExercise' },
              { icon: 'book-outline', label: 'Günlük', color: Palette.accent[500], route: '/journal' },
              { icon: 'sparkles-outline', label: 'AI Koç', color: Palette.primary[500], route: '/aiCoach' },
              { icon: 'trophy-outline', label: 'Başarılar', color: Palette.warning[500], route: '/gamification' },
            ].map((action) => (
              <ScalePressable
                key={action.label}
                onPress={() => router.push(action.route as any)}
                style={styles.quickAction}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: withAlpha(action.color, 0.15) }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </ScalePressable>
            ))}
          </View>
        </View>

        {/* Health Milestones Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sağlık İlerlemesi</Text>
            <ScalePressable onPress={() => router.push('/health')}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </ScalePressable>
                </View>
          <View style={styles.milestonesList}>
            {healthMilestones.slice(0, 3).map((milestone, index) => (
              <View key={milestone.id} style={styles.milestoneItem}>
                <View style={[styles.milestoneIcon, { backgroundColor: withAlpha(milestone.color, 0.15) }]}>
                  <Ionicons name={milestone.icon as any} size={20} color={milestone.color} />
              </View>
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneTime}>{milestone.time}</Text>
          </View>
                <Ionicons 
                  name={index === 0 ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={index === 0 ? Palette.success[500] : SemanticColors.text.tertiary} 
                />
              </View>
            ))}
          </View>
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: ComponentHeight.tabBar + Spacing.xl }} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sosButton: {
    backgroundColor: Palette.warning[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  sosText: {
    ...Typography.label.small,
    color: '#000',
    fontWeight: '800',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.accent[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    ...Typography.label.medium,
    color: '#fff',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
  },
  heroSection: {
    marginBottom: Spacing.lg,
  },
  heroCard: {
    width,
    height: HERO_HEIGHT,
    paddingHorizontal: Spacing.lg,
  },
  heroGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroGreeting: {
    ...Typography.heading.h4,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body.small,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.lg,
  },
  heroCounter: {
    marginBottom: Spacing.xl,
  },
  heroLabel: {
    ...Typography.overline,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
  },
  heroQuote: {
    ...Typography.body.large,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  heroAuthor: {
    ...Typography.caption.large,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.xl,
  },
  healthStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  healthStat: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  healthValue: {
    ...Typography.stat.large,
    color: '#fff',
  },
  healthLabel: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  healthDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  heroCTAText: {
    ...Typography.button.medium,
    color: '#fff',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: withAlpha(Palette.primary[500], 0.3),
  },
  dotActive: {
    width: 24,
    backgroundColor: Palette.primary[500],
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading.h5,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.caption.large,
    color: Palette.primary[500],
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: (width - Spacing.lg * 2 - Spacing.md * 3) / 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
  },
  milestonesList: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.md,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  milestoneTime: {
    ...Typography.caption.small,
    color: SemanticColors.text.secondary,
  },
});
