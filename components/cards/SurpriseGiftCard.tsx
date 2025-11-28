// Surprise Gift Card Component
// Günlük sürpriz hediye kartı

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { ScalePressable } from '../interactions';

interface Gift {
  type: 'xp' | 'badge' | 'quote' | 'tip';
  title: string;
  description: string;
  value?: number;
  icon: string;
  color: string;
}

interface SurpriseGiftCardProps {
  isAvailable: boolean;
  onClaim: () => Gift;
  style?: object;
}

export const SurpriseGiftCard: React.FC<SurpriseGiftCardProps> = ({
  isAvailable,
  onClaim,
  style,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [gift, setGift] = useState<Gift | null>(null);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isAvailable && !isOpened) {
      // Shake animation
      const shakeAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ])
      );

      // Glow animation
      const glowAnimation = Animated.loop(
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
      );

      shakeAnimation.start();
      glowAnimation.start();

      return () => {
        shakeAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [isAvailable, isOpened]);

  const handleOpen = () => {
    if (!isAvailable || isOpened) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Opening animation
    Animated.sequence([
      // Grow and rotate
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Shrink back
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Reveal content
    setTimeout(() => {
      const claimedGift = onClaim();
      setGift(claimedGift);
      setIsOpened(true);

      Animated.spring(revealAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 300);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  const shake = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  if (!isAvailable && !isOpened) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <ScalePressable onPress={handleOpen} disabled={isOpened}>
        <LinearGradient
          colors={isOpened 
            ? [withAlpha(gift?.color || Palette.warning[500], 0.15), withAlpha(gift?.color || Palette.warning[500], 0.05)]
            : Gradients.gold as [string, string]
          }
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {!isOpened ? (
            // Closed gift state
            <Animated.View
              style={[
                styles.closedContent,
                {
                  transform: [
                    { scale: scaleAnim },
                    { rotate },
                    { rotate: shake },
                  ],
                },
              ]}
            >
              {/* Glow effect */}
              <Animated.View
                style={[
                  styles.glow,
                  {
                    opacity: glowAnim,
                  },
                ]}
              />

              <View style={styles.giftIconContainer}>
                <Text style={styles.giftEmoji}>🎁</Text>
              </View>
              <Text style={styles.closedTitle}>Sürpriz!</Text>
              <Text style={styles.closedSubtitle}>Bugün için özel bir hediye var</Text>
              <View style={styles.openButton}>
                <Text style={styles.openButtonText}>Aç</Text>
                <Ionicons name="gift-outline" size={16} color="#FFFFFF" />
              </View>
            </Animated.View>
          ) : (
            // Opened gift state
            <Animated.View
              style={[
                styles.openedContent,
                {
                  opacity: revealAnim,
                  transform: [
                    {
                      scale: revealAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.giftResultIcon, { backgroundColor: withAlpha(gift?.color || Palette.warning[500], 0.2) }]}>
                <Text style={styles.giftResultEmoji}>{gift?.icon}</Text>
              </View>
              <Text style={styles.openedTitle}>{gift?.title}</Text>
              <Text style={styles.openedDescription}>{gift?.description}</Text>
              {gift?.value && (
                <View style={[styles.valueBadge, { backgroundColor: withAlpha(gift.color, 0.2) }]}>
                  <Ionicons name="star" size={16} color={gift.color} />
                  <Text style={[styles.valueText, { color: gift.color }]}>+{gift.value} XP</Text>
                </View>
              )}
              <Text style={styles.claimedText}>✓ Hediye alındı!</Text>
            </Animated.View>
          )}
        </LinearGradient>
      </ScalePressable>
    </View>
  );
};

// Random gift generator
export const generateRandomGift = (): Gift => {
  const gifts: Gift[] = [
    {
      type: 'xp',
      title: 'Bonus XP!',
      description: 'Günlük hediye olarak ekstra XP kazandın!',
      value: 25 + Math.floor(Math.random() * 25),
      icon: '⭐',
      color: Palette.warning[500],
    },
    {
      type: 'quote',
      title: 'Motivasyon Sözü',
      description: '"Başarı, her gün küçük çabaların toplamıdır."',
      icon: '💬',
      color: Palette.accent[500],
    },
    {
      type: 'tip',
      title: 'Günün İpucu',
      description: 'Sigara isteği geldiğinde bir bardak su iç ve derin nefes al.',
      icon: '💡',
      color: Palette.primary[500],
    },
    {
      type: 'xp',
      title: 'Süper Bonus!',
      description: 'Bugün şanslı günün! Ekstra XP kazandın!',
      value: 50 + Math.floor(Math.random() * 50),
      icon: '🌟',
      color: Palette.success[500],
    },
  ];

  return gifts[Math.floor(Math.random() * gifts.length)];
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  // Closed state
  closedContent: {
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Palette.warning[500],
    top: -10,
  },
  giftIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  giftEmoji: {
    fontSize: 48,
  },
  closedTitle: {
    ...Typography.heading.h3,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  closedSubtitle: {
    ...Typography.body.small,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  openButtonText: {
    ...Typography.button.medium,
    color: '#FFFFFF',
  },
  // Opened state
  openedContent: {
    alignItems: 'center',
  },
  giftResultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  giftResultEmoji: {
    fontSize: 36,
  },
  openedTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  openedDescription: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  valueText: {
    ...Typography.label.medium,
    fontWeight: '700',
  },
  claimedText: {
    ...Typography.caption.medium,
    color: Palette.success[500],
  },
});

export default SurpriseGiftCard;

