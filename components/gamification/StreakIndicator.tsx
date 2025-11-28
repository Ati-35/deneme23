// Streak Indicator Component
// Duolingo-style günlük seri göstergesi

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { getNextStreakMilestone, getDaysUntilNextMilestone, STREAK_MILESTONES } from '../../utils/gamification';

interface StreakIndicatorProps {
  streak: number;
  compact?: boolean;
  showMilestone?: boolean;
  animated?: boolean;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  streak,
  compact = false,
  showMilestone = true,
  animated = true,
}) => {
  const flameAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const nextMilestone = getNextStreakMilestone(streak);
  const daysUntilMilestone = getDaysUntilNextMilestone(streak);
  const currentMilestone = STREAK_MILESTONES.filter(m => m.days <= streak).pop();
  
  // Calculate progress to next milestone
  const prevMilestoneDays = currentMilestone?.days || 0;
  const nextMilestoneDays = nextMilestone?.days || 365;
  const progress = ((streak - prevMilestoneDays) / (nextMilestoneDays - prevMilestoneDays)) * 100;

  useEffect(() => {
    if (animated && streak > 0) {
      // Flame animation
      const flameAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1.15,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      flameAnimation.start();

      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      return () => flameAnimation.stop();
    }
  }, [streak, animated]);

  const getStreakColor = () => {
    if (streak >= 90) return Gradients.gold;
    if (streak >= 30) return Gradients.warning;
    if (streak >= 7) return Gradients.error;
    return ['#F97316', '#EA580C'] as const;
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
          <Text style={styles.compactFlame}>🔥</Text>
        </Animated.View>
        <Text style={styles.compactNumber}>{streak}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[withAlpha(Palette.warning[500], 0.1), withAlpha(Palette.error[500], 0.05)]}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Animated.View style={[styles.flameContainer, { transform: [{ scale: flameAnim }] }]}>
            <Text style={styles.flameEmoji}>🔥</Text>
          </Animated.View>
          
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>Günlük Seri</Text>
          </View>

          {currentMilestone && (
            <View style={[styles.badge, { backgroundColor: withAlpha(currentMilestone.color, 0.2) }]}>
              <Text style={styles.badgeEmoji}>{currentMilestone.icon}</Text>
              <Text style={[styles.badgeText, { color: currentMilestone.color }]}>
                {currentMilestone.title}
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {showMilestone && nextMilestone && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={getStreakColor() as [string, string]}
                  style={styles.progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>

            <View style={styles.milestoneInfo}>
              <View style={styles.milestoneLeft}>
                <Text style={styles.milestoneIcon}>{nextMilestone.icon}</Text>
                <Text style={styles.milestoneText}>
                  {daysUntilMilestone} gün kaldı
                </Text>
              </View>
              <Text style={[styles.milestoneName, { color: nextMilestone.color }]}>
                {nextMilestone.title} Rozeti
              </Text>
            </View>
          </View>
        )}

        {/* Streak Bonus Info */}
        {streak >= 3 && (
          <View style={styles.bonusRow}>
            <Ionicons name="sparkles" size={14} color={Palette.warning[500]} />
            <Text style={styles.bonusText}>
              Seri bonusu: +{streak >= 90 ? 75 : streak >= 60 ? 50 : streak >= 30 ? 35 : streak >= 14 ? 20 : streak >= 7 ? 10 : 5} XP/görev
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gradientBg: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: withAlpha(Palette.warning[500], 0.2),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withAlpha(Palette.warning[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  flameEmoji: {
    fontSize: 28,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    ...Typography.stat.large,
    color: SemanticColors.text.primary,
    lineHeight: 40,
  },
  streakLabel: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeText: {
    ...Typography.caption.small,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: withAlpha(Palette.warning[500], 0.15),
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  milestoneInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneIcon: {
    fontSize: 16,
  },
  milestoneText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
  },
  milestoneName: {
    ...Typography.caption.large,
    fontWeight: '600',
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: withAlpha(Palette.warning[500], 0.15),
    gap: 6,
  },
  bonusText: {
    ...Typography.caption.medium,
    color: Palette.warning[500],
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.warning[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  compactFlame: {
    fontSize: 16,
  },
  compactNumber: {
    ...Typography.label.small,
    color: Palette.warning[500],
    fontWeight: '700',
  },
});

export default StreakIndicator;

