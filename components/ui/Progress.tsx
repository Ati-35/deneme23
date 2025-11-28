// Progress Components
// Linear and circular progress indicators with animations

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G } from 'react-native-svg';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { BorderRadius, Duration } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';

// Animated Circle for SVG
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Linear Progress Bar
interface LinearProgressProps {
  value: number; // 0-100
  color?: string;
  gradientColors?: readonly string[];
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export function LinearProgress({
  value,
  color,
  gradientColors,
  height = 8,
  showLabel = false,
  animated = true,
  style,
}: LinearProgressProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: Math.min(100, Math.max(0, value)),
        duration: Duration.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(value);
    }
  }, [value, animated, animatedValue]);

  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={style}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{Math.round(value)}%</Text>
        </View>
      )}
      <View style={[styles.linearTrack, { height }]}>
        <Animated.View style={[styles.linearProgress, { width: progressWidth, height }]}>
          {gradientColors ? (
            <LinearGradient
              colors={gradientColors as [string, string, ...string[]]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: color || Palette.primary[500] },
              ]}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

// Circular Progress
interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientColors?: readonly string[];
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  color,
  showValue = true,
  valuePrefix = '',
  valueSuffix = '%',
  label,
  animated = true,
  style,
}: CircularProgressProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: Math.min(100, Math.max(0, value)),
        duration: Duration.slower,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      animatedValue.setValue(value);
    }
  }, [value, animated, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.circularContainer, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={withAlpha(Palette.neutral[500], 0.2)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color || Palette.primary[500]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>
      {showValue && (
        <View style={styles.circularContent}>
          <Text style={styles.circularValue}>
            {valuePrefix}{Math.round(value)}{valueSuffix}
          </Text>
          {label && <Text style={styles.circularLabel}>{label}</Text>}
        </View>
      )}
    </View>
  );
}

// Radial Progress (Semi-circle gauge)
interface RadialProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showValue?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function RadialProgress({
  value,
  size = 160,
  strokeWidth = 12,
  color,
  showValue = true,
  label,
  style,
}: RadialProgressProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const center = size / 2;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: Math.min(100, Math.max(0, value)),
      duration: Duration.slower,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [value, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.radialContainer, { width: size, height: size / 2 + 20 }, style]}>
      <Svg width={size} height={size / 2 + strokeWidth}>
        {/* Background arc */}
        <Circle
          cx={center}
          cy={size / 2}
          r={radius}
          stroke={withAlpha(Palette.neutral[500], 0.2)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={0}
          rotation="180"
          origin={`${center}, ${size / 2}`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <G rotation="180" origin={`${center}, ${size / 2}`}>
          <AnimatedCircle
            cx={center}
            cy={size / 2}
            r={radius}
            stroke={color || Palette.primary[500]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>
      {showValue && (
        <View style={styles.radialContent}>
          <Text style={styles.radialValue}>{Math.round(value)}%</Text>
          {label && <Text style={styles.radialLabel}>{label}</Text>}
        </View>
      )}
    </View>
  );
}

// Step Progress (Dots/Steps)
interface StepProgressProps {
  steps: number;
  currentStep: number;
  activeColor?: string;
  style?: ViewStyle;
}

export function StepProgress({
  steps,
  currentStep,
  activeColor,
  style,
}: StepProgressProps) {
  return (
    <View style={[styles.stepContainer, style]}>
      {Array.from({ length: steps }).map((_, index) => {
        const isActive = index < currentStep;
        const isCurrent = index === currentStep - 1;
        
        return (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepDot,
                isActive && { backgroundColor: activeColor || Palette.primary[500] },
                isCurrent && styles.stepDotCurrent,
              ]}
            />
            {index < steps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  isActive && { backgroundColor: activeColor || Palette.primary[500] },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Linear Progress
  linearTrack: {
    backgroundColor: withAlpha(Palette.neutral[500], 0.2),
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  linearProgress: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  labelText: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
  },
  
  // Circular Progress
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularValue: {
    ...Typography.stat.medium,
    color: SemanticColors.text.primary,
  },
  circularLabel: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  
  // Radial Progress
  radialContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  radialContent: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  radialValue: {
    ...Typography.stat.large,
    color: SemanticColors.text.primary,
  },
  radialLabel: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
  },
  
  // Step Progress
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: withAlpha(Palette.neutral[500], 0.3),
  },
  stepDotCurrent: {
    transform: [{ scale: 1.3 }],
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: withAlpha(Palette.neutral[500], 0.3),
    marginHorizontal: 4,
  },
});

export default { LinearProgress, CircularProgress, RadialProgress, StepProgress };







