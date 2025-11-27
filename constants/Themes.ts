// Tema Sistemi
// 5+ farklı tema, özel renk paletleri, gradient desteği

import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeName = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'sakura' | 'custom';

export interface ThemeColors {
  // Ana renkler
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Arka plan renkleri
  background: string;
  backgroundSecondary: string;
  backgroundCard: string;
  
  // Metin renkleri
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Kenar ve ayırıcı
  border: string;
  divider: string;
  
  // Durum renkleri
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Özel renkler
  accent: string;
  highlight: string;
  
  // Gradient renkleri
  gradientStart: string;
  gradientEnd: string;
  
  // Tab bar
  tabIconDefault: string;
  tabIconSelected: string;
  tabBackground: string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  icon: string;
  mode: ThemeMode;
  colors: ThemeColors;
  gradients: {
    primary: string[];
    success: string[];
    warning: string[];
    card: string[];
    header: string[];
  };
}

// Varsayılan Tema (Light)
export const DEFAULT_LIGHT: Theme = {
  name: 'default',
  displayName: 'Varsayılan',
  description: 'Temiz ve modern açık tema',
  icon: '☀️',
  mode: 'light',
  colors: {
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    backgroundCard: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    border: '#E2E8F0',
    divider: '#F1F5F9',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    accent: '#8B5CF6',
    highlight: '#FEF3C7',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#10B981',
    tabBackground: '#FFFFFF',
  },
  gradients: {
    primary: ['#10B981', '#059669'],
    success: ['#22C55E', '#16A34A'],
    warning: ['#F59E0B', '#D97706'],
    card: ['#FFFFFF', '#F8FAFC'],
    header: ['#F8FAFC', '#FFFFFF'],
  },
};

// Varsayılan Tema (Dark)
export const DEFAULT_DARK: Theme = {
  name: 'default',
  displayName: 'Varsayılan Koyu',
  description: 'Göz yormayan koyu tema',
  icon: '🌙',
  mode: 'dark',
  colors: {
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundCard: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    textInverse: '#0F172A',
    border: '#334155',
    divider: '#1E293B',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    accent: '#A78BFA',
    highlight: '#422006',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
    tabIconDefault: '#64748B',
    tabIconSelected: '#10B981',
    tabBackground: '#1E293B',
  },
  gradients: {
    primary: ['#10B981', '#059669'],
    success: ['#22C55E', '#16A34A'],
    warning: ['#F59E0B', '#D97706'],
    card: ['#1E293B', '#0F172A'],
    header: ['#0F172A', '#1E293B'],
  },
};

// Okyanus Teması
export const OCEAN_THEME: Theme = {
  name: 'ocean',
  displayName: 'Okyanus',
  description: 'Sakinleştirici mavi tonları',
  icon: '🌊',
  mode: 'dark',
  colors: {
    primary: '#0EA5E9',
    primaryLight: '#38BDF8',
    primaryDark: '#0284C7',
    background: '#0C1929',
    backgroundSecondary: '#152238',
    backgroundCard: '#1A2F4A',
    text: '#E0F2FE',
    textSecondary: '#7DD3FC',
    textMuted: '#38BDF8',
    textInverse: '#0C1929',
    border: '#1E3A5F',
    divider: '#152238',
    success: '#2DD4BF',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    accent: '#A78BFA',
    highlight: '#164E63',
    gradientStart: '#0EA5E9',
    gradientEnd: '#0284C7',
    tabIconDefault: '#38BDF8',
    tabIconSelected: '#0EA5E9',
    tabBackground: '#152238',
  },
  gradients: {
    primary: ['#0EA5E9', '#0284C7', '#0369A1'],
    success: ['#2DD4BF', '#14B8A6'],
    warning: ['#FBBF24', '#F59E0B'],
    card: ['#1A2F4A', '#152238'],
    header: ['#0C1929', '#152238'],
  },
};

// Orman Teması
export const FOREST_THEME: Theme = {
  name: 'forest',
  displayName: 'Orman',
  description: 'Doğal yeşil tonları',
  icon: '🌲',
  mode: 'dark',
  colors: {
    primary: '#22C55E',
    primaryLight: '#4ADE80',
    primaryDark: '#16A34A',
    background: '#0A1F0A',
    backgroundSecondary: '#142814',
    backgroundCard: '#1A331A',
    text: '#DCFCE7',
    textSecondary: '#86EFAC',
    textMuted: '#4ADE80',
    textInverse: '#0A1F0A',
    border: '#1F4620',
    divider: '#142814',
    success: '#4ADE80',
    warning: '#FCD34D',
    error: '#F87171',
    info: '#60A5FA',
    accent: '#A78BFA',
    highlight: '#166534',
    gradientStart: '#22C55E',
    gradientEnd: '#16A34A',
    tabIconDefault: '#4ADE80',
    tabIconSelected: '#22C55E',
    tabBackground: '#142814',
  },
  gradients: {
    primary: ['#22C55E', '#16A34A', '#15803D'],
    success: ['#4ADE80', '#22C55E'],
    warning: ['#FCD34D', '#FBBF24'],
    card: ['#1A331A', '#142814'],
    header: ['#0A1F0A', '#142814'],
  },
};

// Gün Batımı Teması
export const SUNSET_THEME: Theme = {
  name: 'sunset',
  displayName: 'Gün Batımı',
  description: 'Sıcak turuncu ve pembe tonları',
  icon: '🌅',
  mode: 'dark',
  colors: {
    primary: '#F97316',
    primaryLight: '#FB923C',
    primaryDark: '#EA580C',
    background: '#1F1510',
    backgroundSecondary: '#2D1F17',
    backgroundCard: '#3D2A1F',
    text: '#FFF7ED',
    textSecondary: '#FDBA74',
    textMuted: '#FB923C',
    textInverse: '#1F1510',
    border: '#4D3526',
    divider: '#2D1F17',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    accent: '#EC4899',
    highlight: '#7C2D12',
    gradientStart: '#F97316',
    gradientEnd: '#EC4899',
    tabIconDefault: '#FB923C',
    tabIconSelected: '#F97316',
    tabBackground: '#2D1F17',
  },
  gradients: {
    primary: ['#F97316', '#EA580C', '#EC4899'],
    success: ['#4ADE80', '#22C55E'],
    warning: ['#FBBF24', '#F59E0B'],
    card: ['#3D2A1F', '#2D1F17'],
    header: ['#1F1510', '#2D1F17'],
  },
};

// Gece Yarısı Teması
export const MIDNIGHT_THEME: Theme = {
  name: 'midnight',
  displayName: 'Gece Yarısı',
  description: 'Derin mor ve mavi tonları',
  icon: '🌌',
  mode: 'dark',
  colors: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    background: '#0D0A1F',
    backgroundSecondary: '#1A1433',
    backgroundCard: '#251D47',
    text: '#F5F3FF',
    textSecondary: '#C4B5FD',
    textMuted: '#A78BFA',
    textInverse: '#0D0A1F',
    border: '#312E81',
    divider: '#1A1433',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    accent: '#EC4899',
    highlight: '#4C1D95',
    gradientStart: '#8B5CF6',
    gradientEnd: '#7C3AED',
    tabIconDefault: '#A78BFA',
    tabIconSelected: '#8B5CF6',
    tabBackground: '#1A1433',
  },
  gradients: {
    primary: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    success: ['#4ADE80', '#22C55E'],
    warning: ['#FBBF24', '#F59E0B'],
    card: ['#251D47', '#1A1433'],
    header: ['#0D0A1F', '#1A1433'],
  },
};

// Sakura Teması
export const SAKURA_THEME: Theme = {
  name: 'sakura',
  displayName: 'Sakura',
  description: 'Zarif pembe tonları',
  icon: '🌸',
  mode: 'light',
  colors: {
    primary: '#EC4899',
    primaryLight: '#F472B6',
    primaryDark: '#DB2777',
    background: '#FDF2F8',
    backgroundSecondary: '#FCE7F3',
    backgroundCard: '#FFFFFF',
    text: '#831843',
    textSecondary: '#9D174D',
    textMuted: '#BE185D',
    textInverse: '#FFFFFF',
    border: '#FBCFE8',
    divider: '#FCE7F3',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    accent: '#8B5CF6',
    highlight: '#FDF2F8',
    gradientStart: '#EC4899',
    gradientEnd: '#DB2777',
    tabIconDefault: '#F9A8D4',
    tabIconSelected: '#EC4899',
    tabBackground: '#FFFFFF',
  },
  gradients: {
    primary: ['#EC4899', '#DB2777', '#BE185D'],
    success: ['#22C55E', '#16A34A'],
    warning: ['#F59E0B', '#D97706'],
    card: ['#FFFFFF', '#FDF2F8'],
    header: ['#FDF2F8', '#FCE7F3'],
  },
};

// Tüm temalar
export const ALL_THEMES: Theme[] = [
  DEFAULT_LIGHT,
  DEFAULT_DARK,
  OCEAN_THEME,
  FOREST_THEME,
  SUNSET_THEME,
  MIDNIGHT_THEME,
  SAKURA_THEME,
];

// Storage key
const THEME_STORAGE_KEY = '@app_theme';
const THEME_MODE_KEY = '@theme_mode';

// Tema işlevleri
export const saveTheme = async (themeName: ThemeName): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const getTheme = async (): Promise<ThemeName> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    return (theme as ThemeName) || 'default';
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'default';
  }
};

export const saveThemeMode = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  } catch (error) {
    console.error('Error saving theme mode:', error);
  }
};

export const getThemeMode = async (): Promise<ThemeMode> => {
  try {
    const mode = await AsyncStorage.getItem(THEME_MODE_KEY);
    return (mode as ThemeMode) || 'system';
  } catch (error) {
    console.error('Error getting theme mode:', error);
    return 'system';
  }
};

export const getThemeByName = (name: ThemeName, mode: 'light' | 'dark' = 'dark'): Theme => {
  if (name === 'default') {
    return mode === 'light' ? DEFAULT_LIGHT : DEFAULT_DARK;
  }
  return ALL_THEMES.find(t => t.name === name) || DEFAULT_DARK;
};

// Custom tema oluştur
export interface CustomThemeConfig {
  primaryColor: string;
  mode: 'light' | 'dark';
}

export const createCustomTheme = (config: CustomThemeConfig): Theme => {
  const baseTheme = config.mode === 'light' ? DEFAULT_LIGHT : DEFAULT_DARK;
  
  return {
    ...baseTheme,
    name: 'custom',
    displayName: 'Özel Tema',
    description: 'Kişiselleştirilmiş tema',
    icon: '🎨',
    colors: {
      ...baseTheme.colors,
      primary: config.primaryColor,
      primaryLight: lightenColor(config.primaryColor, 20),
      primaryDark: darkenColor(config.primaryColor, 20),
      gradientStart: config.primaryColor,
      gradientEnd: darkenColor(config.primaryColor, 20),
      tabIconSelected: config.primaryColor,
    },
    gradients: {
      ...baseTheme.gradients,
      primary: [config.primaryColor, darkenColor(config.primaryColor, 20)],
    },
  };
};

// Renk yardımcı fonksiyonları
export const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
};

export const darkenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (
    0x1000000 +
    (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 +
    (B > 0 ? B : 0)
  ).toString(16).slice(1);
};

// Alpha ekle
export const withAlpha = (color: string, alpha: number): string => {
  const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return color + hex;
};




