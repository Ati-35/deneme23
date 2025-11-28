// Typography System - 2025 Modern Design
import { Platform, TextStyle } from 'react-native';

// Font family configuration
export const FontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Font weights
export const FontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

// Font sizes
export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 38,
  '5xl': 46,
  '6xl': 56,
  '7xl': 72,
  '8xl': 88,
};

// Line heights
export const LineHeight = {
  none: 1,
  tight: 1.15,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.75,
};

// Letter spacing
export const LetterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
};

// Typography presets
export const Typography = {
  // Display
  display: {
    large: {
      fontSize: FontSize['7xl'],
      fontWeight: FontWeight.extrabold,
      lineHeight: FontSize['7xl'] * LineHeight.tight,
      letterSpacing: LetterSpacing.tight,
    } as TextStyle,
    medium: {
      fontSize: FontSize['5xl'],
      fontWeight: FontWeight.bold,
      lineHeight: FontSize['5xl'] * LineHeight.tight,
      letterSpacing: LetterSpacing.tight,
    } as TextStyle,
    small: {
      fontSize: FontSize['4xl'],
      fontWeight: FontWeight.bold,
      lineHeight: FontSize['4xl'] * LineHeight.tight,
      letterSpacing: LetterSpacing.tight,
    } as TextStyle,
  },
  
  // Headings
  heading: {
    h1: {
      fontSize: FontSize['3xl'],
      fontWeight: FontWeight.bold,
      lineHeight: FontSize['3xl'] * LineHeight.snug,
      letterSpacing: LetterSpacing.tight,
    } as TextStyle,
    h2: {
      fontSize: FontSize['2xl'],
      fontWeight: FontWeight.bold,
      lineHeight: FontSize['2xl'] * LineHeight.snug,
      letterSpacing: LetterSpacing.tight,
    } as TextStyle,
    h3: {
      fontSize: FontSize.xl,
      fontWeight: FontWeight.bold,
      lineHeight: FontSize.xl * LineHeight.normal,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
    h4: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.lg * LineHeight.normal,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
    h5: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.md * LineHeight.normal,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
    h6: {
      fontSize: FontSize.base,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.base * LineHeight.normal,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
  },
  
  // Body text
  body: {
    large: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.regular,
      lineHeight: FontSize.lg * LineHeight.relaxed,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
    medium: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.regular,
      lineHeight: FontSize.md * LineHeight.relaxed,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
    small: {
      fontSize: FontSize.base,
      fontWeight: FontWeight.regular,
      lineHeight: FontSize.base * LineHeight.relaxed,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
  },
  
  // Labels
  label: {
    large: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.md * LineHeight.normal,
      letterSpacing: LetterSpacing.wide,
    } as TextStyle,
    medium: {
      fontSize: FontSize.base,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.base * LineHeight.normal,
      letterSpacing: LetterSpacing.wide,
    } as TextStyle,
    small: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.sm * LineHeight.normal,
      letterSpacing: LetterSpacing.wide,
    } as TextStyle,
  },
  
  // Captions
  caption: {
    large: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
      lineHeight: FontSize.sm * LineHeight.normal,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
    medium: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.medium,
      lineHeight: FontSize.xs * LineHeight.normal,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
    small: {
      fontSize: 10,
      fontWeight: FontWeight.regular,
      lineHeight: 10 * LineHeight.normal,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
  },
  
  // Stats
  stat: {
    hero: {
      fontSize: FontSize['8xl'],
      fontWeight: FontWeight.extrabold,
      lineHeight: FontSize['8xl'] * LineHeight.none,
      letterSpacing: LetterSpacing.tighter,
    } as TextStyle,
    large: {
      fontSize: FontSize['4xl'],
      fontWeight: FontWeight.extrabold,
      lineHeight: FontSize['4xl'] * LineHeight.tight,
      letterSpacing: LetterSpacing.tight,
    } as TextStyle,
    medium: {
      fontSize: FontSize['2xl'],
      fontWeight: FontWeight.bold,
      lineHeight: FontSize['2xl'] * LineHeight.tight,
      letterSpacing: LetterSpacing.tight,
    } as TextStyle,
    small: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.bold,
      lineHeight: FontSize.lg * LineHeight.tight,
      letterSpacing: LetterSpacing.normal,
    } as TextStyle,
  },
  
  // Button text
  button: {
    large: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.md * LineHeight.normal,
      letterSpacing: LetterSpacing.wide,
      textTransform: 'none',
    } as TextStyle,
    medium: {
      fontSize: FontSize.base,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.base * LineHeight.normal,
      letterSpacing: LetterSpacing.wide,
      textTransform: 'none',
    } as TextStyle,
    small: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
      lineHeight: FontSize.sm * LineHeight.normal,
      letterSpacing: LetterSpacing.wide,
      textTransform: 'none',
    } as TextStyle,
  },
  
  // Badge/tag text
  badge: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase',
  } as TextStyle,
  
  // Overline text
  overline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase',
  } as TextStyle,
};

export default Typography;
