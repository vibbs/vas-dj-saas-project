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

  // Status colors
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;

  // Utility colors
  overlay: string;
  overlayLight: string;
  overlayDark: string;
  white: string;
  black: string;

  // Avatar colors (for fallback generation)
  avatarColors: string[];
}

export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  xxl: number;
}

export interface TypographyTokens {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
    "4xl": number;
  };
  fontWeight: {
    normal: "normal" | "400";
    medium: "500";
    semibold: "600";
    bold: "bold" | "700";
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
    widest: number;
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
  name: "Default",
  colors: {
    primary: "#3b82f6",
    primaryForeground: "#ffffff",
    secondary: "#f1f5f9",
    secondaryForeground: "#0f172a",
    accent: "#f1f5f9",
    accentForeground: "#0f172a",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    muted: "#64748b",
    mutedForeground: "#64748b",
    card: "#ffffff",
    cardForeground: "#0f172a",
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: "#3b82f6",
    background: "#ffffff",
    foreground: "#0f172a",

    // Status colors
    success: "#10b981",
    successForeground: "#ffffff",
    warning: "#f59e0b",
    warningForeground: "#ffffff",
    info: "#3b82f6",
    infoForeground: "#ffffff",

    // Utility colors
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(0, 0, 0, 0.4)",
    overlayDark: "rgba(0, 0, 0, 0.95)",
    white: "#ffffff",
    black: "#000000",

    // Avatar colors
    avatarColors: [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#84cc16",
      "#10b981",
      "#06b6d4",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#d946ef",
      "#ec4899",
      "#f43f5e",
    ],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 40,
    xxl: 48,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2.0,
    },
    letterSpacing: {
      tight: -0.025,
      normal: 0,
      wide: 0.025,
      widest: 0.1,
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
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
};

// Dark theme
export const darkTheme: Theme = {
  name: "Dark",
  colors: {
    primary: "#3b82f6",
    primaryForeground: "#ffffff",
    secondary: "#1e293b",
    secondaryForeground: "#f8fafc",
    accent: "#1e293b",
    accentForeground: "#f8fafc",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    muted: "#94a3b8",
    mutedForeground: "#94a3b8",
    card: "#1e293b",
    cardForeground: "#f8fafc",
    border: "#334155",
    input: "#334155",
    ring: "#3b82f6",
    background: "#020617",
    foreground: "#f8fafc",

    // Status colors
    success: "#10b981",
    successForeground: "#ffffff",
    warning: "#f59e0b",
    warningForeground: "#ffffff",
    info: "#3b82f6",
    infoForeground: "#ffffff",

    // Utility colors
    overlay: "rgba(0, 0, 0, 0.7)",
    overlayLight: "rgba(0, 0, 0, 0.5)",
    overlayDark: "rgba(0, 0, 0, 0.95)",
    white: "#ffffff",
    black: "#000000",

    // Avatar colors (same as default)
    avatarColors: [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#84cc16",
      "#10b981",
      "#06b6d4",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#d946ef",
      "#ec4899",
      "#f43f5e",
    ],
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
  },
};

// Blue theme variant
export const blueTheme: Theme = {
  name: "Blue",
  colors: {
    ...defaultTheme.colors,
    primary: "#1e40af",
    primaryForeground: "#ffffff",
    secondary: "#dbeafe",
    secondaryForeground: "#1e40af",
    accent: "#3b82f6",
    accentForeground: "#ffffff",
    ring: "#1e40af",
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  shadows: defaultTheme.shadows,
};

// Green theme variant
export const greenTheme: Theme = {
  name: "Green",
  colors: {
    ...defaultTheme.colors,
    primary: "#059669",
    primaryForeground: "#ffffff",
    secondary: "#d1fae5",
    secondaryForeground: "#059669",
    accent: "#10b981",
    accentForeground: "#ffffff",
    ring: "#059669",
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  shadows: defaultTheme.shadows,
};

// Purple theme variant
export const purpleTheme: Theme = {
  name: "Purple",
  colors: {
    ...defaultTheme.colors,
    primary: "#7c3aed",
    primaryForeground: "#ffffff",
    secondary: "#ede9fe",
    secondaryForeground: "#7c3aed",
    accent: "#8b5cf6",
    accentForeground: "#ffffff",
    ring: "#7c3aed",
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  shadows: defaultTheme.shadows,
};

// Rose theme variant
export const roseTheme: Theme = {
  name: "Rose",
  colors: {
    ...defaultTheme.colors,
    primary: "#e11d48",
    primaryForeground: "#ffffff",
    secondary: "#fce7f3",
    secondaryForeground: "#e11d48",
    accent: "#f43f5e",
    accentForeground: "#ffffff",
    ring: "#e11d48",
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  shadows: defaultTheme.shadows,
};

// Orange theme variant
export const orangeTheme: Theme = {
  name: "Orange",
  colors: {
    ...defaultTheme.colors,
    primary: "#ea580c",
    primaryForeground: "#ffffff",
    secondary: "#fed7aa",
    secondaryForeground: "#ea580c",
    accent: "#f97316",
    accentForeground: "#ffffff",
    ring: "#ea580c",
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  shadows: defaultTheme.shadows,
};

// Available themes
export const themes = {
  default: defaultTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
  rose: roseTheme,
  orange: orangeTheme,
} as const;

export type ThemeName = keyof typeof themes;
