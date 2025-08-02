// Design tokens for cross-platform theming
export interface ColorTokens {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
  background: string;
  foreground: string;
}

export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface TypographyTokens {
  fontFamily: string;
  fontSize: {
    sm: number;
    base: number;
    lg: number;
    xl: number;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface BorderTokens {
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  width: {
    thin: number;
    normal: number;
    thick: number;
  };
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
}

export interface Theme {
  name: string;
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
}

// Default theme
export const defaultTheme: Theme = {
  name: 'Default',
  colors: {
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    muted: '#f8fafc',
    mutedForeground: '#64748b',
    card: '#ffffff',
    cardForeground: '#0f172a',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#3b82f6',
    background: '#ffffff',
    foreground: '#0f172a',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  borders: {
    radius: {
      sm: 4,
      md: 6,
      lg: 8,
      full: 9999,
    },
    width: {
      thin: 1,
      normal: 2,
      thick: 4,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

// Dark theme
export const darkTheme: Theme = {
  name: 'Dark',
  colors: {
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#1e293b',
    secondaryForeground: '#f8fafc',
    accent: '#1e293b',
    accentForeground: '#f8fafc',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    muted: '#0f172a',
    mutedForeground: '#94a3b8',
    card: '#1e293b',
    cardForeground: '#f8fafc',
    border: '#334155',
    input: '#334155',
    ring: '#3b82f6',
    background: '#020617',
    foreground: '#f8fafc',
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  },
};

// Available themes
export const themes = {
  default: defaultTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;