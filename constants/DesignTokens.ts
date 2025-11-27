// Design Tokens
// Unified design system constants for spacing, borders, animations

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Spacing scale (based on 4px grid)
export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
  '8xl': 128,
};

// Border radius scale
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Border widths
export const BorderWidth = {
  none: 0,
  hairline: 0.5,
  thin: 1,
  thick: 2,
  extraThick: 4,
};

// Icon sizes
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  base: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

// Avatar/Image sizes
export const AvatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  base: 48,
  lg: 56,
  xl: 64,
  '2xl': 80,
  '3xl': 96,
  '4xl': 128,
};

// Component heights
export const ComponentHeight = {
  // Buttons
  buttonSmall: 32,
  buttonMedium: 44,
  buttonLarge: 52,
  
  // Inputs
  inputSmall: 36,
  inputMedium: 48,
  inputLarge: 56,
  
  // Tab bar
  tabBar: Platform.OS === 'ios' ? 88 : 70,
  tabBarPaddingBottom: Platform.OS === 'ios' ? 30 : 10,
  
  // Headers
  headerSmall: 44,
  headerMedium: 56,
  headerLarge: 64,
  
  // Cards
  cardMinHeight: 80,
  cardImageHeight: 180,
  
  // List items
  listItemSmall: 48,
  listItemMedium: 60,
  listItemLarge: 72,
};

// Screen dimensions
export const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  padding: Spacing.lg,
  maxContentWidth: 428, // iPhone 14 Pro Max width
};

// Animation durations
export const Duration = {
  instant: 0,
  fastest: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
  // Complex animations
  pageTransition: 350,
  modalOpen: 300,
  modalClose: 200,
  ripple: 400,
  skeleton: 1500,
};

// Animation easing (for Animated API)
export const Easing = {
  // Standard easings
  linear: [0, 0, 1, 1] as const,
  easeIn: [0.42, 0, 1, 1] as const,
  easeOut: [0, 0, 0.58, 1] as const,
  easeInOut: [0.42, 0, 0.58, 1] as const,
  
  // Emphasized easings
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1] as const,
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15] as const,
  
  // Spring-like
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
};

// Opacity levels
export const Opacity = {
  transparent: 0,
  disabled: 0.38,
  medium: 0.54,
  high: 0.87,
  full: 1,
  
  // Overlay opacities
  overlayLight: 0.3,
  overlayMedium: 0.5,
  overlayHeavy: 0.7,
  overlayDark: 0.85,
  
  // Hover/Press states
  hover: 0.08,
  focus: 0.12,
  pressed: 0.16,
  selected: 0.24,
};

// Z-index layers
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
};

// Hit slop (for touchable areas)
export const HitSlop = {
  small: { top: 4, right: 4, bottom: 4, left: 4 },
  medium: { top: 8, right: 8, bottom: 8, left: 8 },
  large: { top: 12, right: 12, bottom: 12, left: 12 },
  extraLarge: { top: 16, right: 16, bottom: 16, left: 16 },
};

// Card variants configuration
export const CardConfig = {
  // Padding variants
  padding: {
    compact: Spacing.md,
    normal: Spacing.base,
    relaxed: Spacing.xl,
  },
  
  // Border radius variants
  radius: {
    sharp: BorderRadius.sm,
    normal: BorderRadius.lg,
    round: BorderRadius.xl,
  },
  
  // Gap between cards
  gap: {
    compact: Spacing.sm,
    normal: Spacing.md,
    relaxed: Spacing.base,
  },
};

// Button variants configuration
export const ButtonConfig = {
  // Size configurations
  sizes: {
    small: {
      height: ComponentHeight.buttonSmall,
      paddingHorizontal: Spacing.md,
      iconSize: IconSize.sm,
      fontSize: 12,
    },
    medium: {
      height: ComponentHeight.buttonMedium,
      paddingHorizontal: Spacing.base,
      iconSize: IconSize.md,
      fontSize: 14,
    },
    large: {
      height: ComponentHeight.buttonLarge,
      paddingHorizontal: Spacing.xl,
      iconSize: IconSize.base,
      fontSize: 16,
    },
  },
  
  // Border radius
  radius: {
    square: BorderRadius.sm,
    rounded: BorderRadius.md,
    pill: BorderRadius.full,
  },
};

// Safe area insets (approximate, actual values from useSafeAreaInsets)
export const SafeArea = {
  top: Platform.OS === 'ios' ? 44 : 24,
  bottom: Platform.OS === 'ios' ? 34 : 0,
  left: 0,
  right: 0,
};

export default {
  Spacing,
  BorderRadius,
  BorderWidth,
  IconSize,
  AvatarSize,
  ComponentHeight,
  Screen,
  Duration,
  Easing,
  Opacity,
  ZIndex,
  HitSlop,
  CardConfig,
  ButtonConfig,
  SafeArea,
};




