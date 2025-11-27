import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Gradients } from '../../constants/Colors';
import { BorderRadius } from '../../constants/DesignTokens';

interface AnimatedGradientProps {
  colors?: readonly string[];
  style?: ViewStyle;
  children?: React.ReactNode;
  animated?: boolean;
  borderRadius?: number;
}

export default function AnimatedGradient({
  colors = Gradients.primaryVibrant,
  style,
  children,
  animated = true,
  borderRadius = BorderRadius.xl,
}: AnimatedGradientProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    const rotateAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    rotateAnimation.start();
    scaleAnimation.start();

    return () => {
      rotateAnimation.stop();
      scaleAnimation.stop();
    };
  }, [animated]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { borderRadius },
        animated && {
          transform: [
            { rotate: rotation },
            { scale: scaleAnim },
          ],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        style={[styles.gradient, { borderRadius }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );
}

// Animated border gradient component
export function AnimatedBorderGradient({
  children,
  borderWidth = 2,
  borderRadius = BorderRadius.xl,
  colors = Gradients.primaryVibrant,
  style,
}: {
  children: React.ReactNode;
  borderWidth?: number;
  borderRadius?: number;
  colors?: readonly string[];
  style?: ViewStyle;
}) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.borderContainer,
        { borderRadius, padding: borderWidth },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            transform: [{ rotate: rotation }],
            overflow: 'hidden',
          },
        ]}
      >
        <LinearGradient
          colors={colors as [string, string, ...string[]]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.innerContent, { borderRadius: borderRadius - borderWidth }]}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  borderContainer: {
    overflow: 'hidden',
  },
  innerContent: {
    flex: 1,
    overflow: 'hidden',
  },
});

