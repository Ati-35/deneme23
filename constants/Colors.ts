// Sigara Bırakma Uygulaması - Modern Renk Paleti (2025)
// WCAG 2.1 AA uyumlu, semantic tokens, alpha variants
// Mavi/Turkuaz temalı sakin ve güven verici tasarım

import { Platform, ViewStyle } from 'react-native';

// Color palette with shades - Blue/Turquoise Theme
export const Palette = {
  // Primary - Sky Blue (Sakin, güven verici)
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9', // Main - Sky blue
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  
  // Secondary - Cyan (Nefes, oksijen, ferahlık)
  secondary: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Main - Cyan
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  
  // Accent - Indigo/Violet (Modern, premium aksiyonlar)
  accent: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Main - Violet
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  
  // Purple - Hedefler, başarılar (daha koyu ton)
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6D28D9',
    900: '#5B21B6',
  },
  
  // Success - Başarılı işlemler (Yumuşak yeşil)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Main
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // Warning - Uyarılar (Amber tonu)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Error - Hatalar, kriz (Rose tonu)
  error: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E', // Main - Rose
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  
  // Info - Bilgi (Blue)
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Neutral - Gri tonları (Slate - daha mavi alt ton)
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
};

// Alpha variants generator
export const withAlpha = (color: string, alpha: number): string => {
  const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return color + hex;
};

// Semantic Design Tokens - Dark Theme
export const SemanticColors = {
  // Background colors
  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#334155',
    card: '#1E293B',
    elevated: '#334155',
    overlay: withAlpha('#000000', 0.6),
    glass: withAlpha('#1E293B', 0.85),
  },
  
  // Surface colors (cards, modals)
  surface: {
    default: '#1E293B',
    elevated: '#334155',
    pressed: '#475569',
    disabled: withAlpha('#1E293B', 0.5),
  },
  
  // Text colors
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    disabled: '#475569',
    inverse: '#0F172A',
    onPrimary: '#FFFFFF',
    onAccent: '#FFFFFF',
    onError: '#FFFFFF',
  },
  
  // Border colors
  border: {
    default: '#334155',
    subtle: '#1E293B',
    strong: '#475569',
    focus: Palette.primary[500],
    error: Palette.error[500],
  },
  
  // Interactive states
  interactive: {
    primary: Palette.primary[500],
    primaryHover: Palette.primary[400],
    primaryPressed: Palette.primary[600],
    secondary: Palette.secondary[500],
    secondaryHover: Palette.secondary[400],
    accent: Palette.accent[500],
    accentHover: Palette.accent[400],
    danger: Palette.error[500],
    dangerHover: Palette.error[400],
  },
  
  // Status colors
  status: {
    success: Palette.success[500],
    successBg: withAlpha(Palette.success[500], 0.15),
    warning: Palette.warning[500],
    warningBg: withAlpha(Palette.warning[500], 0.15),
    error: Palette.error[500],
    errorBg: withAlpha(Palette.error[500], 0.15),
    info: Palette.info[500],
    infoBg: withAlpha(Palette.info[500], 0.15),
  },
  
  // Special purpose
  special: {
    health: Palette.success[500],
    healthBg: withAlpha(Palette.success[500], 0.15),
    money: Palette.warning[500],
    moneyBg: withAlpha(Palette.warning[500], 0.15),
    time: Palette.primary[500],
    timeBg: withAlpha(Palette.primary[500], 0.15),
    breath: Palette.secondary[500],
    breathBg: withAlpha(Palette.secondary[500], 0.15),
    crisis: Palette.error[500],
    crisisBg: withAlpha(Palette.error[500], 0.15),
    goal: Palette.accent[500],
    goalBg: withAlpha(Palette.accent[500], 0.15),
  },
};

// Modern Gradients
export const Gradients = {
  // Primary gradients (Sky Blue)
  primary: ['#0EA5E9', '#0284C7'] as const,
  primaryVibrant: ['#38BDF8', '#0EA5E9', '#0284C7'] as const,
  primarySoft: ['#BAE6FD', '#7DD3FC'] as const,
  
  // Accent gradients (Violet/Indigo)
  accent: ['#8B5CF6', '#7C3AED'] as const,
  accentVibrant: ['#A78BFA', '#8B5CF6', '#7C3AED'] as const,
  
  // Secondary gradients (Cyan)
  secondary: ['#06B6D4', '#0891B2'] as const,
  
  // Status gradients
  success: ['#22C55E', '#16A34A'] as const,
  warning: ['#F59E0B', '#D97706'] as const,
  error: ['#F43F5E', '#E11D48'] as const,
  info: ['#3B82F6', '#2563EB'] as const,
  
  // Special gradients
  health: ['#22C55E', '#16A34A'] as const,
  money: ['#F59E0B', '#D97706'] as const,
  purple: ['#A855F7', '#7C3AED'] as const,
  sunset: ['#F97316', '#F43F5E'] as const,
  midnight: ['#8B5CF6', '#3B82F6'] as const,
  ocean: ['#0EA5E9', '#06B6D4'] as const,
  forest: ['#22C55E', '#10B981'] as const,
  
  // Hero gradient
  hero: ['#0EA5E9', '#06B6D4', '#0891B2'] as const,
  heroSubtle: ['#1E293B', '#0F172A'] as const,
  
  // Dark/card gradients
  dark: ['#1E293B', '#0F172A'] as const,
  card: ['#334155', '#1E293B'] as const,
  cardElevated: ['#475569', '#334155'] as const,
  
  // Glass effect
  glass: [withAlpha('#1E293B', 0.9), withAlpha('#0F172A', 0.85)] as const,
  glassLight: [withAlpha('#FFFFFF', 0.1), withAlpha('#FFFFFF', 0.05)] as const,
  
  // Achievement gradients
  gold: ['#FFD700', '#F59E0B'] as const,
  silver: ['#E2E8F0', '#94A3B8'] as const,
  bronze: ['#D97706', '#92400E'] as const,
};

// Shadow presets
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  primary: {
    shadowColor: Palette.primary[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  accent: {
    shadowColor: Palette.accent[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  error: {
    shadowColor: Palette.error[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  success: {
    shadowColor: Palette.success[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Legacy Colors (for backwards compatibility)
export const Colors = {
  primary: Palette.primary[500],
  primaryDark: Palette.primary[600],
  primaryLight: Palette.primary[400],
  accent: Palette.accent[500],
  accentDark: Palette.accent[600],
  accentLight: Palette.accent[400],
  background: SemanticColors.background.primary,
  backgroundLight: SemanticColors.background.secondary,
  backgroundCard: SemanticColors.background.card,
  text: SemanticColors.text.primary,
  textSecondary: SemanticColors.text.secondary,
  textMuted: SemanticColors.text.tertiary,
  success: Palette.success[500],
  warning: Palette.warning[500],
  error: Palette.error[500],
  info: Palette.info[500],
  gradientStart: Palette.primary[500],
  gradientEnd: Palette.primary[600],
  border: SemanticColors.border.default,
  borderLight: SemanticColors.border.subtle,
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  health: Palette.success[500],
  money: Palette.warning[500],
  time: Palette.primary[500],
  breath: Palette.secondary[500],
};

export default Colors;
