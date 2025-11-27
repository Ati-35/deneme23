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
import Colors, { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';

const { width } = Dimensions.get('window');

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: readonly string[];
  earned: boolean;
  earnedDate?: Date;
  requirement: string;
  xp: number;
}

const badges: Badge[] = [
  {
    id: '1',
    name: 'İlk Adım',
    description: 'Sigarayı bırakma yolculuğuna başladın',
    icon: 'footsteps',
    color: Palette.primary[500],
    gradient: Gradients.primary,
    earned: true,
    earnedDate: new Date(Date.now() - 86400000 * 7),
    requirement: 'Uygulamayı indir',
    xp: 50,
  },
  {
    id: '2',
    name: 'Bir Gün Şampiyonu',
    description: '24 saat sigarasız!',
    icon: 'sunny',
    color: Palette.accent[500],
    gradient: Gradients.accent,
    earned: true,
    earnedDate: new Date(Date.now() - 86400000 * 6),
    requirement: '1 gün sigarasız',
    xp: 100,
  },
  {
    id: '3',
    name: 'Hafta Kahramanı',
    description: 'Bir haftayı başarıyla tamamladın',
    icon: 'trophy',
    color: Palette.success[500],
    gradient: Gradients.success,
    earned: true,
    earnedDate: new Date(),
    requirement: '7 gün sigarasız',
    xp: 250,
  },
  {
    id: '4',
    name: 'Nefes Ustası',
    description: '10 nefes egzersizi tamamladın',
    icon: 'leaf',
    color: Palette.secondary[500],
    gradient: Gradients.ocean,
    earned: true,
    requirement: '10 nefes egzersizi',
    xp: 150,
  },
  {
    id: '5',
    name: 'Topluluk Yıldızı',
    description: 'Toplulukta ilk paylaşımını yaptın',
    icon: 'star',
    color: Palette.purple[500],
    gradient: Gradients.purple,
    earned: false,
    requirement: '1 paylaşım yap',
    xp: 75,
  },
  {
    id: '6',
    name: 'İki Hafta Savaşçısı',
    description: 'İki hafta sigarasız geçirdin',
    icon: 'shield-checkmark',
    color: Palette.info[500],
    gradient: Gradients.midnight,
    earned: false,
    requirement: '14 gün sigarasız',
    xp: 500,
  },
  {
    id: '7',
    name: 'Ay Lordu',
    description: 'Tam bir ay sigarasız!',
    icon: 'moon',
    color: '#FFD700',
    gradient: Gradients.gold,
    earned: false,
    requirement: '30 gün sigarasız',
    xp: 1000,
  },
  {
    id: '8',
    name: 'Meditasyon Gurusu',
    description: '7 gün art arda meditasyon',
    icon: 'flower',
    color: Palette.error[500],
    gradient: Gradients.sunset,
    earned: false,
    requirement: '7 gün streak meditasyon',
    xp: 300,
  },
];

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  completed: boolean;
  type: 'breathing' | 'walking' | 'water' | 'meditation' | 'journal';
}

const dailyChallenges: DailyChallenge[] = [
  {
    id: '1',
    title: '5 Dakika Nefes Egzersizi',
    description: 'Sabah kalktığında nefes egzersizi yap',
    icon: 'leaf',
    xp: 30,
    completed: true,
    type: 'breathing',
  },
  {
    id: '2',
    title: '8 Bardak Su İç',
    description: 'Gün boyunca yeterli su tüket',
    icon: 'water',
    xp: 25,
    completed: false,
    type: 'water',
  },
  {
    id: '3',
    title: '15 Dakika Yürüyüş',
    description: 'Temiz hava al ve hareket et',
    icon: 'walk',
    xp: 35,
    completed: false,
    type: 'walking',
  },
  {
    id: '4',
    title: 'Günlük Yaz',
    description: 'Bugün nasıl hissettiğini yaz',
    icon: 'book',
    xp: 20,
    completed: true,
    type: 'journal',
  },
];

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  rank: number;
}

const leaderboard: LeaderboardUser[] = [
  { id: '1', name: 'Ahmet K.', avatar: 'A', level: 15, xp: 4250, streak: 45, rank: 1 },
  { id: '2', name: 'Ayşe M.', avatar: 'Y', level: 12, xp: 3100, streak: 32, rank: 2 },
  { id: '3', name: 'Mehmet D.', avatar: 'M', level: 10, xp: 2450, streak: 28, rank: 3 },
  { id: '4', name: 'Sen', avatar: '👤', level: 5, xp: 950, streak: 7, rank: 127 },
  { id: '5', name: 'Zeynep B.', avatar: 'Z', level: 4, xp: 820, streak: 5, rank: 128 },
];

export default function GamificationScreen() {
  const [activeTab, setActiveTab] = useState<'badges' | 'challenges' | 'leaderboard'>('badges');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(Array(10).fill(0).map(() => ({
    y: new Animated.Value(0),
    x: new Animated.Value(0),
    opacity: new Animated.Value(0),
    rotation: new Animated.Value(0),
  }))).current;

  const currentXP = 950;
  const nextLevelXP = 1200;
  const currentLevel = 5;
  const progress = currentXP / nextLevelXP;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, []);

  const triggerConfetti = () => {
    confettiAnims.forEach((anim, index) => {
      anim.y.setValue(0);
      anim.x.setValue(0);
      anim.opacity.setValue(1);
      anim.rotation.setValue(0);

      Animated.parallel([
        Animated.timing(anim.y, {
          toValue: -300 - Math.random() * 200,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim.x, {
          toValue: (Math.random() - 0.5) * 200,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotation, {
          toValue: Math.random() * 720,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleCompleteChallenge = (challengeId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    triggerConfetti();
  };

  const renderBadges = () => (
    <View style={styles.badgesContainer}>
      <View style={styles.badgesGrid}>
        {badges.map((badge) => (
          <ScalePressable
            key={badge.id}
            style={[
              styles.badgeCard,
              !badge.earned && styles.badgeCardLocked,
            ]}
            scaleValue={0.98}
          >
            {badge.earned ? (
              <LinearGradient
                colors={badge.gradient as [string, string]}
                style={styles.badgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={badge.icon as any} size={36} color="#fff" />
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeXP}>+{badge.xp} XP</Text>
              </LinearGradient>
            ) : (
              <View style={styles.badgeLocked}>
                <View style={styles.badgeLockedIcon}>
                  <Ionicons name="lock-closed" size={24} color={SemanticColors.text.tertiary} />
                </View>
                <Text style={styles.badgeLockedName}>{badge.name}</Text>
                <Text style={styles.badgeRequirement}>{badge.requirement}</Text>
              </View>
            )}
          </ScalePressable>
        ))}
      </View>
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.challengesContainer}>
      <View style={styles.dailyProgress}>
        <Text style={styles.dailyProgressText}>
          Günlük İlerleme: {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length}
        </Text>
        <View style={styles.dailyProgressBar}>
          <View 
            style={[
              styles.dailyProgressFill,
              { width: `${(dailyChallenges.filter(c => c.completed).length / dailyChallenges.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {dailyChallenges.map((challenge) => (
        <View
          key={challenge.id}
          style={[
            styles.challengeCard,
            challenge.completed && styles.challengeCardCompleted,
          ]}
        >
          <View style={[
            styles.challengeIcon,
            { backgroundColor: challenge.completed 
              ? withAlpha(Palette.success[500], 0.2)
              : withAlpha(Palette.primary[500], 0.15)
            }
          ]}>
            <Ionicons 
              name={challenge.completed ? 'checkmark' : challenge.icon as any} 
              size={24} 
              color={challenge.completed ? Palette.success[500] : Palette.primary[500]} 
            />
          </View>
          <View style={styles.challengeInfo}>
            <Text style={[
              styles.challengeTitle,
              challenge.completed && styles.challengeTitleCompleted
            ]}>
              {challenge.title}
            </Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>
          <View style={styles.challengeRight}>
            <Text style={styles.challengeXP}>+{challenge.xp} XP</Text>
            {!challenge.completed && (
              <TouchableOpacity 
                style={styles.challengeButton}
                onPress={() => handleCompleteChallenge(challenge.id)}
              >
                <Text style={styles.challengeButtonText}>Tamamla</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      {/* Top 3 */}
      <View style={styles.podium}>
        {leaderboard.slice(0, 3).map((user, index) => {
          const podiumOrder = [1, 0, 2];
          const actualIndex = podiumOrder[index];
          const heights = [140, 180, 120];
          const gradients = [Gradients.silver, Gradients.gold, Gradients.bronze];
          
          return (
            <View 
              key={user.id} 
              style={[styles.podiumItem, { height: heights[actualIndex] }]}
            >
              <View style={styles.podiumAvatar}>
                <LinearGradient
                  colors={gradients[actualIndex] as [string, string]}
                  style={styles.podiumAvatarGradient}
                >
                  <Text style={styles.podiumAvatarText}>{user.avatar}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.podiumName}>{user.name}</Text>
              <Text style={styles.podiumXP}>{user.xp} XP</Text>
              <View style={[
                styles.podiumRank,
                { backgroundColor: gradients[actualIndex][0] }
              ]}>
                <Text style={styles.podiumRankText}>{actualIndex + 1}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Rest of leaderboard */}
      <View style={styles.leaderboardList}>
        {leaderboard.slice(3).map((user) => (
          <View 
            key={user.id} 
            style={[
              styles.leaderboardItem,
              user.name === 'Sen' && styles.leaderboardItemSelf
            ]}
          >
            <Text style={styles.leaderboardRank}>#{user.rank}</Text>
            <View style={styles.leaderboardAvatar}>
              <Text style={styles.leaderboardAvatarText}>{user.avatar}</Text>
            </View>
            <View style={styles.leaderboardInfo}>
              <Text style={[
                styles.leaderboardName,
                user.name === 'Sen' && styles.leaderboardNameSelf
              ]}>
                {user.name}
              </Text>
              <Text style={styles.leaderboardLevel}>Seviye {user.level}</Text>
            </View>
            <View style={styles.leaderboardStats}>
              <Text style={styles.leaderboardXP}>{user.xp} XP</Text>
              <View style={styles.leaderboardStreak}>
                <Text style={styles.leaderboardStreakIcon}>🔥</Text>
                <Text style={styles.leaderboardStreakText}>{user.streak}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Confetti */}
      {confettiAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              transform: [
                { translateY: anim.y },
                { translateX: anim.x },
                { rotate: anim.rotation.interpolate({
                  inputRange: [0, 720],
                  outputRange: ['0deg', '720deg'],
                })},
              ],
              opacity: anim.opacity,
              left: width / 2 - 10,
              top: 400,
              backgroundColor: [
                Palette.primary[500],
                Palette.accent[500],
                Palette.success[500],
                Palette.error[500],
                Palette.purple[500],
              ][index % 5],
            },
          ]}
        />
      ))}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>🎮 Başarılar</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Level Card */}
        <LinearGradient
          colors={Gradients.primaryVibrant as [string, string, ...string[]]}
          style={styles.levelCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.levelOverlay} />
          <View style={styles.levelContent}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{currentLevel}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Seviye {currentLevel}</Text>
              <View style={styles.xpBar}>
                <Animated.View 
                  style={[
                    styles.xpFill,
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.xpText}>{currentXP} / {nextLevelXP} XP</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakNumber}>7</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['badges', 'challenges', 'leaderboard'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons 
                name={
                  tab === 'badges' ? 'medal' : 
                  tab === 'challenges' ? 'flag' : 'podium'
                } 
                size={20} 
                color={activeTab === tab ? Palette.primary[500] : SemanticColors.text.tertiary}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'badges' ? 'Rozetler' : 
                 tab === 'challenges' ? 'Görevler' : 'Sıralama'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeTab === 'badges' && renderBadges()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'leaderboard' && renderLeaderboard()}

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
  backBtn: {
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
  levelCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.primary,
  },
  levelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha('#000', 0.1),
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    ...Typography.label.large,
    color: '#fff',
    marginBottom: Spacing.sm,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  xpText: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  streakIcon: {
    fontSize: 20,
  },
  streakNumber: {
    ...Typography.label.medium,
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
  },
  tabText: {
    ...Typography.caption.large,
    color: SemanticColors.text.tertiary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Palette.primary[500],
  },
  badgesContainer: {},
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  badgeCardLocked: {
    ...Shadows.none,
  },
  badgeGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 130,
  },
  badgeName: {
    ...Typography.label.medium,
    color: '#fff',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  badgeXP: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  badgeLocked: {
    backgroundColor: SemanticColors.surface.default,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 130,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    borderRadius: BorderRadius.xl,
  },
  badgeLockedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SemanticColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLockedName: {
    ...Typography.label.small,
    color: SemanticColors.text.tertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  badgeRequirement: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  challengesContainer: {},
  dailyProgress: {
    marginBottom: Spacing.lg,
  },
  dailyProgressText: {
    ...Typography.label.medium,
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.sm,
  },
  dailyProgressBar: {
    height: 8,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dailyProgressFill: {
    height: '100%',
    backgroundColor: Palette.primary[500],
    borderRadius: 4,
  },
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
  challengeCardCompleted: {
    borderColor: withAlpha(Palette.success[500], 0.3),
    backgroundColor: withAlpha(Palette.success[500], 0.05),
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  challengeTitleCompleted: {
    textDecorationLine: 'line-through',
    color: SemanticColors.text.tertiary,
  },
  challengeDescription: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
  },
  challengeRight: {
    alignItems: 'flex-end',
  },
  challengeXP: {
    ...Typography.label.small,
    color: Palette.accent[500],
    marginBottom: Spacing.xs,
  },
  challengeButton: {
    backgroundColor: Palette.primary[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  challengeButtonText: {
    ...Typography.caption.medium,
    color: '#fff',
    fontWeight: '600',
  },
  leaderboardContainer: {},
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  podiumItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 90,
    backgroundColor: SemanticColors.surface.default,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  podiumAvatar: {
    marginBottom: Spacing.sm,
  },
  podiumAvatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  podiumName: {
    ...Typography.caption.medium,
    color: SemanticColors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  podiumXP: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
    marginTop: Spacing.xs,
  },
  podiumRank: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRankText: {
    ...Typography.caption.small,
    color: '#fff',
    fontWeight: '700',
  },
  leaderboardList: {},
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  leaderboardItemSelf: {
    borderColor: Palette.primary[500],
    backgroundColor: withAlpha(Palette.primary[500], 0.05),
  },
  leaderboardRank: {
    ...Typography.label.medium,
    color: SemanticColors.text.tertiary,
    width: 40,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  leaderboardAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  leaderboardNameSelf: {
    color: Palette.primary[500],
  },
  leaderboardLevel: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  leaderboardXP: {
    ...Typography.label.small,
    color: SemanticColors.text.primary,
  },
  leaderboardStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  leaderboardStreakIcon: {
    fontSize: 12,
  },
  leaderboardStreakText: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});

