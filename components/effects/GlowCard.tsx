import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SemanticColors, Palette, withAlpha, Shadows } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/DesignTokens';

interface GlowCardProps {
  children: React.ReactNode;
  glowColor?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  variant?: 'glass' | 'solid' | 'gradient' | 'neon';
  gradientColors?: readonly string[];
  style?: ViewStyle;
  padding?: number;
}

export default function GlowCard({
  children,
  glowColor = Palette.primary[500],
  intensity = 'medium',
  variant = 'glass',
  gradientColors,
  style,
  padding = Spacing.lg,
}: GlowCardProps) {
  const intensityValues = {
    subtle: { blur: 0.1, shadow: 0.15 },
    medium: { blur: 0.15, shadow: 0.25 },
    strong: { blur: 0.2, shadow: 0.4 },
  };

  const { blur, shadow } = intensityValues[intensity];

  const renderContent = () => {
    switch (variant) {
      case 'glass':
        return (
          <View style={[styles.glassCard, { padding }]}>
            <View style={[styles.glassBorder, { borderColor: withAlpha(glowColor, 0.3) }]} />
            <View style={styles.glassContent}>
              {children}
            </View>
          </View>
        );
      
      case 'gradient':
        return (
          <LinearGradient
            colors={gradientColors as [string, string] || [withAlpha(glowColor, 0.2), withAlpha(glowColor, 0.05)]}
            style={[styles.gradientCard, { padding }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {children}
          </LinearGradient>
        );

      case 'neon':
        return (
          <View style={[styles.neonCard, { padding }]}>
            <View style={[styles.neonBorder, { 
              borderColor: glowColor,
              shadowColor: glowColor,
            }]} />
            <View style={styles.neonContent}>
              {children}
            </View>
          </View>
        );
      
      default:
        return (
          <View style={[styles.solidCard, { padding }]}>
            {children}
          </View>
        );
    }
  };

  return (
    <View style={[
      styles.container,
      {
        shadowColor: glowColor,
        shadowOpacity: shadow,
      },
      style,
    ]}>
      {/* Glow layer */}
      <View style={[
        styles.glowLayer,
        { backgroundColor: withAlpha(glowColor, blur) },
      ]} />
      
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
    transform: [{ scale: 1.02 }],
  },
  glassCard: {
    backgroundColor: withAlpha(SemanticColors.surface.default, 0.7),
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  glassContent: {
    position: 'relative',
    zIndex: 1,
  },
  gradientCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: withAlpha('#fff', 0.1),
  },
  solidCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  neonCard: {
    backgroundColor: SemanticColors.background.secondary,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  neonBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  neonContent: {
    position: 'relative',
    zIndex: 1,
  },
});

