// Animated Components
// Custom animations using React Native Animated and Reanimated

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { BorderRadius, Duration } from '../../constants/DesignTokens';

// Pulse Animation Component
interface PulseAnimationProps {
  children: React.ReactNode;
  duration?: number;
  minScale?: number;
  maxScale?: number;
  style?: ViewStyle;
}

export function PulseAnimation({
  children,
  duration = 1500,
  minScale = 1,
  maxScale = 1.05,
  style,
}: PulseAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scaleAnim, duration, minScale, maxScale]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Breathing Circle Animation (for crisis mode)
interface BreathingCircleProps {
  size?: number;
  color?: string;
  phase: 'inhale' | 'hold' | 'exhale';
  duration?: number;
}

export function BreathingCircle({
  size = 200,
  color = Palette.primary[500],
  phase,
  duration = 4000,
}: BreathingCircleProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    switch (phase) {
      case 'inhale':
        animation = Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration,
            useNativeDriver: true,
          }),
        ]);
        break;
      case 'hold':
        // Keep current values
        animation = Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(opacityAnim, {
                toValue: 0.9,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0.7,
                duration: 500,
                useNativeDriver: true,
              }),
            ])
          ),
        ]);
        break;
      case 'exhale':
        animation = Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration,
            useNativeDriver: true,
          }),
        ]);
        break;
    }

    animation.start();

    return () => animation.stop();
  }, [phase, duration, scaleAnim, opacityAnim]);

  return (
    <View style={[styles.breathingContainer, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.breathingCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View style={styles.breathingTextContainer}>
        <Text style={styles.breathingText}>
          {phase === 'inhale' ? 'Nefes Al' : phase === 'hold' ? 'Tut' : 'Nefes Ver'}
        </Text>
      </View>
    </View>
  );
}

// Fade In Animation
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export function FadeIn({
  children,
  delay = 0,
  duration = Duration.normal,
  style,
}: FadeInProps) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, translateYAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Staggered List Animation
interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
  itemDelay?: number;
  style?: ViewStyle;
}

export function StaggeredList({
  children,
  delay = 0,
  itemDelay = 100,
  style,
}: StaggeredListProps) {
  return (
    <View style={style}>
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={delay + index * itemDelay}>
          {child}
        </FadeIn>
      ))}
    </View>
  );
}

// Counter Animation (for statistics)
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: ViewStyle;
  textStyle?: object;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  style,
  textStyle,
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    animatedValue.setValue(0);
    
    const animation = Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    const listener = animatedValue.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v));
    });

    animation.start();

    return () => {
      animation.stop();
      animatedValue.removeListener(listener);
    };
  }, [value, duration, animatedValue]);

  return (
    <View style={style}>
      <Text style={[styles.counterText, textStyle]}>
        {prefix}{displayValue}{suffix}
      </Text>
    </View>
  );
}

// Shimmer Effect (for loading states)
interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Shimmer({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: ShimmerProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.shimmerContainer,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerGradient,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            withAlpha('#FFFFFF', 0.3),
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

// Ripple Effect
interface RippleProps {
  color?: string;
  size?: number;
  duration?: number;
  onComplete?: () => void;
}

export function Ripple({
  color = Palette.primary[500],
  size = 100,
  duration = 600,
  onComplete,
}: RippleProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start(onComplete);
  }, [scaleAnim, opacityAnim, duration, onComplete]);

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
}

// Progress Ring (Animated circular progress)
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  color = Palette.primary[500],
  children,
}: ProgressRingProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: Duration.slower,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.progressRingBg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: withAlpha(color, 0.2),
          },
        ]}
      />
      {/* Content */}
      <View style={styles.progressRingContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircle: {
    position: 'absolute',
  },
  breathingTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingText: {
    fontSize: 24,
    fontWeight: '700',
    color: SemanticColors.text.primary,
  },
  counterText: {
    fontSize: 32,
    fontWeight: '800',
    color: SemanticColors.text.primary,
  },
  shimmerContainer: {
    backgroundColor: withAlpha(Palette.neutral[500], 0.2),
    overflow: 'hidden',
  },
  shimmerGradient: {
    width: 200,
    height: '100%',
  },
  ripple: {
    position: 'absolute',
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingBg: {
    position: 'absolute',
  },
  progressRingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default {
  PulseAnimation,
  BreathingCircle,
  FadeIn,
  StaggeredList,
  AnimatedCounter,
  Shimmer,
  Ripple,
  ProgressRing,
};







