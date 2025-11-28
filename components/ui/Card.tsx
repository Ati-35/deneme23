// Modern Card Component
// Supports multiple variants: elevated, outlined, filled, glass

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Shadows, Gradients, withAlpha } from '../../constants/Colors';
import { BorderRadius, Spacing, Duration, Opacity } from '../../constants/DesignTokens';

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass' | 'gradient';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  disabled?: boolean;
  padding?: 'none' | 'compact' | 'normal' | 'relaxed';
  radius?: 'sharp' | 'normal' | 'round';
  gradientColors?: readonly string[];
  style?: ViewStyle;
  animated?: boolean;
  haptic?: boolean;
}

export function Card({
  children,
  variant = 'elevated',
  onPress,
  disabled = false,
  padding = 'normal',
  radius = 'normal',
  gradientColors,
  style,
  animated = true,
  haptic = true,
}: CardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const paddingValues = {
    none: 0,
    compact: Spacing.md,
    normal: Spacing.base,
    relaxed: Spacing.xl,
  };

  const radiusValues = {
    sharp: BorderRadius.sm,
    normal: BorderRadius.lg,
    round: BorderRadius.xl,
  };

  const handlePressIn = useCallback(() => {
    if (!animated || disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [animated, disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (!animated || disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [animated, disabled, scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled || !onPress) return;
    
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [disabled, onPress, haptic]);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: SemanticColors.surface.default,
          ...Shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: SemanticColors.border.default,
        };
      case 'filled':
        return {
          backgroundColor: SemanticColors.surface.default,
        };
      case 'glass':
        return {
          backgroundColor: withAlpha(SemanticColors.surface.default, 0.8),
          borderWidth: 1,
          borderColor: withAlpha('#FFFFFF', 0.1),
        };
      case 'gradient':
        return {
          overflow: 'hidden',
        };
      default:
        return {
          backgroundColor: SemanticColors.surface.default,
        };
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius: radiusValues[radius],
    padding: paddingValues[padding],
    opacity: disabled ? Opacity.disabled : Opacity.full,
    ...getVariantStyles(),
  };

  const content = (
    <>
      {variant === 'gradient' && (
        <LinearGradient
          colors={(gradientColors || Gradients.card) as [string, string, ...string[]]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View style={padding !== 'none' ? undefined : { padding: paddingValues.normal }}>
        {children}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.card,
            cardStyle,
            style,
            animated && { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {content}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, cardStyle, style]}>
      {content}
    </View>
  );
}

// Stat Card - Specialized card for statistics
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  gradientColors?: readonly string[];
  onPress?: () => void;
  style?: ViewStyle;
}

export function StatCard({
  icon,
  value,
  label,
  trend,
  trendValue,
  gradientColors = Gradients.primary,
  onPress,
  style,
}: StatCardProps) {
  return (
    <Card
      variant="elevated"
      padding="normal"
      onPress={onPress}
      style={[styles.statCard, style]}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        style={styles.statIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon}
      </LinearGradient>
      <View style={styles.statContent}>
        <Animated.Text style={styles.statValue}>{value}</Animated.Text>
        <Animated.Text style={styles.statLabel}>{label}</Animated.Text>
      </View>
    </Card>
  );
}

// Glass Card - Card with glass morphism effect
interface GlassCardProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  style?: ViewStyle;
}

export function GlassCard({
  children,
  intensity = 'medium',
  style,
}: GlassCardProps) {
  const intensityValues = {
    light: 0.6,
    medium: 0.8,
    heavy: 0.95,
  };

  return (
    <View
      style={[
        styles.glassCard,
        {
          backgroundColor: withAlpha(SemanticColors.surface.default, intensityValues[intensity]),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Gradient Card - Card with gradient background
interface GradientCardProps {
  children: React.ReactNode;
  colors?: readonly string[];
  padding?: 'none' | 'compact' | 'normal' | 'relaxed';
  style?: ViewStyle;
}

export function GradientCard({
  children,
  colors = Gradients.primary,
  padding = 'normal',
  style,
}: GradientCardProps) {
  const paddingValues = {
    none: 0,
    compact: Spacing.md,
    normal: Spacing.base,
    relaxed: Spacing.xl,
  };

  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      style={[
        styles.gradientCard,
        { padding: paddingValues[padding] },
        style,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  statCard: {
    flexDirection: 'column',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 13,
    color: SemanticColors.text.secondary,
  },
  glassCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: withAlpha('#FFFFFF', 0.1),
    overflow: 'hidden',
  },
  gradientCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
});

export default Card;







