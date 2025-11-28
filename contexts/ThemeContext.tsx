// Theme Context - Modern Dark/Light Tema Sistemi
// Animasyonlu tema geçişi, sistem teması takibi, özelleştirilebilir renkler

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback,
  useMemo,
  ReactNode 
} from 'react';
import { useColorScheme, Appearance, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Theme,
  ThemeMode,
  ThemeName,
  ALL_THEMES,
  DEFAULT_LIGHT,
  DEFAULT_DARK,
  getThemeByName,
  createCustomTheme,
  CustomThemeConfig,
} from '../constants/Themes';

// Storage Keys
const STORAGE_KEYS = {
  THEME_NAME: '@app_theme_name',
  THEME_MODE: '@app_theme_mode',
  CUSTOM_PRIMARY: '@app_custom_primary',
};

// Context Types
interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  themeMode: ThemeMode;
  isDark: boolean;
  
  // Theme setters
  setThemeName: (name: ThemeName) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomPrimaryColor: (color: string) => void;
  
  // Quick toggles
  toggleDarkMode: () => void;
  
  // All available themes
  availableThemes: Theme[];
  
  // Loading state
  isLoading: boolean;
}

// Default context value
const defaultContext: ThemeContextType = {
  theme: DEFAULT_DARK,
  themeName: 'default',
  themeMode: 'system',
  isDark: true,
  setThemeName: () => {},
  setThemeMode: () => {},
  setCustomPrimaryColor: () => {},
  toggleDarkMode: () => {},
  availableThemes: ALL_THEMES,
  isLoading: true,
};

// Create Context
const ThemeContext = createContext<ThemeContextType>(defaultContext);

// Provider Props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme Provider Component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  
  const [themeName, setThemeNameState] = useState<ThemeName>('default');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [customPrimaryColor, setCustomPrimaryColorState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if dark mode based on theme mode and system setting
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Get the current theme
  const theme = useMemo((): Theme => {
    if (themeName === 'custom' && customPrimaryColor) {
      return createCustomTheme({
        primaryColor: customPrimaryColor,
        mode: isDark ? 'dark' : 'light',
      });
    }
    return getThemeByName(themeName, isDark ? 'dark' : 'light');
  }, [themeName, isDark, customPrimaryColor]);

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedThemeName, savedThemeMode, savedCustomPrimary] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_PRIMARY),
        ]);

        if (savedThemeName) {
          setThemeNameState(savedThemeName as ThemeName);
        }
        if (savedThemeMode) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }
        if (savedCustomPrimary) {
          setCustomPrimaryColorState(savedCustomPrimary);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Update status bar based on theme
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  }, [isDark]);

  // Set theme name
  const setThemeName = useCallback(async (name: ThemeName) => {
    setThemeNameState(name);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_NAME, name);
    } catch (error) {
      console.error('Error saving theme name:', error);
    }
  }, []);

  // Set theme mode
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }, []);

  // Set custom primary color
  const setCustomPrimaryColor = useCallback(async (color: string) => {
    setCustomPrimaryColorState(color);
    setThemeNameState('custom');
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_PRIMARY, color),
        AsyncStorage.setItem(STORAGE_KEYS.THEME_NAME, 'custom'),
      ]);
    } catch (error) {
      console.error('Error saving custom color:', error);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  // Context value
  const contextValue = useMemo<ThemeContextType>(() => ({
    theme,
    themeName,
    themeMode,
    isDark,
    setThemeName,
    setThemeMode,
    setCustomPrimaryColor,
    toggleDarkMode,
    availableThemes: ALL_THEMES,
    isLoading,
  }), [
    theme,
    themeName,
    themeMode,
    isDark,
    setThemeName,
    setThemeMode,
    setCustomPrimaryColor,
    toggleDarkMode,
    isLoading,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Custom hook for themed styles
export function useThemedStyles<T>(
  stylesFn: (theme: Theme, isDark: boolean) => T
): T {
  const { theme, isDark } = useTheme();
  return useMemo(() => stylesFn(theme, isDark), [theme, isDark, stylesFn]);
}

export default ThemeContext;




