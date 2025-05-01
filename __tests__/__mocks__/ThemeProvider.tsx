import React from 'react';
import { ViewProps } from 'react-native';

export interface ThemeContextType {
  colors: {
    background: string;
    text: string;
    primary: string;
    card: string;
    border: string;
  };
}

export const ThemeContext = React.createContext<ThemeContextType>({
  colors: {
    background: '#ffffff',
    text: '#000000',
    primary: '#007AFF',
    card: '#ffffff',
    border: '#e0e0e0'
  }
});

export const ThemeProvider: React.FC<ViewProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{
      colors: {
        background: '#ffffff',
        text: '#000000',
        primary: '#007AFF',
        card: '#ffffff',
        border: '#e0e0e0'
      }
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
