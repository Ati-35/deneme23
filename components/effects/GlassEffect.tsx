// Glass Effect Components
// Glassmorphism and blur effect components

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SemanticColors, Palette, withAlpha } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/DesignTokens';

// Note: For full blur effects, install @react-native-community/blur
// This implementation uses gradient overlays for cross-platform compatibility

// Glass Container
interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  tint?: 'light' | 'dark';
  style?: ViewStyle;
  padding?: 'none' | 'compact' | 'normal' | 'relaxed';
  borderRadius?: number;
}

export function GlassContainer({
  children,
  intensity = 'medium',
  tint = 'dark',
  style,
  padding = 'normal',
  borderRadius = BorderRadius.lg,
}: GlassContainerProps) {
  const intensityValues = {
    light: { bg: 0.4, border: 0.08 },
    medium: { bg: 0.6, border: 0.12 },
    heavy: { bg: 0.85, border: 0.18 },
  };

  const paddingValues = {
    none: 0,
    compact: Spacing.md,
    normal: Spacing.base,
    relaxed: Spacing.xl,
  };

  const config = intensityValues[intensity];
  const baseColor = tint === 'dark' ? SemanticColors.background.card : '#FFFFFF';

  return (
    <View
      style={[
        styles.glassContainer,
        {
          backgroundColor: withAlpha(baseColor, config.bg),
          borderRadius,
          padding: paddingValues[padding],
          borderColor: withAlpha('#FFFFFF', config.border),
        },
        style,
      ]}
    >
      {/* Gradient overlay for glass effect */}
      <LinearGradient
        colors={[
          withAlpha('#FFFFFF', 0.1),
          withAlpha('#FFFFFF', 0.02),
        ]}
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {children}
    </View>
  );
}

// Glass Card with Header
interface GlassCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  headerIcon?: React.ReactNode;
}

export function GlassCard({
  title,
  subtitle,
  children,
  style,
  headerIcon,
}: GlassCardProps) {
  return (
    <GlassContainer style={[styles.glassCard, style]} padding="normal">
      {(title || subtitle || headerIcon) && (
        <View style={styles.glassCardHeader}>
          {headerIcon && <View style={styles.headerIconContainer}>{headerIcon}</View>}
          <View style={styles.headerTextContainer}>
            {title && <Text style={styles.glassCardTitle}>{title}</Text>}
            {subtitle && <Text style={styles.glassCardSubtitle}>{subtitle}</Text>}
          </View>
        </View>
      )}
      {children}
    </GlassContainer>
  );
}

// Frosted Glass Background
interface FrostedBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function FrostedBackground({ children, style }: FrostedBackgroundProps) {
  return (
    <View style={[styles.frostedBackground, style]}>
      <LinearGradient
        colors={[
          withAlpha(SemanticColors.background.secondary, 0.95),
          withAlpha(SemanticColors.background.primary, 0.98),
        ]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {children}
    </View>
  );
}

// Gradient Glass Button
interface GlassButtonProps {
  children: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export function GlassButton({
  children,
  onPress,
  variant = 'primary',
  style,
}: GlassButtonProps) {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [withAlpha(Palette.primary[500], 0.9), withAlpha(Palette.primary[600], 0.9)];
      case 'secondary':
        return [withAlpha(Palette.secondary[500], 0.9), withAlpha(Palette.secondary[600], 0.9)];
      case 'danger':
        return [withAlpha(Palette.error[500], 0.9), withAlpha(Palette.error[600], 0.9)];
      default:
        return [withAlpha(Palette.primary[500], 0.9), withAlpha(Palette.primary[600], 0.9)];
    }
  };

  return (
    <View style={[styles.glassButtonContainer, style]}>
      <LinearGradient
        colors={getGradientColors() as [string, string]}
        style={styles.glassButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glassButtonOverlay}>
          <Text style={styles.glassButtonText}>{children}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// Glass Stat Display
interface GlassStatProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export function GlassStat({
  value,
  label,
  icon,
  color = Palette.primary[500],
  style,
}: GlassStatProps) {
  return (
    <GlassContainer style={[styles.glassStat, style]} padding="normal" intensity="light">
      {icon && (
        <View style={[styles.glassStatIcon, { backgroundColor: withAlpha(color, 0.2) }]}>
          {icon}
        </View>
      )}
      <Text style={[styles.glassStatValue, { color }]}>{value}</Text>
      <Text style={styles.glassStatLabel}>{label}</Text>
    </GlassContainer>
  );
}

// Glass Notification Card
interface GlassNotificationProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function GlassNotification({
  title,
  message,
  type = 'info',
  icon,
  style,
}: GlassNotificationProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return Palette.success[500];
      case 'warning':
        return Palette.warning[500];
      case 'error':
        return Palette.error[500];
      default:
        return Palette.info[500];
    }
  };

  const typeColor = getTypeColor();

  return (
    <GlassContainer style={[styles.glassNotification, style]} padding="normal">
      <View style={[styles.notificationIndicator, { backgroundColor: typeColor }]} />
      <View style={styles.notificationContent}>
        {icon && <View style={styles.notificationIcon}>{icon}</View>}
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationMessage}>{message}</Text>
        </View>
      </View>
    </GlassContainer>
  );
}

// Gradient Overlay (for images/videos)
interface GradientOverlayProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'full';
  colors?: string[];
  style?: ViewStyle;
}

export function GradientOverlay({
  children,
  position = 'bottom',
  colors,
  style,
}: GradientOverlayProps) {
  const getDefaultColors = () => {
    switch (position) {
      case 'top':
        return ['rgba(0,0,0,0.8)', 'transparent'];
      case 'bottom':
        return ['transparent', 'rgba(0,0,0,0.8)'];
      case 'full':
        return ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)'];
      default:
        return ['transparent', 'rgba(0,0,0,0.8)'];
    }
  };

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return { top: 0, left: 0, right: 0, height: '50%' };
      case 'bottom':
        return { bottom: 0, left: 0, right: 0, height: '50%' };
      case 'full':
      default:
        return StyleSheet.absoluteFillObject;
    }
  };

  return (
    <View style={[styles.overlayContainer, style]}>
      {children}
      <LinearGradient
        colors={(colors || getDefaultColors()) as [string, string, ...string[]]}
        style={[styles.gradientOverlay, getPositionStyle()]}
        start={{ x: 0, y: position === 'top' ? 0 : 1 }}
        end={{ x: 0, y: position === 'top' ? 1 : 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Glass Container
  glassContainer: {
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  // Glass Card
  glassCard: {
    marginBottom: Spacing.md,
  },
  glassCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerIconContainer: {
    marginRight: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  glassCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SemanticColors.text.primary,
  },
  glassCardSubtitle: {
    fontSize: 14,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  
  // Frosted Background
  frostedBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  
  // Glass Button
  glassButtonContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  glassButtonGradient: {
    borderRadius: BorderRadius.md,
  },
  glassButtonOverlay: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Glass Stat
  glassStat: {
    alignItems: 'center',
    minWidth: 100,
  },
  glassStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  glassStatValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  glassStatLabel: {
    fontSize: 12,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
  },
  
  // Glass Notification
  glassNotification: {
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  notificationIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: Spacing.sm,
  },
  notificationIcon: {
    marginRight: Spacing.md,
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SemanticColors.text.primary,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: SemanticColors.text.secondary,
    lineHeight: 20,
  },
  
  // Gradient Overlay
  overlayContainer: {
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
  },
});

export default {
  GlassContainer,
  GlassCard,
  FrostedBackground,
  GlassButton,
  GlassStat,
  GlassNotification,
  GradientOverlay,
};







