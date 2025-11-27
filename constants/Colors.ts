// Sigara Bırakma Uygulaması - Modern Renk Paleti
// WCAG 2.1 AA uyumlu, semantic tokens, alpha variants

// Color palette with shades
export const Palette = {
  // Primary - Yeşil (Sağlık, yenilenme)
  primary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Secondary - Cyan (Nefes, oksijen)
  secondary: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Main
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  
  // Accent - Turuncu (Motivasyon, enerji)
  accent: {
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
  
  // Purple - Hedefler, başarılar
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
  
  // Success - Başarılı işlemler
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
  
  // Warning - Uyarılar
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
  
  // Error - Hatalar, kriz
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Info - Bilgi
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
  
  // Neutral - Gri tonları
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
};

// Alpha variants generator
export const withAlpha = (color: string, alpha: number): string => {
  const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return color + hex;
};

// Semantic Design Tokens
export const SemanticColors = {
  // Background colors
  background: {
    primary: '#0D1117',
    secondary: '#161B22',
    tertiary: '#21262D',
    card: '#21262D',
    elevated: '#30363D',
    overlay: withAlpha('#000000', 0.6),
    glass: withAlpha('#21262D', 0.8),
  },
  
  // Surface colors (cards, modals)
  surface: {
    default: '#21262D',
    elevated: '#30363D',
    pressed: '#484F58',
    disabled: withAlpha('#21262D', 0.5),
  },
  
  // Text colors
  text: {
    primary: '#F0F6FC',
    secondary: '#8B949E',
    tertiary: '#6E7681',
    disabled: '#484F58',
    inverse: '#0D1117',
    onPrimary: '#FFFFFF',
    onAccent: '#FFFFFF',
    onError: '#FFFFFF',
  },
  
  // Border colors
  border: {
    default: '#30363D',
    subtle: '#21262D',
    strong: '#484F58',
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
    health: Palette.primary[500],
    healthBg: withAlpha(Palette.primary[500], 0.15),
    money: Palette.accent[500],
    moneyBg: withAlpha(Palette.accent[500], 0.15),
    time: Palette.info[500],
    timeBg: withAlpha(Palette.info[500], 0.15),
    breath: Palette.secondary[500],
    breathBg: withAlpha(Palette.secondary[500], 0.15),
    crisis: Palette.error[500],
    crisisBg: withAlpha(Palette.error[500], 0.15),
    goal: Palette.purple[500],
    goalBg: withAlpha(Palette.purple[500], 0.15),
  },
};

// Modern Gradients
export const Gradients = {
  // Primary gradients
  primary: ['#10B981', '#059669'] as const,
  primaryVibrant: ['#34D399', '#10B981', '#059669'] as const,
  primarySoft: ['#A7F3D0', '#6EE7B7'] as const,
  
  // Accent gradients
  accent: ['#F59E0B', '#D97706'] as const,
  accentVibrant: ['#FBBF24', '#F59E0B', '#D97706'] as const,
  
  // Secondary gradients
  secondary: ['#06B6D4', '#0891B2'] as const,
  
  // Status gradients
  success: ['#22C55E', '#16A34A'] as const,
  warning: ['#F59E0B', '#D97706'] as const,
  error: ['#EF4444', '#DC2626'] as const,
  info: ['#3B82F6', '#2563EB'] as const,
  
  // Special gradients
  health: ['#10B981', '#06B6D4'] as const,
  money: ['#F59E0B', '#D97706'] as const,
  purple: ['#A855F7', '#7C3AED'] as const,
  sunset: ['#F97316', '#EC4899'] as const,
  midnight: ['#8B5CF6', '#3B82F6'] as const,
  ocean: ['#0EA5E9', '#06B6D4'] as const,
  forest: ['#22C55E', '#10B981'] as const,
  
  // Dark/card gradients
  dark: ['#161B22', '#0D1117'] as const,
  card: ['#21262D', '#161B22'] as const,
  cardElevated: ['#30363D', '#21262D'] as const,
  
  // Glass effect
  glass: [withAlpha('#21262D', 0.9), withAlpha('#161B22', 0.8)] as const,
  glassLight: [withAlpha('#FFFFFF', 0.1), withAlpha('#FFFFFF', 0.05)] as const,
  
  // Achievement gradients
  gold: ['#FFD700', '#F59E0B'] as const,
  silver: ['#E5E7EB', '#9CA3AF'] as const,
  bronze: ['#D97706', '#92400E'] as const,
};

// Shadow presets (for elevation)
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
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  // Colored shadows
  primary: {
    shadowColor: Palette.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  accent: {
    shadowColor: Palette.accent[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  error: {
    shadowColor: Palette.error[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  success: {
    shadowColor: Palette.success[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Legacy Colors (for backwards compatibility)
export const Colors = {
  // Ana Renkler
  primary: Palette.primary[500],
  primaryDark: Palette.primary[600],
  primaryLight: Palette.primary[400],
  
  // Accent Renkler
  accent: Palette.accent[500],
  accentDark: Palette.accent[600],
  accentLight: Palette.accent[400],
  
  // Arka Plan
  background: SemanticColors.background.primary,
  backgroundLight: SemanticColors.background.secondary,
  backgroundCard: SemanticColors.background.card,
  
  // Metin
  text: SemanticColors.text.primary,
  textSecondary: SemanticColors.text.secondary,
  textMuted: SemanticColors.text.tertiary,
  
  // Durum Renkleri
  success: Palette.success[500],
  warning: Palette.warning[500],
  error: Palette.error[500],
  info: Palette.info[500],
  
  // Gradyanlar
  gradientStart: Palette.primary[500],
  gradientEnd: Palette.primary[600],
  
  // Border
  border: SemanticColors.border.default,
  borderLight: SemanticColors.border.subtle,
  
  // Özel
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  
  // Sigara Bırakma Tema Renkleri
  health: Palette.primary[500],
  money: Palette.accent[500],
  time: Palette.info[500],
  breath: Palette.secondary[500],
};

export default Colors;
