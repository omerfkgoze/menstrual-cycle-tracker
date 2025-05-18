import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tema renkleri
export const lightTheme = {
  primary: '#FF6B81',
  secondary: '#FFA5B3',
  background: '#FFFFFF',
  card: '#F9F9F9',
  text: '#333333',
  border: '#EEEEEE',
  notification: '#FF3B30',
  error: '#FF3B30',
  success: '#4CD964',
  warning: '#FFCC00',
  info: '#5AC8FA',
};

export const darkTheme = {
  primary: '#FF6B81',
  secondary: '#FFA5B3',
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  border: '#333333',
  notification: '#FF453A',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FFD60A',
  info: '#64D2FF',
};

// Tema context tipi tanımlaması
type ThemeContextType = {
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
};

// Context oluşturma
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider bileşeni
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  // Tema modunu AsyncStorage'dan yükleme
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode) {
          setThemeMode(savedThemeMode as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error('Tema modu yüklenirken hata oluştu:', error);
      }
    };
    
    loadThemeMode();
  }, []);

  // Tema modunu izleme ve güncelleme
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDarkMode(colorScheme === 'dark');
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  }, [themeMode, colorScheme]);

  // Tema modunu değiştirme ve kaydetme
  const setThemeModeAndSave = async (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Tema modu kaydedilirken hata oluştu:', error);
    }
  };

  // Temayı değiştirme
  const toggleTheme = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setThemeModeAndSave(newMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setThemeMode: setThemeModeAndSave,
    themeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};