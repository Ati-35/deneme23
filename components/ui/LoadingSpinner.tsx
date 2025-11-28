// Loading Spinner Component
// Used for displaying loading states across the app

import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Text,
} from 'react-native';
import Colors, { SemanticColors, Palette } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/DesignTokens';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'large',
  color = Palette.primary[500],
  message,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.overlay}>
        {content}
      </View>
    );
  }

  return content;
}

// Skeleton Loader for placeholder content
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

// Skeleton Card for card placeholders
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.skeletonCard, style]}>
      <Skeleton width={60} height={60} borderRadius={30} />
      <View style={styles.skeletonContent}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={14} style={{ marginTop: Spacing.xs }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  message: {
    ...Typography.body,
    color: SemanticColors.text.secondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  skeleton: {
    backgroundColor: SemanticColors.background.secondary,
    overflow: 'hidden',
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: SemanticColors.background.card,
    borderRadius: 12,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});

export default LoadingSpinner;



