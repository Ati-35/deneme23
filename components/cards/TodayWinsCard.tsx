// Today Wins Card Component
// "Bugün Kazandıklarım" kartı

import React, { useRef, useEffect } from 'react';
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
import { ScalePressable } from '../interactions';
import { CurrencyAnimated, AnimatedNumber } from '../counters';

interface WinItem {
  id: string;
  icon: string;
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  color: string;
  animate?: boolean;
}

interface TodayWinsCardProps {
  moneySaved: number;
  cigarettesAvoided: number;
  healthImprovement: number;
  timeSaved: { hours: number; minutes: number };
  onPress?: () => void;
  style?: object;
}

export const TodayWinsCard: React.FC<TodayWinsCardProps> = ({
  moneySaved,
  cigarettesAvoided,
  healthImprovement,
  timeSaved,
  onPress,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const wins: WinItem[] = [
    {
      id: 'money',
      icon: 'cash-outline',
      label: 'Tasarruf',
      value: moneySaved,
      prefix: '₺',
      color: Palette.warning[500],
      animate: true,
    },
    {
      id: 'cigarettes',
      icon: 'ban-outline',
      label: 'İçilmedi',
      value: cigarettesAvoided,
      suffix: ' sigara',
      color: Palette.error[500],
      animate: true,
    },
    {
      id: 'health',
      icon: 'heart-outline',
      label: 'Sağlık',
      value: healthImprovement,
      suffix: '%',
      color: Palette.success[500],
      animate: true,
    },
    {
      id: 'time',
      icon: 'time-outline',
      label: 'Zaman',
      value: `${timeSaved.hours}s ${timeSaved.minutes}dk`,
      color: Palette.primary[500],
    },
  ];

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }, style]}>
      <ScalePressable onPress={onPress}>
        <LinearGradient
          colors={[withAlpha(Palette.primary[500], 0.1), withAlpha(Palette.accent[500], 0.05)]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    opacity: sparkleAnim,
                    transform: [
                      {
                        scale: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.sparkleEmoji}>🎊</Text>
              </Animated.View>
              <Text style={styles.title}>Bugün Kazandın</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SemanticColors.text.tertiary} />
          </View>

          {/* Wins Grid */}
          <View style={styles.winsGrid}>
            {wins.map((win, index) => (
              <View key={win.id} style={styles.winItem}>
                <View style={[styles.winIcon, { backgroundColor: withAlpha(win.color, 0.15) }]}>
                  <Ionicons name={win.icon as any} size={20} color={win.color} />
                </View>
                <View style={styles.winInfo}>
                  {win.animate && typeof win.value === 'number' ? (
                    <AnimatedNumber
                      value={win.value}
                      prefix={win.prefix}
                      suffix={win.suffix}
                      duration={1500}
                      textStyle={[styles.winValue, { color: win.color }]}
                    />
                  ) : (
                    <Text style={[styles.winValue, { color: win.color }]}>
                      {win.prefix}{win.value}{win.suffix}
                    </Text>
                  )}
                  <Text style={styles.winLabel}>{win.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Tüm İstatistikleri Gör</Text>
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
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: withAlpha(Palette.primary[500], 0.15),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sparkle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleEmoji: {
    fontSize: 20,
  },
  title: {
    ...Typography.heading.h5,
    color: SemanticColors.text.primary,
  },
  winsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  winItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(SemanticColors.surface.default, 0.5),
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  winIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winInfo: {
    flex: 1,
  },
  winValue: {
    ...Typography.label.large,
    fontWeight: '700',
  },
  winLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  cta: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: withAlpha(Palette.primary[500], 0.1),
  },
  ctaText: {
    ...Typography.caption.large,
    color: Palette.primary[500],
    fontWeight: '600',
  },
});

export default TodayWinsCard;

