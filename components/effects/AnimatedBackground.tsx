import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, withAlpha, Gradients } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'gradient' | 'mesh' | 'aurora';
  primaryColor?: string;
  secondaryColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

// Particle configuration
const PARTICLE_COUNT = 12;
const PARTICLE_COLORS = [
  Palette.primary[500],
  Palette.secondary[500],
  Palette.accent[500],
  Palette.purple[500],
];

export function AnimatedBackground({
  variant = 'particles',
  primaryColor = Palette.primary[500],
  secondaryColor = Palette.primary[600],
  intensity = 'medium',
}: AnimatedBackgroundProps) {
  const particleAnims = useRef(
    [...Array(PARTICLE_COUNT)].map(() => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0.5),
    }))
  ).current;

  const gradientAnim = useRef(new Animated.Value(0)).current;
  const auroraAnims = useRef(
    [...Array(4)].map(() => ({
      position: new Animated.Value(0),
      opacity: new Animated.Value(0.3),
    }))
  ).current;

  useEffect(() => {
    if (variant === 'particles' || variant === 'mesh') {
      startParticleAnimations();
    }
    if (variant === 'gradient' || variant === 'aurora') {
      startGradientAnimation();
    }
    if (variant === 'aurora') {
      startAuroraAnimations();
    }
  }, [variant]);

  const startParticleAnimations = () => {
    particleAnims.forEach((anim, index) => {
      const duration = 3000 + Math.random() * 4000;
      const delay = index * 200;

      // Vertical float
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.translateY, {
            toValue: -30 - Math.random() * 20,
            duration: duration,
            delay: delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Horizontal drift
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.translateX, {
            toValue: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15),
            duration: duration * 1.3,
            delay: delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: 0,
            duration: duration * 1.3,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scale pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.scale, {
            toValue: 1.2 + Math.random() * 0.3,
            duration: duration * 0.8,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: duration * 0.8,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Opacity fade
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.opacity, {
            toValue: 0.15 + Math.random() * 0.1,
            duration: duration,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0.05,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const startGradientAnimation = () => {
    Animated.loop(
      Animated.timing(gradientAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const startAuroraAnimations = () => {
    auroraAnims.forEach((anim, index) => {
      const duration = 6000 + index * 2000;

      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.position, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim.position, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.opacity, {
            toValue: 0.6,
            duration: duration * 0.7,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0.2,
            duration: duration * 0.7,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const getIntensityMultiplier = () => {
    switch (intensity) {
      case 'low': return 0.5;
      case 'high': return 1.5;
      default: return 1;
    }
  };

  const renderParticles = () => {
    return particleAnims.map((anim, index) => {
      const size = 60 + Math.random() * 100;
      const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length];
      const left = (index / PARTICLE_COUNT) * 100;
      const top = Math.random() * 80;

      return (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              left: `${left}%`,
              top: `${top}%`,
              opacity: anim.opacity,
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                { scale: anim.scale },
              ],
            },
          ]}
        />
      );
    });
  };

  const renderMesh = () => {
    return (
      <View style={styles.meshContainer}>
        {particleAnims.slice(0, 6).map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.meshLine,
              {
                transform: [
                  { rotate: `${index * 30}deg` },
                  { translateX: anim.translateX },
                ],
                opacity: Animated.multiply(anim.opacity, 0.5),
              },
            ]}
          />
        ))}
        {renderParticles()}
      </View>
    );
  };

  const renderAurora = () => {
    return (
      <View style={styles.auroraContainer}>
        {auroraAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.auroraBand,
              {
                opacity: anim.opacity,
                transform: [{
                  translateY: anim.position.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50],
                  }),
                }],
                top: `${index * 20}%`,
                backgroundColor: index % 2 === 0 ? primaryColor : secondaryColor,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderGradient = () => {
    return (
      <Animated.View
        style={[
          styles.gradientContainer,
          {
            transform: [{
              rotate: gradientAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            withAlpha(primaryColor, 0.1),
            withAlpha(secondaryColor, 0.05),
            'transparent',
          ]}
          style={styles.gradientOrb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {variant === 'particles' && renderParticles()}
      {variant === 'mesh' && renderMesh()}
      {variant === 'aurora' && renderAurora()}
      {variant === 'gradient' && renderGradient()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
  },
  meshContainer: {
    flex: 1,
    position: 'relative',
  },
  meshLine: {
    position: 'absolute',
    width: width * 2,
    height: 1,
    backgroundColor: withAlpha(Palette.primary[500], 0.1),
    left: -width / 2,
    top: height / 2,
  },
  auroraContainer: {
    flex: 1,
    position: 'relative',
  },
  auroraBand: {
    position: 'absolute',
    width: width * 1.5,
    height: 200,
    left: -width * 0.25,
    borderRadius: 100,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOrb: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
  },
});

export default AnimatedBackground;

