import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SemanticColors, Palette, withAlpha, Gradients } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

interface ParticleProps {
  delay: number;
  size: number;
  color: string;
  startX: number;
  startY: number;
  duration: number;
}

const Particle = ({ delay, size, color, startX, startY, duration }: ParticleProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      translateX.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.5);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -height * 0.4,
          duration: duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 100,
          duration: duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
          delay,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: duration * 0.2,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.8,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: duration * 0.5,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(scale, {
            toValue: 0.3,
            duration: duration * 0.5,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          left: startX,
          top: startY,
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface ParticleBackgroundProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'cosmic' | 'ocean' | 'forest';
  particleCount?: number;
  children?: React.ReactNode;
}

export default function ParticleBackground({ 
  variant = 'default', 
  particleCount = 20,
  children 
}: ParticleBackgroundProps) {
  const gradientColors = {
    default: [SemanticColors.background.primary, SemanticColors.background.secondary] as const,
    success: [withAlpha(Palette.success[900], 0.95), SemanticColors.background.primary] as const,
    warning: [withAlpha(Palette.warning[900], 0.95), SemanticColors.background.primary] as const,
    error: [withAlpha(Palette.error[900], 0.95), SemanticColors.background.primary] as const,
    cosmic: [withAlpha('#1a0a2e', 0.98), withAlpha('#16213e', 0.95), SemanticColors.background.primary] as const,
    ocean: [withAlpha('#0a192f', 0.98), withAlpha('#112240', 0.95)] as const,
    forest: [withAlpha('#0d1f0d', 0.98), withAlpha('#1a2f1a', 0.95)] as const,
  };

  const particleColors = {
    default: [Palette.primary[400], Palette.secondary[400], Palette.accent[400]],
    success: [Palette.success[400], Palette.primary[400], Palette.success[300]],
    warning: [Palette.warning[400], Palette.accent[400], Palette.warning[300]],
    error: [Palette.error[400], Palette.accent[400], Palette.error[300]],
    cosmic: [Palette.purple[400], Palette.info[400], '#ff6b9d', '#c44cff'],
    ocean: [Palette.secondary[400], Palette.info[400], '#64f4f4'],
    forest: [Palette.primary[400], Palette.success[400], '#7fff7f'],
  };

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    delay: Math.random() * 5000,
    size: Math.random() * 6 + 3,
    color: withAlpha(
      particleColors[variant][Math.floor(Math.random() * particleColors[variant].length)],
      0.6
    ),
    startX: Math.random() * width,
    startY: height * 0.6 + Math.random() * height * 0.4,
    duration: 8000 + Math.random() * 4000,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors[variant] as unknown as [string, string, ...string[]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Ambient glow effects */}
      <View style={styles.glowContainer}>
        <View style={[styles.glowOrb, styles.glowOrb1, { backgroundColor: withAlpha(particleColors[variant][0], 0.15) }]} />
        <View style={[styles.glowOrb, styles.glowOrb2, { backgroundColor: withAlpha(particleColors[variant][1], 0.1) }]} />
        <View style={[styles.glowOrb, styles.glowOrb3, { backgroundColor: withAlpha(particleColors[variant][2] || particleColors[variant][0], 0.08) }]} />
      </View>

      {/* Particles */}
      {particles.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowOrb1: {
    width: 300,
    height: 300,
    top: -100,
    left: -100,
    transform: [{ scale: 1.5 }],
  },
  glowOrb2: {
    width: 250,
    height: 250,
    top: height * 0.3,
    right: -80,
    transform: [{ scale: 1.8 }],
  },
  glowOrb3: {
    width: 200,
    height: 200,
    bottom: height * 0.2,
    left: -60,
    transform: [{ scale: 2 }],
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});

