// Streak Center - Gelişmiş Streak & Rozet Merkezi
// XP, seviyeler, rozetler, günlük görevler

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
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
  getStreak,
  getUserLevel,
  getAchievements,
  getDailyChallenges,
  completeDailyChallenge,
  getRarityColor,
  getRarityGradient,
  Streak,
  UserLevel,
  Achievement,
  DailyChallenge,
} from '../utils/streakSystem';
import { Confetti, CelebrationModal } from '../components/celebrations/ConfettiEffect';
import { ScalePressable } from '../components/interactions';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

export default function StreakCenterScreen() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadData();
    
    // Pulse animation for streak
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (level) {
      Animated.timing(progressAnim, {
        toValue: level.currentXP / level.xpToNextLevel,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [level]);

  const loadData = async () => {
    const [streakData, levelData, achievementsData, challengesData] = await Promise.all([
      getStreak(),
      getUserLevel(),
      getAchievements(),
      getDailyChallenges(),
    ]);
    
    setStreak(streakData);
    setLevel(levelData);
    setAchievements(achievementsData);
    setDailyChallenges(challengesData);
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const xpEarned = await completeDailyChallenge(challengeId);
    
    if (xpEarned > 0) {
      setCelebrationData({
        title: 'Görev Tamamlandı! 🎯',
        subtitle: `+${xpEarned} XP kazandın!`,
        xpEarned,
      });
      setShowCelebration(true);
      loadData();
    }
  };

  const categories = [
    { id: 'all', label: 'Tümü', icon: 'grid' },
    { id: 'streak', label: 'Seri', icon: 'flame' },
    { id: 'health', label: 'Sağlık', icon: 'heart' },
    { id: 'savings', label: 'Tasarruf', icon: 'cash' },
    { id: 'social', label: 'Sosyal', icon: 'people' },
    { id: 'special', label: 'Özel', icon: 'star' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (!streak || !level) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Confetti active={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      <CelebrationModal
        visible={showCelebration && celebrationData}
        type="achievement"
        title={celebrationData?.title || ''}
        subtitle={celebrationData?.subtitle}
        xpEarned={celebrationData?.xpEarned}
        onClose={() => setShowCelebration(false)}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Başarı Merkezi</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Streak Card */}
        <FadeIn delay={100}>
          <Animated.View style={[styles.streakCard, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={['#FF6B6B', '#EE5A5A', '#DC2626']}
              style={styles.streakGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.streakDecor1} />
              <View style={styles.streakDecor2} />
              
              <View style={styles.streakContent}>
                <View style={styles.flameContainer}>
                  <Text style={styles.flameEmoji}>🔥</Text>
                </View>
                <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
                <Text style={styles.streakLabel}>GÜNLÜK SERİ</Text>
                
                <View style={styles.streakStats}>
                  <View style={styles.streakStatItem}>
                    <Text style={styles.streakStatValue}>{streak.longestStreak}</Text>
                    <Text style={styles.streakStatLabel}>En Uzun</Text>
                  </View>
                  <View style={styles.streakStatDivider} />
                  <View style={styles.streakStatItem}>
                    <Text style={styles.streakStatValue}>{streak.totalDays}</Text>
                    <Text style={styles.streakStatLabel}>Toplam Gün</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </FadeIn>

        {/* Level Card */}
        <FadeIn delay={200}>
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeEmoji}>{level.badge}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelNumber}>Seviye {level.level}</Text>
              </View>
              <View style={styles.xpContainer}>
                <Text style={styles.xpText}>{level.currentXP} / {level.xpToNextLevel} XP</Text>
              </View>
            </View>
            
            <View style={styles.xpProgressBar}>
              <Animated.View
                style={[
                  styles.xpProgressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            
            <Text style={styles.xpHint}>
              Sonraki seviyeye {level.xpToNextLevel - level.currentXP} XP kaldı
            </Text>
          </View>
        </FadeIn>

        {/* Daily Challenges */}
        <FadeIn delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Günlük Görevler</Text>
            {dailyChallenges.map((challenge, index) => (
              <ScalePressable
                key={challenge.id}
                style={[
                  styles.challengeCard,
                  challenge.completed && styles.challengeCompleted,
                ]}
                onPress={() => !challenge.completed && handleCompleteChallenge(challenge.id)}
              >
                <View style={styles.challengeIcon}>
                  <Ionicons
                    name={challenge.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={28}
                    color={challenge.completed ? Palette.success[500] : Palette.primary[500]}
                  />
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={[
                    styles.challengeTitle,
                    challenge.completed && styles.challengeTitleCompleted,
                  ]}>
                    {challenge.title}
                  </Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <View style={styles.challengeXP}>
                  <Text style={styles.challengeXPText}>+{challenge.xpReward}</Text>
                  <Text style={styles.challengeXPLabel}>XP</Text>
                </View>
              </ScalePressable>
            ))}
          </View>
        </FadeIn>

        {/* Achievements */}
        <FadeIn delay={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏆 Rozetler</Text>
              <Text style={styles.achievementCount}>
                {unlockedCount} / {achievements.length}
              </Text>
            </View>

            {/* Category Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={selectedCategory === cat.id ? '#fff' : SemanticColors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Achievement Grid */}
            <View style={styles.achievementsGrid}>
              {filteredAchievements.map((achievement) => (
                <ScalePressable
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !achievement.unlocked && styles.achievementLocked,
                  ]}
                >
                  <LinearGradient
                    colors={achievement.unlocked 
                      ? getRarityGradient(achievement.rarity)
                      : ['#374151', '#1F2937']
                    }
                    style={styles.achievementGradient}
                  >
                    <View style={styles.achievementIcon}>
                      <Text style={styles.achievementEmoji}>
                        {achievement.unlocked ? achievement.icon : '🔒'}
                      </Text>
                    </View>
                    <Text style={[
                      styles.achievementName,
                      !achievement.unlocked && styles.achievementNameLocked,
                    ]}>
                      {achievement.name}
                    </Text>
                    <Text style={styles.achievementDesc} numberOfLines={2}>
                      {achievement.description}
                    </Text>
                    
                    {!achievement.unlocked && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarSmall}>
                          <View
                            style={[
                              styles.progressFillSmall,
                              { width: `${(achievement.progress / achievement.requirement) * 100}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {achievement.progress}/{achievement.requirement}
                        </Text>
                      </View>
                    )}
                    
                    <View style={[
                      styles.rarityBadge,
                      { backgroundColor: withAlpha(getRarityColor(achievement.rarity), 0.3) },
                    ]}>
                      <Text style={[styles.rarityText, { color: getRarityColor(achievement.rarity) }]}>
                        {achievement.rarity.toUpperCase()}
                      </Text>
                    </View>
                  </LinearGradient>
                </ScalePressable>
              ))}
            </View>
          </View>
        </FadeIn>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
  placeholder: {
    width: 40,
  },

  // Streak Card
  streakCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  streakGradient: {
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  streakDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: withAlpha('#fff', 0.1),
  },
  streakDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: withAlpha('#fff', 0.08),
  },
  streakContent: {
    alignItems: 'center',
  },
  flameContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: withAlpha('#fff', 0.2),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  flameEmoji: {
    fontSize: 48,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 72,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 3,
    marginBottom: Spacing.lg,
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha('#fff', 0.15),
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  streakStatItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  streakStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  streakStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  streakStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: withAlpha('#fff', 0.3),
  },

  // Level Card
  levelCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: withAlpha(Palette.purple[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeEmoji: {
    fontSize: 28,
  },
  levelInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SemanticColors.text.primary,
  },
  levelNumber: {
    fontSize: 14,
    color: Palette.purple[500],
    fontWeight: '600',
  },
  xpContainer: {
    backgroundColor: withAlpha(Palette.purple[500], 0.15),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.purple[500],
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: withAlpha(Palette.purple[500], 0.2),
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: Palette.purple[500],
    borderRadius: 4,
  },
  xpHint: {
    fontSize: 12,
    color: SemanticColors.text.tertiary,
    textAlign: 'center',
  },

  // Section
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  achievementCount: {
    fontSize: 14,
    color: SemanticColors.text.secondary,
    fontWeight: '600',
  },

  // Daily Challenges
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  challengeCompleted: {
    backgroundColor: withAlpha(Palette.success[500], 0.1),
    borderColor: withAlpha(Palette.success[500], 0.3),
  },
  challengeIcon: {
    marginRight: Spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SemanticColors.text.primary,
    marginBottom: 2,
  },
  challengeTitleCompleted: {
    textDecorationLine: 'line-through',
    color: SemanticColors.text.tertiary,
  },
  challengeDescription: {
    fontSize: 13,
    color: SemanticColors.text.secondary,
  },
  challengeXP: {
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  challengeXPText: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.accent[500],
  },
  challengeXPLabel: {
    fontSize: 10,
    color: Palette.accent[500],
    fontWeight: '600',
  },

  // Categories
  categoriesScroll: {
    marginBottom: Spacing.md,
    marginLeft: -Spacing.lg,
    marginRight: -Spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.default,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  categoryChipActive: {
    backgroundColor: Palette.primary[500],
    borderColor: Palette.primary[500],
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },

  // Achievements Grid
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  achievementLocked: {
    opacity: 0.7,
  },
  achievementGradient: {
    padding: Spacing.md,
    minHeight: 160,
    position: 'relative',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withAlpha('#fff', 0.2),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: 'rgba(255,255,255,0.7)',
  },
  achievementDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBarSmall: {
    height: 4,
    backgroundColor: withAlpha('#fff', 0.2),
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  rarityBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '800',
  },
});




