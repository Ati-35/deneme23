// Modern Button Component
// Supports multiple variants, sizes, icons, and loading states

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SemanticColors, Palette, Shadows, Gradients, withAlpha } from '../../constants/Colors';
import { BorderRadius, Spacing, Duration, ButtonConfig, Opacity } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';

export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'gradient' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  gradientColors?: readonly string[];
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
  rounded?: boolean;
}

export function Button({
  children,
  variant = 'filled',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  gradientColors,
  fullWidth = false,
  style,
  textStyle,
  haptic = true,
  rounded = false,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = ButtonConfig.sizes[size];
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: Duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDisabled, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (isDisabled) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDisabled, scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (isDisabled || !onPress) return;
    
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [isDisabled, onPress, haptic]);

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; iconColor: string } => {
    switch (variant) {
      case 'filled':
        return {
          container: {
            backgroundColor: SemanticColors.interactive.primary,
          },
          text: { color: SemanticColors.text.onPrimary },
          iconColor: SemanticColors.text.onPrimary,
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: SemanticColors.interactive.primary,
          },
          text: { color: SemanticColors.interactive.primary },
          iconColor: SemanticColors.interactive.primary,
        };
      case 'text':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: SemanticColors.interactive.primary },
          iconColor: SemanticColors.interactive.primary,
        };
      case 'elevated':
        return {
          container: {
            backgroundColor: SemanticColors.surface.elevated,
            ...Shadows.md,
          },
          text: { color: SemanticColors.text.primary },
          iconColor: SemanticColors.text.primary,
        };
      case 'gradient':
        return {
          container: {
            overflow: 'hidden',
          },
          text: { color: SemanticColors.text.onPrimary },
          iconColor: SemanticColors.text.onPrimary,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: SemanticColors.status.error,
          },
          text: { color: SemanticColors.text.onError },
          iconColor: SemanticColors.text.onError,
        };
      default:
        return {
          container: { backgroundColor: SemanticColors.interactive.primary },
          text: { color: SemanticColors.text.onPrimary },
          iconColor: SemanticColors.text.onPrimary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: rounded ? BorderRadius.full : BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isDisabled ? Opacity.disabled : Opacity.full,
    ...(fullWidth && { width: '100%' }),
    ...variantStyles.container,
  };

  const textStyles: TextStyle = {
    ...Typography.button[size],
    ...variantStyles.text,
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.iconColor}
          style={styles.loader}
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={sizeConfig.iconSize}
              color={variantStyles.iconColor}
              style={styles.leftIcon}
            />
          )}
          <Text style={[styles.text, textStyles, textStyle]}>{children}</Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={sizeConfig.iconSize}
              color={variantStyles.iconColor}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </View>
  );

  const buttonContent = (
    <Animated.View
      style={[
        containerStyle,
        style,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      {variant === 'gradient' && (
        <LinearGradient
          colors={(gradientColors || Gradients.primary) as [string, string, ...string[]]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
      {renderContent()}
    </Animated.View>
  );

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      {buttonContent}
    </Pressable>
  );
}

// Icon Button - Circular button with just an icon
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'filled' | 'outlined' | 'ghost' | 'gradient';
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  color?: string;
  gradientColors?: readonly string[];
  style?: ViewStyle;
  haptic?: boolean;
}

export function IconButton({
  icon,
  variant = 'filled',
  size = 'medium',
  onPress,
  disabled = false,
  color,
  gradientColors,
  style,
  haptic = true,
}: IconButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled;

  const sizeValues = {
    small: { container: 32, icon: 16 },
    medium: { container: 44, icon: 20 },
    large: { container: 52, icon: 24 },
  };

  const sizeConfig = sizeValues[size];

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    }).start();
  }, [isDisabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    }).start();
  }, [isDisabled, scaleAnim]);

  const handlePress = useCallback(() => {
    if (isDisabled || !onPress) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [isDisabled, onPress, haptic]);

  const getVariantStyles = (): { bg: ViewStyle; iconColor: string } => {
    switch (variant) {
      case 'filled':
        return {
          bg: { backgroundColor: SemanticColors.interactive.primary },
          iconColor: color || SemanticColors.text.onPrimary,
        };
      case 'outlined':
        return {
          bg: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: SemanticColors.border.default,
          },
          iconColor: color || SemanticColors.text.primary,
        };
      case 'ghost':
        return {
          bg: { backgroundColor: withAlpha(SemanticColors.surface.default, 0.5) },
          iconColor: color || SemanticColors.text.primary,
        };
      case 'gradient':
        return {
          bg: { overflow: 'hidden' },
          iconColor: color || SemanticColors.text.onPrimary,
        };
      default:
        return {
          bg: { backgroundColor: SemanticColors.interactive.primary },
          iconColor: color || SemanticColors.text.onPrimary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          styles.iconButton,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
            transform: [{ scale: scaleAnim }],
            opacity: isDisabled ? Opacity.disabled : Opacity.full,
          },
          variantStyles.bg,
          style,
        ]}
      >
        {variant === 'gradient' && (
          <LinearGradient
            colors={(gradientColors || Gradients.primary) as [string, string, ...string[]]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <Ionicons
          name={icon}
          size={sizeConfig.icon}
          color={variantStyles.iconColor}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  loader: {
    marginRight: Spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;




