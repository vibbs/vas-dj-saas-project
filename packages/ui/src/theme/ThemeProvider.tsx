import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, defaultTheme, themes, ThemeName } from './tokens';
import { injectThemeCssVariables } from './cssVariables';

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
  theme?: Theme; // Allow direct theme object
  enableSystem?: boolean;
  attribute?: string;
  value?: Record<ThemeName, string>;
  injectCssVariables?: boolean; // Control CSS variable injection
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme: defaultThemeName = 'default',
  theme: directTheme,
  enableSystem = true,
  attribute = 'data-theme',
  value,
  injectCssVariables = true,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultThemeName);
  const [theme, setTheme] = useState<Theme>(directTheme || themes[defaultThemeName]);

  const handleSetTheme = (newThemeName: ThemeName) => {
    const newTheme = themes[newThemeName];
    setThemeName(newThemeName);
    setTheme(newTheme);
    
    // Update document attribute and inject CSS variables
    if (typeof document !== 'undefined') {
      const themeValue = value?.[newThemeName] || newThemeName;
      document.documentElement.setAttribute(attribute, themeValue);
      
      // Inject comprehensive CSS variables
      if (injectCssVariables) {
        injectThemeCssVariables(newTheme);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = themeName === 'default' ? 'dark' : 'default';
    handleSetTheme(newTheme);
  };

  useEffect(() => {
    if (directTheme) {
      // If direct theme is provided, inject it without changing state
      if (injectCssVariables && typeof document !== 'undefined') {
        injectThemeCssVariables(directTheme);
      }
    } else {
      handleSetTheme(themeName);
    }
  }, [directTheme]);

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