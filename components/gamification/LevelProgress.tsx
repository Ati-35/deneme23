// Level Progress Component
// XP ve seviye ilerleme göstergesi

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
import {
  getLevelProgress,
  getLevelName,
  getLevelColor,
  getXPForNextLevel,
  LEVEL_THRESHOLDS,
} from '../../utils/gamification';

interface LevelProgressProps {
  xp: number;
  level: number;
  compact?: boolean;
  showXPDetails?: boolean;
  animated?: boolean;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  xp,
  level,
  compact = false,
  showXPDetails = true,
  animated = true,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(1)).current;

  const progress = getLevelProgress(xp, level);
  const levelName = getLevelName(level);
  const levelColor = getLevelColor(level);
  const xpForNext = getXPForNextLevel(level);
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeededForLevel = xpForNext - currentLevelXP;

  useEffect(() => {
    if (animated) {
      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // Star pulse animation
      const starAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(starAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(starAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      starAnimation.start();

      return () => starAnimation.stop();
    }
  }, [xp, level, animated]);

  const getLevelGradient = (): readonly [string, string] => {
    if (level >= 15) return Gradients.gold;
    if (level >= 10) return Gradients.warning;
    if (level >= 7) return Gradients.purple;
    if (level >= 5) return Gradients.primary;
    return Gradients.success;
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Animated.View style={[styles.compactStar, { transform: [{ scale: starAnim }] }]}>
          <Text style={styles.compactStarText}>⭐</Text>
        </Animated.View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactLevel}>Lvl {level}</Text>
          <View style={styles.compactProgressBar}>
            <Animated.View
              style={[
                styles.compactProgressFill,
                {
                  backgroundColor: levelColor,
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[withAlpha(levelColor, 0.1), withAlpha(levelColor, 0.05)]}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Animated.View 
            style={[
              styles.levelBadge, 
              { backgroundColor: withAlpha(levelColor, 0.2), transform: [{ scale: starAnim }] }
            ]}
          >
            <Text style={styles.levelNumber}>{level}</Text>
          </Animated.View>

          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Seviye {level}</Text>
            <Text style={[styles.levelName, { color: levelColor }]}>{levelName}</Text>
          </View>

          <View style={styles.xpBadge}>
            <Ionicons name="star" size={14} color={Palette.warning[500]} />
            <Text style={styles.xpTotal}>{xp.toLocaleString('tr-TR')} XP</Text>
          </View>
        </View>

        {/* Progress Bar */}
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
                colors={getLevelGradient() as [string, string]}
                style={styles.progressGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>

          {showXPDetails && (
            <View style={styles.xpDetails}>
              <Text style={styles.xpCurrent}>
                {xpInCurrentLevel.toLocaleString('tr-TR')} / {xpNeededForLevel.toLocaleString('tr-TR')} XP
              </Text>
              <Text style={styles.xpPercent}>{Math.round(progress)}%</Text>
            </View>
          )}
        </View>

        {/* Next Level Info */}
        {level < 15 && (
          <View style={styles.nextLevelRow}>
            <Ionicons name="arrow-up-circle-outline" size={16} color={SemanticColors.text.tertiary} />
            <Text style={styles.nextLevelText}>
              Sonraki seviye: {getLevelName(level + 1)}
            </Text>
            <Text style={[styles.nextLevelXP, { color: getLevelColor(level + 1) }]}>
              +{(xpForNext - xp).toLocaleString('tr-TR')} XP
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
    borderColor: withAlpha(Palette.primary[500], 0.2),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  levelNumber: {
    ...Typography.heading.h3,
    color: SemanticColors.text.primary,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  levelName: {
    ...Typography.caption.large,
    fontWeight: '600',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.warning[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  xpTotal: {
    ...Typography.caption.large,
    color: Palette.warning[500],
    fontWeight: '700',
  },
  progressSection: {
    marginTop: Spacing.lg,
  },
  progressBar: {
    height: 10,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  xpDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  xpCurrent: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
  },
  xpPercent: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
  },
  nextLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: withAlpha(Palette.primary[500], 0.15),
    gap: 6,
  },
  nextLevelText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    flex: 1,
  },
  nextLevelXP: {
    ...Typography.caption.large,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.primary[500], 0.1),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  compactStar: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactStarText: {
    fontSize: 14,
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactLevel: {
    ...Typography.caption.small,
    color: SemanticColors.text.primary,
    fontWeight: '600',
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: withAlpha(Palette.primary[500], 0.2),
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default LevelProgress;

