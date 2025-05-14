import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
  border: string;
  notification: string;
}

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const lightColors: ThemeColors = {
  primary: '#FF5733',
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  notification: '#FF5733',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
};

const darkColors: ThemeColors = {
  primary: '#FF8A65',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#999999',
  border: '#2C2C2C',
  notification: '#FF8A65',
  success: '#81C784',
  error: '#E57373',
  warning: '#FFD54F',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 