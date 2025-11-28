// Design Tokens - 2025 Modern Design System
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Spacing scale (based on 4px grid)
export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  base: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 72,
  '6xl': 96,
  '7xl': 112,
  '8xl': 144,
};

// Border radius scale
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  '3xl': 36,
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
  xs: 14,
  sm: 18,
  md: 22,
  base: 26,
  lg: 30,
  xl: 36,
  '2xl': 44,
  '3xl': 52,
  '4xl': 68,
};

// Avatar/Image sizes
export const AvatarSize = {
  xs: 28,
  sm: 36,
  md: 44,
  base: 52,
  lg: 60,
  xl: 72,
  '2xl': 88,
  '3xl': 104,
  '4xl': 136,
};

// Component heights
export const ComponentHeight = {
  buttonSmall: 36,
  buttonMedium: 48,
  buttonLarge: 56,
  inputSmall: 40,
  inputMedium: 52,
  inputLarge: 60,
  tabBar: Platform.OS === 'ios' ? 88 : 72,
  tabBarPaddingBottom: Platform.OS === 'ios' ? 30 : 12,
  headerSmall: 48,
  headerMedium: 60,
  headerLarge: 72,
  cardMinHeight: 88,
  cardImageHeight: 200,
  listItemSmall: 52,
  listItemMedium: 64,
  listItemLarge: 80,
  quickActionButton: 88,
  quickActionButtonIcon: 36,
  statCard: 96,
  statCardIcon: 44,
};

// Screen dimensions
export const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  padding: 24,
  paddingHorizontal: 24,
  paddingVertical: 20,
  maxContentWidth: 428,
};

// Animation durations
export const Duration = {
  instant: 0,
  fastest: 80,
  fast: 120,
  normal: 180,
  slow: 250,
  slower: 350,
  slowest: 450,
  pageTransition: 300,
  modalOpen: 250,
  modalClose: 180,
  ripple: 350,
  skeleton: 1200,
};

// Animation easing
export const Easing = {
  linear: [0, 0, 1, 1] as const,
  easeIn: [0.42, 0, 1, 1] as const,
  easeOut: [0, 0, 0.58, 1] as const,
  easeInOut: [0.42, 0, 0.58, 1] as const,
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1] as const,
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15] as const,
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
  overlayLight: 0.3,
  overlayMedium: 0.5,
  overlayHeavy: 0.7,
  overlayDark: 0.85,
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
  small: { top: 6, right: 6, bottom: 6, left: 6 },
  medium: { top: 10, right: 10, bottom: 10, left: 10 },
  large: { top: 14, right: 14, bottom: 14, left: 14 },
  extraLarge: { top: 20, right: 20, bottom: 20, left: 20 },
};

// Card variants configuration
export const CardConfig = {
  padding: {
    compact: 16,
    normal: 20,
    relaxed: 24,
  },
  radius: {
    sharp: 8,
    normal: 16,
    round: 28,
  },
  gap: {
    compact: 8,
    normal: 16,
    relaxed: 20,
  },
};

// Button variants configuration
export const ButtonConfig = {
  sizes: {
    small: {
      height: 36,
      paddingHorizontal: 16,
      iconSize: 18,
      fontSize: 13,
    },
    medium: {
      height: 48,
      paddingHorizontal: 20,
      iconSize: 22,
      fontSize: 15,
    },
    large: {
      height: 56,
      paddingHorizontal: 24,
      iconSize: 26,
      fontSize: 17,
    },
  },
  radius: {
    square: 8,
    rounded: 12,
    pill: 9999,
  },
};

// Safe area insets
export const SafeArea = {
  top: Platform.OS === 'ios' ? 44 : 24,
  bottom: Platform.OS === 'ios' ? 34 : 0,
  left: 0,
  right: 0,
};

// Grid system
export const Grid = {
  columns: 2,
  gap: 16,
  itemHeight: 88,
};

// Section spacing
export const SectionSpacing = {
  betweenSections: 32,
  betweenCards: 16,
  headerMarginBottom: 16,
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
  Grid,
  SectionSpacing,
};
