// Touch Feedback Components
// Micro-interactions and touch feedback utilities

import React, { useCallback, useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SemanticColors, withAlpha, Palette } from '../../constants/Colors';
import { Duration, Opacity, BorderRadius, Spacing } from '../../constants/DesignTokens';

// Haptic feedback types
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// Trigger haptic feedback (disabled on web)
export const triggerHaptic = (type: HapticType = 'light') => {
  // Skip haptic feedback on web platform
  if (Platform.OS === 'web') {
    return;
  }
  
  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case 'selection':
      Haptics.selectionAsync();
      break;
  }
};

// Scale Pressable - Scales on press
interface ScalePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  scaleValue?: number;
  haptic?: HapticType | false;
  style?: ViewStyle;
}

export function ScalePressable({
  children,
  onPress,
  onLongPress,
  disabled = false,
  scaleValue = 0.96,
  haptic = 'light',
  style,
}: ScalePressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [disabled, scaleAnim, scaleValue]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [disabled, scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (haptic) triggerHaptic(haptic);
    onPress?.();
  }, [disabled, haptic, onPress]);

  const handleLongPress = useCallback(() => {
    if (disabled) return;
    if (haptic) triggerHaptic('heavy');
    onLongPress?.();
  }, [disabled, haptic, onLongPress]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          disabled && { opacity: Opacity.disabled },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Bounce Pressable - Bounces on press
interface BouncePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  bounceValue?: number;
  haptic?: HapticType | false;
  style?: ViewStyle;
}

export function BouncePressable({
  children,
  onPress,
  disabled = false,
  bounceValue = 1.08,
  haptic = 'light',
  style,
}: BouncePressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (haptic) triggerHaptic(haptic);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: Duration.fastest,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: bounceValue,
        useNativeDriver: true,
        tension: 400,
        friction: 4,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
    ]).start(() => onPress?.());
  }, [disabled, haptic, scaleAnim, bounceValue, onPress]);

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          disabled && { opacity: Opacity.disabled },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Ripple Effect Container
interface RippleContainerProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  rippleColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function RippleContainer({
  children,
  onPress,
  disabled = false,
  rippleColor = Palette.primary[500],
  borderRadius = BorderRadius.md,
  style,
}: RippleContainerProps) {
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    if (disabled) return;
    triggerHaptic('light');

    // Reset animations
    rippleAnim.setValue(0);
    opacityAnim.setValue(0.3);

    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: Duration.ripple,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: Duration.ripple,
        useNativeDriver: true,
      }),
    ]).start(() => onPress?.());
  }, [disabled, rippleAnim, opacityAnim, onPress]);

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <View style={[styles.rippleContainer, { borderRadius }, style]}>
        {children}
        <Animated.View
          style={[
            styles.ripple,
            {
              borderRadius,
              backgroundColor: rippleColor,
              transform: [{ scale: rippleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 4],
              }) }],
              opacity: opacityAnim,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

// Highlight Pressable - Background highlight on press
interface HighlightPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  highlightColor?: string;
  style?: ViewStyle;
}

export function HighlightPressable({
  children,
  onPress,
  disabled = false,
  highlightColor = withAlpha(SemanticColors.text.primary, 0.1),
  style,
}: HighlightPressableProps) {
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        triggerHaptic('light');
        onPress?.();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.highlightPressable,
        pressed && { backgroundColor: highlightColor },
        disabled && { opacity: Opacity.disabled },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

// Tilt Pressable - 3D tilt effect
interface TiltPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  haptic?: HapticType | false;
  style?: ViewStyle;
}

export function TiltPressable({
  children,
  onPress,
  disabled = false,
  haptic = 'light',
  style,
}: TiltPressableProps) {
  const rotateXAnim = useRef(new Animated.Value(0)).current;
  const rotateYAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.parallel([
      Animated.timing(rotateXAnim, {
        toValue: 1,
        duration: Duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: Duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, rotateXAnim, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(rotateXAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
    ]).start();
  }, [disabled, rotateXAnim, scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (haptic) triggerHaptic(haptic);
    onPress?.();
  }, [disabled, haptic, onPress]);

  const rotateX = rotateXAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3deg'],
  });

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          {
            transform: [
              { perspective: 1000 },
              { rotateX },
              { scale: scaleAnim },
            ],
          },
          disabled && { opacity: Opacity.disabled },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Success Feedback Animation
interface SuccessFeedbackProps {
  onComplete?: () => void;
  size?: number;
}

export function SuccessFeedback({ onComplete, size = 60 }: SuccessFeedbackProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    triggerHaptic('success');
    
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: Duration.normal,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    });
  }, [scaleAnim, checkmarkAnim, onComplete]);

  return (
    <Animated.View
      style={[
        styles.successFeedback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={{
          opacity: checkmarkAnim,
          transform: [{ scale: checkmarkAnim }],
        }}
      >
        <View style={styles.checkmark}>
          <View style={[styles.checkmarkStem, { height: size * 0.3 }]} />
          <View style={[styles.checkmarkKick, { width: size * 0.15 }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// Swipeable Row
interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  style,
}: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  // Simplified swipe - for full implementation use react-native-gesture-handler
  return (
    <View style={[styles.swipeableRow, style]}>
      {leftAction && (
        <View style={styles.swipeAction}>
          {leftAction}
        </View>
      )}
      <Animated.View
        style={[
          styles.swipeableContent,
          { transform: [{ translateX }] },
        ]}
      >
        {children}
      </Animated.View>
      {rightAction && (
        <View style={[styles.swipeAction, styles.swipeActionRight]}>
          {rightAction}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rippleContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 50,
    height: 50,
    marginTop: -25,
    marginLeft: -25,
  },
  highlightPressable: {
    borderRadius: BorderRadius.md,
  },
  successFeedback: {
    backgroundColor: Palette.success[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    position: 'relative',
  },
  checkmarkStem: {
    position: 'absolute',
    width: 3,
    backgroundColor: '#FFFFFF',
    left: 11,
    top: 6,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  checkmarkKick: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#FFFFFF',
    left: 0,
    top: 15,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  swipeableRow: {
    position: 'relative',
    overflow: 'hidden',
  },
  swipeableContent: {
    zIndex: 1,
  },
  swipeAction: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  swipeActionRight: {
    left: undefined,
    right: 0,
  },
});

export default {
  triggerHaptic,
  ScalePressable,
  BouncePressable,
  RippleContainer,
  HighlightPressable,
  TiltPressable,
  SuccessFeedback,
  SwipeableRow,
};



