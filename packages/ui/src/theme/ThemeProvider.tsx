import React, { createContext, useContext } from 'react';
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

// Create a static context value object that never changes
const staticContextValue: ThemeContextValue = {
  theme: themes.default,
  themeName: 'default',
  setTheme: () => {},
  toggleTheme: () => {},
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Always provide the same static context value
  return (
    <ThemeContext.Provider value={staticContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};