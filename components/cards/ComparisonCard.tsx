// Comparison Card Component
// "Sen vs Diğer Kullanıcılar" karşılaştırma kartı

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
import { SemanticColors, Palette, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { ScalePressable } from '../interactions';

interface ComparisonItem {
  label: string;
  yourValue: number;
  avgValue: number;
  format: 'currency' | 'number' | 'percent';
  icon: string;
}

interface ComparisonCardProps {
  items: ComparisonItem[];
  percentBetter: number;
  onPress?: () => void;
  style?: object;
}

interface ComparisonBarProps {
  item: ComparisonItem;
  index: number;
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({ item, index }) => {
  const yourBarAnim = useRef(new Animated.Value(0)).current;
  const avgBarAnim = useRef(new Animated.Value(0)).current;

  const maxValue = Math.max(item.yourValue, item.avgValue) * 1.2;
  const yourPercent = (item.yourValue / maxValue) * 100;
  const avgPercent = (item.avgValue / maxValue) * 100;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(yourBarAnim, {
        toValue: yourPercent,
        duration: 1000,
        delay: index * 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(avgBarAnim, {
        toValue: avgPercent,
        duration: 1000,
        delay: index * 200 + 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [yourPercent, avgPercent, index]);

  const formatValue = (value: number) => {
    switch (item.format) {
      case 'currency':
        return `₺${value.toLocaleString('tr-TR')}`;
      case 'percent':
        return `${value}%`;
      default:
        return value.toLocaleString('tr-TR');
    }
  };

  const isBetter = item.yourValue >= item.avgValue;

  return (
    <View style={styles.comparisonItem}>
      <View style={styles.comparisonHeader}>
        <View style={styles.comparisonLabel}>
          <Ionicons name={item.icon as any} size={16} color={SemanticColors.text.secondary} />
          <Text style={styles.labelText}>{item.label}</Text>
        </View>
        {isBetter && (
          <View style={styles.betterBadge}>
            <Ionicons name="trending-up" size={12} color={Palette.success[500]} />
          </View>
        )}
      </View>

      {/* Your bar */}
      <View style={styles.barContainer}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Sen</Text>
          <View style={styles.barTrack}>
            <Animated.View
              style={[
                styles.barFill,
                styles.yourBar,
                {
                  width: yourBarAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.barValue, styles.yourValue]}>{formatValue(item.yourValue)}</Text>
        </View>

        {/* Average bar */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Ort.</Text>
          <View style={styles.barTrack}>
            <Animated.View
              style={[
                styles.barFill,
                styles.avgBar,
                {
                  width: avgBarAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.barValue, styles.avgValue]}>{formatValue(item.avgValue)}</Text>
        </View>
      </View>
    </View>
  );
};

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  items,
  percentBetter,
  onPress,
  style,
}) => {
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(badgeAnim, {
      toValue: 1,
      delay: 500,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, style]}>
      <ScalePressable onPress={onPress}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={20} color={Palette.accent[500]} />
              </View>
              <Text style={styles.title}>Sen vs Ortalama</Text>
            </View>
            
            {percentBetter > 0 && (
              <Animated.View
                style={[
                  styles.percentBadge,
                  {
                    transform: [{ scale: badgeAnim }],
                  },
                ]}
              >
                <Ionicons name="trophy" size={14} color={Palette.warning[500]} />
                <Text style={styles.percentText}>%{percentBetter} daha iyi!</Text>
              </Animated.View>
            )}
          </View>

          {/* Comparison bars */}
          <View style={styles.comparisons}>
            {items.map((item, index) => (
              <ComparisonBar key={item.label} item={item} index={index} />
            ))}
          </View>

          {/* Footer message */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {percentBetter > 0 
                ? '🎉 Harika gidiyorsun! Ortalamanın üstündesin.'
                : '💪 Devam et! Her gün daha iyiye gidiyorsun.'}
            </Text>
          </View>
        </View>
      </ScalePressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
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
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading.h5,
    color: SemanticColors.text.primary,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.warning[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  percentText: {
    ...Typography.caption.small,
    color: Palette.warning[500],
    fontWeight: '700',
  },
  comparisons: {
    gap: Spacing.lg,
  },
  comparisonItem: {},
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  comparisonLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
  },
  betterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: withAlpha(Palette.success[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  barContainer: {
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
    width: 28,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: withAlpha(Palette.primary[500], 0.1),
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  yourBar: {
    backgroundColor: Palette.primary[500],
  },
  avgBar: {
    backgroundColor: SemanticColors.text.tertiary,
  },
  barValue: {
    ...Typography.caption.small,
    width: 60,
    textAlign: 'right',
  },
  yourValue: {
    color: Palette.primary[500],
    fontWeight: '600',
  },
  avgValue: {
    color: SemanticColors.text.tertiary,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
  },
});

export default ComparisonCard;

