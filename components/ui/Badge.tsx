// Badge Component
// For notifications, status indicators, and labels

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { SemanticColors, Palette, withAlpha } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';

export type BadgeVariant = 'filled' | 'outlined' | 'soft';
export type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  children?: string | number;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  style?: ViewStyle;
}

export function Badge({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  dot = false,
  pulse = false,
  style,
}: BadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulse, pulseAnim]);

  const getColorValue = () => {
    switch (color) {
      case 'primary':
        return Palette.primary[500];
      case 'secondary':
        return Palette.secondary[500];
      case 'success':
        return Palette.success[500];
      case 'warning':
        return Palette.warning[500];
      case 'error':
        return Palette.error[500];
      case 'info':
        return Palette.info[500];
      default:
        return Palette.primary[500];
    }
  };

  const colorValue = getColorValue();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'filled':
        return {
          container: {
            backgroundColor: colorValue,
          },
          text: { color: '#FFFFFF' },
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colorValue,
          },
          text: { color: colorValue },
        };
      case 'soft':
        return {
          container: {
            backgroundColor: withAlpha(colorValue, 0.15),
          },
          text: { color: colorValue },
        };
      default:
        return {
          container: { backgroundColor: colorValue },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const getSizeStyles = () => {
    if (dot) {
      switch (size) {
        case 'small':
          return { width: 6, height: 6, borderRadius: 3 };
        case 'medium':
          return { width: 8, height: 8, borderRadius: 4 };
        case 'large':
          return { width: 10, height: 10, borderRadius: 5 };
      }
    }

    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.sm,
          paddingVertical: 2,
          minWidth: 16,
          height: 16,
        };
      case 'medium':
        return {
          paddingHorizontal: Spacing.sm,
          paddingVertical: 3,
          minWidth: 20,
          height: 20,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: 4,
          minWidth: 24,
          height: 24,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 9;
      case 'medium':
        return 10;
      case 'large':
        return 12;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  if (dot) {
    return (
      <Animated.View
        style={[
          styles.dotBadge,
          sizeStyles,
          variantStyles.container,
          pulse && { transform: [{ scale: pulseAnim }] },
          style,
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.badge,
        sizeStyles,
        variantStyles.container,
        pulse && { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: getTextSize() },
          variantStyles.text,
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Animated.View>
  );
}

// Status Badge - Pre-configured for common statuses
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  label?: string;
  style?: ViewStyle;
}

export function StatusBadge({ status, label, style }: StatusBadgeProps) {
  const statusConfig = {
    success: { color: 'success' as BadgeColor, text: label || 'Tamamlandı' },
    warning: { color: 'warning' as BadgeColor, text: label || 'Dikkat' },
    error: { color: 'error' as BadgeColor, text: label || 'Hata' },
    info: { color: 'info' as BadgeColor, text: label || 'Bilgi' },
    pending: { color: 'secondary' as BadgeColor, text: label || 'Devam ediyor' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="soft" color={config.color} size="small" style={style}>
      {config.text}
    </Badge>
  );
}

// Counter Badge - For notifications and counts
interface CounterBadgeProps {
  count: number;
  max?: number;
  color?: BadgeColor;
  style?: ViewStyle;
}

export function CounterBadge({
  count,
  max = 99,
  color = 'error',
  style,
}: CounterBadgeProps) {
  if (count <= 0) return null;

  const displayText = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant="filled"
      color={color}
      size="small"
      style={[styles.counterBadge, style]}
    >
      {displayText}
    </Badge>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  dotBadge: {},
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  counterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});

export default Badge;




