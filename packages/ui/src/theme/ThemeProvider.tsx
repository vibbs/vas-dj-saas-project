import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, defaultTheme, themes, ThemeName } from './tokens';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  enableSystem?: boolean;
  attribute?: string;
  value?: Record<ThemeName, string>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme: defaultThemeName = 'default',
  enableSystem = true,
  attribute = 'data-theme',
  value,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultThemeName);
  const [theme, setTheme] = useState<Theme>(themes[defaultThemeName]);

  const handleSetTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    setTheme(themes[newThemeName]);
    
    // Update document attribute for CSS custom properties
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const themeValue = value?.[newThemeName] || newThemeName;
      root.setAttribute(attribute, themeValue);
      
      // Set CSS custom properties
      const newTheme = themes[newThemeName];
      (Object.entries(newTheme.colors) as [string, string][]).forEach(([key, colorValue]) => {
        root.style.setProperty(`--color-${key}`, colorValue);
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = themeName === 'default' ? 'dark' : 'default';
    handleSetTheme(newTheme);
  };

  useEffect(() => {
    handleSetTheme(themeName);
  }, []);

  const contextValue: ThemeContextValue = {
    theme,
    themeName,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};