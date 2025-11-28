// Confetti & Celebration Effects
// Başarı, seviye atlama ve milestone kutlamaları için animasyonlu efektler

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Palette, withAlpha } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/DesignTokens';

const { width, height } = Dimensions.get('window');

// Confetti Particle
interface ConfettiParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'star';
}

// Colors for confetti
const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
  '#A855F7', '#3B82F6', '#22C55E', '#F97316',
  '#EC4899', '#8B5CF6', '#06B6D4', '#10B981',
];

// Confetti Component
interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

export function Confetti({
  active,
  duration = 3000,
  particleCount = 50,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (active) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const newParticles: ConfettiParticle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        const particle: ConfettiParticle = {
          id: i,
          x: new Animated.Value(Math.random() * width),
          y: new Animated.Value(-50),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(Math.random() * 0.5 + 0.5),
          opacity: new Animated.Value(1),
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          size: Math.random() * 10 + 5,
          shape: ['square', 'circle', 'star'][Math.floor(Math.random() * 3)] as any,
        };
        newParticles.push(particle);
      }
      
      setParticles(newParticles);
      
      // Animate particles
      newParticles.forEach((particle, index) => {
        const delay = Math.random() * 500;
        const fallDuration = duration + Math.random() * 1000;
        
        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: height + 100,
            duration: fallDuration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: particle.x._value + (Math.random() - 0.5) * 200,
            duration: fallDuration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 10,
            duration: fallDuration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: fallDuration,
            delay: delay + fallDuration * 0.7,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration + 1500);
    }
  }, [active]);

  if (!active && particles.length === 0) return null;

  return (
    <View style={[styles.confettiContainer, { pointerEvents: 'none' }]}>
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.confettiParticle,
            {
              backgroundColor: particle.shape !== 'star' ? particle.color : 'transparent',
              width: particle.size,
              height: particle.size,
              borderRadius: particle.shape === 'circle' ? particle.size / 2 : 2,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 10],
                    outputRange: ['0deg', '3600deg'],
                  }),
                },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          {particle.shape === 'star' && (
            <Text style={{ fontSize: particle.size, color: particle.color }}>⭐</Text>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

// Celebration Modal
interface CelebrationModalProps {
  visible: boolean;
  type: 'achievement' | 'levelUp' | 'milestone' | 'streak';
  title: string;
  subtitle?: string;
  icon?: string;
  xpEarned?: number;
  onClose: () => void;
}

export function CelebrationModal({
  visible,
  type,
  title,
  subtitle,
  icon = '🎉',
  xpEarned,
  onClose,
}: CelebrationModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getGradient = () => {
    switch (type) {
      case 'achievement':
        return ['#F59E0B', '#D97706'];
      case 'levelUp':
        return ['#8B5CF6', '#6366F1'];
      case 'milestone':
        return ['#10B981', '#059669'];
      case 'streak':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#3B82F6', '#2563EB'];
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        
        <Animated.View
          style={[
            styles.celebrationCard,
            {
              transform: [{ scale: scaleAnim }, { rotate: spin }],
            },
          ]}
        >
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowAnim,
                backgroundColor: getGradient()[0],
              },
            ]}
          />
          
          <LinearGradient
            colors={getGradient() as [string, string]}
            style={styles.celebrationGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.celebrationContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.celebrationIcon}>{icon}</Text>
              </View>
              
              <Text style={styles.celebrationTitle}>{title}</Text>
              {subtitle && <Text style={styles.celebrationSubtitle}>{subtitle}</Text>}
              
              {xpEarned && (
                <View style={styles.xpBadge}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.xpText}>+{xpEarned} XP</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Harika! 🎉</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Fireworks Effect
interface FireworksProps {
  active: boolean;
  onComplete?: () => void;
}

export function Fireworks({ active, onComplete }: FireworksProps) {
  const [explosions, setExplosions] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (active) {
      const newExplosions = [];
      for (let i = 0; i < 5; i++) {
        newExplosions.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * (height / 2) + 100,
        });
      }
      setExplosions(newExplosions);
      
      setTimeout(() => {
        setExplosions([]);
        onComplete?.();
      }, 2000);
    }
  }, [active]);

  if (!active && explosions.length === 0) return null;

  return (
    <View style={[styles.fireworksContainer, { pointerEvents: 'none' }]}>
      {explosions.map((explosion) => (
        <FireworkExplosion key={explosion.id} x={explosion.x} y={explosion.y} />
      ))}
    </View>
  );
}

// Single Firework Explosion
function FireworkExplosion({ x, y }: { x: number; y: number }) {
  const particles = useRef(
    [...Array(12)].map(() => ({
      anim: new Animated.Value(0),
      angle: Math.random() * Math.PI * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    }))
  ).current;

  useEffect(() => {
    particles.forEach((particle) => {
      Animated.timing(particle.anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <View style={[styles.explosionContainer, { left: x, top: y }]}>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.fireworkParticle,
            {
              backgroundColor: particle.color,
              transform: [
                {
                  translateX: particle.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.cos(particle.angle) * 80],
                  }),
                },
                {
                  translateY: particle.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.sin(particle.angle) * 80],
                  }),
                },
                {
                  scale: particle.anim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                },
              ],
              opacity: particle.anim.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [1, 1, 0],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

// Sparkle Effect (for achievements)
interface SparkleProps {
  active: boolean;
  color?: string;
}

export function Sparkle({ active, color = '#FFD700' }: SparkleProps) {
  const sparkles = useRef(
    [...Array(8)].map(() => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
    }))
  ).current;

  useEffect(() => {
    if (active) {
      sparkles.forEach((sparkle, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 100),
            Animated.parallel([
              Animated.timing(sparkle.opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.scale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(sparkle.opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.scale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      });
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={[styles.sparkleContainer, { pointerEvents: 'none' }]}>
      {sparkles.map((sparkle, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.sparkle,
            {
              left: `${50 + sparkle.x}%`,
              top: `${50 + sparkle.y}%`,
              opacity: sparkle.opacity,
              transform: [{ scale: sparkle.scale }],
              color,
            },
          ]}
        >
          ✨
        </Animated.Text>
      ))}
    </View>
  );
}

// Pulse Ring Effect
interface PulseRingProps {
  active: boolean;
  color?: string;
  size?: number;
}

export function PulseRing({ active, color = Palette.primary[500], size = 100 }: PulseRingProps) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const animateRing = (ring: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(ring, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(ring, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateRing(ring1, 0);
      animateRing(ring2, 666);
      animateRing(ring3, 1333);
    }
  }, [active]);

  if (!active) return null;

  const renderRing = (anim: Animated.Value) => (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2],
              }),
            },
          ],
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 0],
          }),
        },
      ]}
    />
  );

  return (
    <View style={[styles.pulseContainer, { pointerEvents: 'none' }]}>
      {renderRing(ring1)}
      {renderRing(ring2)}
      {renderRing(ring3)}
    </View>
  );
}

const styles = StyleSheet.create({
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  confettiParticle: {
    position: 'absolute',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationCard: {
    width: width * 0.85,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: BorderRadius['2xl'],
    opacity: 0.3,
  },
  celebrationGradient: {
    padding: Spacing['2xl'],
  },
  celebrationContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: withAlpha('#FFFFFF', 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  celebrationIcon: {
    fontSize: 48,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha('#000000', 0.2),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  closeButton: {
    backgroundColor: withAlpha('#FFFFFF', 0.2),
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: withAlpha('#FFFFFF', 0.3),
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  fireworksContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  explosionContainer: {
    position: 'absolute',
    width: 160,
    height: 160,
    marginLeft: -80,
    marginTop: -80,
  },
  fireworkParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: 76,
    top: 76,
  },
  
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
  
  pulseContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 998,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
});

export default {
  Confetti,
  CelebrationModal,
  Fireworks,
  Sparkle,
  PulseRing,
};

