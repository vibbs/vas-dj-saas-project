import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes, ThemeName } from './tokens';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  toggleTheme: () => void;
}

// Create the context with a default value to avoid undefined issues
const defaultTheme = themes.default;
const defaultContextValue: ThemeContextValue = {
  theme: defaultTheme,
  themeName: 'default',
  setTheme: () => {},
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

export const useTheme = () => {
  return useContext(ThemeContext);
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  theme?: Theme;
  enableSystem?: boolean;
  attribute?: string;
  value?: Record<ThemeName, string>;
  injectCssVariables?: boolean;
}

/**
 * Detect if system is in dark mode
 */
const getSystemTheme = (): ThemeName => {
  if (typeof window === 'undefined') return 'default';

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'default';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme: providedDefaultTheme,
  enableSystem = true,
}) => {
  // Initialize theme based on system preference or provided default
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (providedDefaultTheme) return providedDefaultTheme;
    if (enableSystem) return getSystemTheme();
    return 'default';
  });

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a theme
      setThemeName(e.matches ? 'dark' : 'default');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [enableSystem]);

  const toggleTheme = () => {
    setThemeName(current => current === 'dark' ? 'default' : 'dark');
  };

  const contextValue: ThemeContextValue = {
    theme: themes[themeName],
    themeName,
    setTheme: setThemeName,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};