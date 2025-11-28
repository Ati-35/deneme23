// Limited Task Card Component
// Sınırlı süreli bonus görev kartı (FOMO)

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { ScalePressable } from '../interactions';
import { LimitedTask } from '../../store/userStore';

interface LimitedTaskCardProps {
  task: LimitedTask;
  onStart: () => void;
  onComplete: () => void;
  style?: object;
}

export const LimitedTaskCard: React.FC<LimitedTaskCardProps> = ({
  task,
  onStart,
  onComplete,
  style,
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const urgencyAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Update timer
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(task.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      // Urgency level based on time left
      const totalMinutesLeft = hours * 60 + minutes;
      if (totalMinutesLeft <= 30) {
        Animated.timing(urgencyAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else if (totalMinutesLeft <= 60) {
        Animated.timing(urgencyAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Timer tick animation
    const timerTick = Animated.loop(
      Animated.sequence([
        Animated.timing(timerAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(timerAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    timerTick.start();

    return () => {
      clearInterval(interval);
      pulse.stop();
      timerTick.stop();
    };
  }, [task.expiresAt]);

  const handlePress = () => {
    if (isExpired || task.completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  const formatTime = () => {
    const { hours, minutes, seconds } = timeLeft;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getUrgencyColor = () => {
    const totalMinutesLeft = timeLeft.hours * 60 + timeLeft.minutes;
    if (totalMinutesLeft <= 30) return Palette.error[500];
    if (totalMinutesLeft <= 60) return Palette.warning[500];
    return Palette.primary[500];
  };

  if (isExpired && !task.completed) {
    return null; // Hide expired tasks
  }

  if (task.completed) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.completedCard}>
          <Ionicons name="checkmark-circle" size={24} color={Palette.success[500]} />
          <Text style={styles.completedText}>Bonus görev tamamlandı! +{task.xpReward + task.bonusXp} XP</Text>
        </View>
      </View>
    );
  }

  const urgencyColor = getUrgencyColor();

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }, style]}>
      <ScalePressable onPress={handlePress}>
        <LinearGradient
          colors={[withAlpha(urgencyColor, 0.15), withAlpha(urgencyColor, 0.05)]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Urgency indicator */}
          <Animated.View
            style={[
              styles.urgencyBar,
              {
                backgroundColor: urgencyColor,
                opacity: urgencyAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 0.6, 1],
                }),
              },
            ]}
          />

          <View style={styles.content}>
            {/* Timer */}
            <View style={styles.timerSection}>
              <View style={[styles.timerBadge, { backgroundColor: withAlpha(urgencyColor, 0.2) }]}>
                <Animated.View style={{ transform: [{ scale: timerAnim }] }}>
                  <Ionicons name="time-outline" size={16} color={urgencyColor} />
                </Animated.View>
                <Text style={[styles.timerText, { color: urgencyColor }]}>{formatTime()}</Text>
              </View>
              <Text style={styles.limitedLabel}>Sınırlı Süre!</Text>
            </View>

            {/* Task info */}
            <View style={styles.taskInfo}>
              <View style={[styles.taskIcon, { backgroundColor: withAlpha(urgencyColor, 0.15) }]}>
                <Ionicons name={task.icon as any} size={24} color={urgencyColor} />
              </View>
              <View style={styles.taskDetails}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
              </View>
            </View>

            {/* Rewards */}
            <View style={styles.rewards}>
              <View style={styles.rewardItem}>
                <Ionicons name="star" size={14} color={Palette.warning[500]} />
                <Text style={styles.rewardText}>+{task.xpReward} XP</Text>
              </View>
              <Text style={styles.rewardPlus}>+</Text>
              <View style={[styles.rewardItem, styles.bonusReward]}>
                <Ionicons name="gift" size={14} color={Palette.success[500]} />
                <Text style={[styles.rewardText, styles.bonusText]}>+{task.bonusXp} Bonus</Text>
              </View>
            </View>

            {/* CTA */}
            <View style={[styles.ctaButton, { backgroundColor: urgencyColor }]}>
              <Text style={styles.ctaText}>Başla</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </ScalePressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withAlpha(Palette.error[500], 0.2),
  },
  urgencyBar: {
    height: 4,
  },
  content: {
    padding: Spacing.lg,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  timerText: {
    ...Typography.label.medium,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  limitedLabel: {
    ...Typography.caption.small,
    color: Palette.error[500],
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    ...Typography.heading.h5,
    color: SemanticColors.text.primary,
  },
  taskDescription: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  rewards: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.warning[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  bonusReward: {
    backgroundColor: withAlpha(Palette.success[500], 0.15),
  },
  rewardText: {
    ...Typography.caption.small,
    color: Palette.warning[500],
    fontWeight: '600',
  },
  bonusText: {
    color: Palette.success[500],
  },
  rewardPlus: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  ctaText: {
    ...Typography.button.medium,
    color: '#FFFFFF',
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.success[500], 0.1),
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: withAlpha(Palette.success[500], 0.2),
  },
  completedText: {
    ...Typography.label.medium,
    color: Palette.success[500],
    flex: 1,
  },
});

export default LimitedTaskCard;

