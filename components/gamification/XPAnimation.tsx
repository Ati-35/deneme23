// XP Animation Component
// XP kazanma animasyonu - floating text + particles

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Palette, withAlpha } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface XPAnimationProps {
  amount: number;
  visible: boolean;
  onComplete?: () => void;
  position?: { x: number; y: number };
  color?: string;
}

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  color: string;
}

export const XPAnimation: React.FC<XPAnimationProps> = ({
  amount,
  visible,
  onComplete,
  position = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
  color = Palette.warning[500],
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const textY = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.5)).current;
  const starScale = useRef(new Animated.Value(0)).current;

  const PARTICLE_COLORS = [
    Palette.warning[400],
    Palette.warning[500],
    Palette.warning[600],
    '#FFD700',
    '#FFA500',
  ];

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset animations
      textY.setValue(0);
      textOpacity.setValue(0);
      textScale.setValue(0.5);
      starScale.setValue(0);

      // Create particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          id: i,
          x: new Animated.Value(0),
          y: new Animated.Value(0),
          scale: new Animated.Value(0),
          opacity: new Animated.Value(1),
          rotation: new Animated.Value(0),
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
      }
      setParticles(newParticles);

      // Main text animation
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(textScale, {
              toValue: 1.2,
              tension: 200,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
          Animated.spring(textScale, {
            toValue: 1,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(textY, {
          toValue: -80,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setParticles([]);
        onComplete?.();
      });

      // Star animation
      Animated.sequence([
        Animated.delay(100),
        Animated.spring(starScale, {
          toValue: 1,
          tension: 300,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(starScale, {
          toValue: 0,
          duration: 300,
          delay: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Particle animations
      newParticles.forEach((particle, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;

        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: targetX,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: targetY,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.spring(particle.scale, {
              toValue: 1,
              tension: 300,
              friction: 10,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 4 - 2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { left: position.x - 50, top: position.y - 50 }]} pointerEvents="none">
      {/* Particles */}
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [-2, 2],
                    outputRange: ['-180deg', '180deg'],
                  }),
                },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}

      {/* Star */}
      <Animated.View
        style={[
          styles.starContainer,
          {
            transform: [{ scale: starScale }],
          },
        ]}
      >
        <Ionicons name="star" size={24} color={Palette.warning[500]} />
      </Animated.View>

      {/* XP Text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [
              { translateY: textY },
              { scale: textScale },
            ],
          },
        ]}
      >
        <View style={[styles.xpBadge, { backgroundColor: withAlpha(color, 0.2) }]}>
          <Ionicons name="star" size={16} color={color} />
          <Text style={[styles.xpText, { color }]}>+{amount} XP</Text>
        </View>
      </Animated.View>
    </View>
  );
};

// XP Toast - appears at top of screen
interface XPToastProps {
  amount: number;
  message?: string;
  visible: boolean;
  onComplete?: () => void;
}

export const XPToast: React.FC<XPToastProps> = ({
  amount,
  message = 'XP Kazandın!',
  visible,
  onComplete,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 60,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => onComplete?.());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <View style={styles.toastIcon}>
          <Ionicons name="star" size={20} color={Palette.warning[500]} />
        </View>
        <View style={styles.toastTextContainer}>
          <Text style={styles.toastMessage}>{message}</Text>
          <Text style={styles.toastAmount}>+{amount} XP</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  starContainer: {
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  xpText: {
    ...Typography.label.large,
    fontWeight: '800',
  },
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.warning[500], 0.95),
    borderRadius: 16,
    padding: 12,
    shadowColor: Palette.warning[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastMessage: {
    ...Typography.caption.large,
    color: '#fff',
    fontWeight: '500',
  },
  toastAmount: {
    ...Typography.heading.h4,
    color: '#fff',
    fontWeight: '800',
  },
});

export default XPAnimation;

