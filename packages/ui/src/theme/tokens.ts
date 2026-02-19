// Design tokens for cross-platform theming
// VAS-DJ SaaS Design System v2.0 - Vibrant Accent Theme

// =============================================================================
// COLOR TOKENS
// =============================================================================

export interface ColorTokens {
  // Primary palette (Electric Violet)
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryMuted: string;
  primaryForeground: string;

  // Accent palette (Amber Gold)
  accent: string;
  accentHover: string;
  accentActive: string;
  accentMuted: string;
  accentForeground: string;

  // Secondary palette
  secondary: string;
  secondaryHover: string;
  secondaryForeground: string;

  // Destructive palette
  destructive: string;
  destructiveHover: string;
  destructiveForeground: string;

  // Muted/Subtle
  muted: string;
  mutedForeground: string;

  // Surface colors
  card: string;
  cardHover: string;
  cardForeground: string;

  // Borders & inputs
  border: string;
  borderHover: string;
  input: string;
  inputFocus: string;
  ring: string;

  // Background & foreground
  background: string;
  foreground: string;

  // Status colors
  success: string;
  successHover: string;
  successForeground: string;
  warning: string;
  warningHover: string;
  warningForeground: string;
  info: string;
  infoHover: string;
  infoForeground: string;

  // Utility colors
  overlay: string;
  overlayLight: string;
  overlayDark: string;
  white: string;
  black: string;

  // Glass-morphism
  glass: string;
  glassBorder: string;

  // Avatar colors (for fallback generation)
  avatarColors: string[];
}

// =============================================================================
// GRADIENT TOKENS
// =============================================================================

export interface GradientTokens {
  primary: string;
  accent: string;
  glass: string;
  glow: string;
  shimmer: string;
}

// =============================================================================
// SPACING TOKENS
// =============================================================================

export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
  xxl: number;
}

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

export interface TypographyTokens {
  fontFamilyDisplay: string;
  fontFamilyBody: string;
  fontFamilyMono: string;
  fontFamily: string; // Alias for fontFamilyBody (backwards compat)
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
    "4xl": number;
    "5xl": number;
  };
  fontWeight: {
    normal: "normal" | "400";
    medium: "500";
    semibold: "600";
    bold: "bold" | "700";
  };
  lineHeight: {
    none: number;
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: number;
    tight: number;
    normal: number;
    wide: number;
    wider: number;
    widest: number;
  };
}

// =============================================================================
// BORDER TOKENS
// =============================================================================

export interface BorderTokens {
  radius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    "2xl": number;
    full: number;
  };
  width: {
    none: number;
    thin: number;
    normal: number;
    thick: number;
  };
}

// =============================================================================
// SHADOW TOKENS (5-tier elevation system)
// =============================================================================

export interface ShadowTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
  glow: string;
}

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

export interface AnimationTokens {
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    slower: number;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    spring: string;
    bounce: string;
  };
}

// =============================================================================
// THEME INTERFACE
// =============================================================================

export interface Theme {
  name: string;
  colors: ColorTokens;
  gradients: GradientTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  animation: AnimationTokens;
}

// =============================================================================
// DEFAULT THEME (Light mode with vibrant accents)
// =============================================================================

export const defaultTheme: Theme = {
  name: "Default",
  colors: {
    // Primary palette (Electric Violet)
    primary: "#8B5CF6",
    primaryHover: "#7C3AED",
    primaryActive: "#6D28D9",
    primaryMuted: "#EDE9FE",
    primaryForeground: "#FFFFFF",

    // Accent palette (Amber Gold)
    accent: "#F59E0B",
    accentHover: "#D97706",
    accentActive: "#B45309",
    accentMuted: "#FEF3C7",
    accentForeground: "#FFFFFF",

    // Secondary palette
    secondary: "#F1F5F9",
    secondaryHover: "#E2E8F0",
    secondaryForeground: "#0F172A",

    // Destructive palette
    destructive: "#EF4444",
    destructiveHover: "#DC2626",
    destructiveForeground: "#FFFFFF",

    // Muted/Subtle
    muted: "#F8FAFC",
    mutedForeground: "#64748B",

    // Surface colors
    card: "#FFFFFF",
    cardHover: "#FAFAFA",
    cardForeground: "#0F172A",

    // Borders & inputs
    border: "#E2E8F0",
    borderHover: "#CBD5E1",
    input: "#E2E8F0",
    inputFocus: "#8B5CF6",
    ring: "#8B5CF6",

    // Background & foreground
    background: "#FAFAFA",
    foreground: "#0F172A",

    // Status colors
    success: "#10B981",
    successHover: "#059669",
    successForeground: "#FFFFFF",
    warning: "#F59E0B",
    warningHover: "#D97706",
    warningForeground: "#FFFFFF",
    info: "#3B82F6",
    infoHover: "#2563EB",
    infoForeground: "#FFFFFF",

    // Utility colors
    overlay: "rgba(15, 23, 42, 0.5)",
    overlayLight: "rgba(15, 23, 42, 0.3)",
    overlayDark: "rgba(15, 23, 42, 0.8)",
    white: "#FFFFFF",
    black: "#000000",

    // Glass-morphism
    glass: "rgba(255, 255, 255, 0.8)",
    glassBorder: "rgba(255, 255, 255, 0.2)",

    // Avatar colors
    avatarColors: [
      "#8B5CF6", // Primary violet
      "#F59E0B", // Accent gold
      "#10B981", // Success green
      "#3B82F6", // Info blue
      "#EF4444", // Destructive red
      "#EC4899", // Pink
      "#06B6D4", // Cyan
      "#6366F1", // Indigo
      "#14B8A6", // Teal
      "#F97316", // Orange
      "#84CC16", // Lime
      "#A855F7", // Purple
    ],
  },
  gradients: {
    primary: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
    accent: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    glass: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
    glow: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
    shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 40,
    "3xl": 56,
    xxl: 48,
  },
  typography: {
    fontFamilyDisplay: '"Fraunces", Georgia, "Times New Roman", serif',
    fontFamilyBody: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
      "5xl": 48,
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2.0,
    },
    letterSpacing: {
      tighter: -0.05,
      tight: -0.025,
      normal: 0,
      wide: 0.025,
      wider: 0.05,
      widest: 0.1,
    },
  },
  borders: {
    radius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      "2xl": 24,
      full: 9999,
    },
    width: {
      none: 0,
      thin: 1,
      normal: 2,
      thick: 4,
    },
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
    sm: "0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px -1px rgba(15, 23, 42, 0.1)",
    md: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)",
    lg: "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
    xl: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
    inner: "inset 0 2px 4px 0 rgba(15, 23, 42, 0.05)",
    glow: "0 0 20px rgba(139, 92, 246, 0.3)",
  },
  animation: {
    duration: {
      instant: 0,
      fast: 150,
      normal: 250,
      slow: 400,
      slower: 600,
    },
    easing: {
      linear: "linear",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },
};

// =============================================================================
// DARK THEME
// =============================================================================

export const darkTheme: Theme = {
  name: "Dark",
  colors: {
    // Primary palette (Electric Violet - brighter for dark mode)
    primary: "#A78BFA",
    primaryHover: "#8B5CF6",
    primaryActive: "#7C3AED",
    primaryMuted: "#2E1065",
    primaryForeground: "#FFFFFF",

    // Accent palette (Amber Gold)
    accent: "#FBBF24",
    accentHover: "#F59E0B",
    accentActive: "#D97706",
    accentMuted: "#451A03",
    accentForeground: "#0F172A",

    // Secondary palette
    secondary: "#1E293B",
    secondaryHover: "#334155",
    secondaryForeground: "#F8FAFC",

    // Destructive palette
    destructive: "#F87171",
    destructiveHover: "#EF4444",
    destructiveForeground: "#FFFFFF",

    // Muted/Subtle
    muted: "#1E293B",
    mutedForeground: "#94A3B8",

    // Surface colors
    card: "#1A1A1A",
    cardHover: "#262626",
    cardForeground: "#F8FAFC",

    // Borders & inputs
    border: "#334155",
    borderHover: "#475569",
    input: "#334155",
    inputFocus: "#A78BFA",
    ring: "#A78BFA",

    // Background & foreground
    background: "#0F0F0F",
    foreground: "#F8FAFC",

    // Status colors
    success: "#34D399",
    successHover: "#10B981",
    successForeground: "#0F172A",
    warning: "#FBBF24",
    warningHover: "#F59E0B",
    warningForeground: "#0F172A",
    info: "#60A5FA",
    infoHover: "#3B82F6",
    infoForeground: "#0F172A",

    // Utility colors
    overlay: "rgba(0, 0, 0, 0.7)",
    overlayLight: "rgba(0, 0, 0, 0.5)",
    overlayDark: "rgba(0, 0, 0, 0.9)",
    white: "#FFFFFF",
    black: "#000000",

    // Glass-morphism (dark variant)
    glass: "rgba(26, 26, 26, 0.8)",
    glassBorder: "rgba(255, 255, 255, 0.1)",

    // Avatar colors (same vibrant colors work well on dark)
    avatarColors: [
      "#A78BFA",
      "#FBBF24",
      "#34D399",
      "#60A5FA",
      "#F87171",
      "#F472B6",
      "#22D3EE",
      "#818CF8",
      "#2DD4BF",
      "#FB923C",
      "#A3E635",
      "#C084FC",
    ],
  },
  gradients: {
    primary: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
    accent: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
    glass: "linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.7) 100%)",
    glow: "radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)",
    shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  borders: defaultTheme.borders,
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
    glow: "0 0 20px rgba(167, 139, 250, 0.4)",
  },
  animation: defaultTheme.animation,
};

// =============================================================================
// THEME VARIANTS (Optional accent color variations)
// =============================================================================

// Blue theme variant
export const blueTheme: Theme = {
  ...defaultTheme,
  name: "Blue",
  colors: {
    ...defaultTheme.colors,
    primary: "#3B82F6",
    primaryHover: "#2563EB",
    primaryActive: "#1D4ED8",
    primaryMuted: "#DBEAFE",
    ring: "#3B82F6",
    inputFocus: "#3B82F6",
  },
  gradients: {
    ...defaultTheme.gradients,
    primary: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    glow: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
  },
  shadows: {
    ...defaultTheme.shadows,
    glow: "0 0 20px rgba(59, 130, 246, 0.3)",
  },
};

// Green theme variant
export const greenTheme: Theme = {
  ...defaultTheme,
  name: "Green",
  colors: {
    ...defaultTheme.colors,
    primary: "#10B981",
    primaryHover: "#059669",
    primaryActive: "#047857",
    primaryMuted: "#D1FAE5",
    ring: "#10B981",
    inputFocus: "#10B981",
  },
  gradients: {
    ...defaultTheme.gradients,
    primary: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
    glow: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
  },
  shadows: {
    ...defaultTheme.shadows,
    glow: "0 0 20px rgba(16, 185, 129, 0.3)",
  },
};

// Purple theme variant (same as default but named)
export const purpleTheme: Theme = {
  ...defaultTheme,
  name: "Purple",
};

// Rose theme variant
export const roseTheme: Theme = {
  ...defaultTheme,
  name: "Rose",
  colors: {
    ...defaultTheme.colors,
    primary: "#F43F5E",
    primaryHover: "#E11D48",
    primaryActive: "#BE123C",
    primaryMuted: "#FFE4E6",
    ring: "#F43F5E",
    inputFocus: "#F43F5E",
  },
  gradients: {
    ...defaultTheme.gradients,
    primary: "linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)",
    glow: "radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)",
  },
  shadows: {
    ...defaultTheme.shadows,
    glow: "0 0 20px rgba(244, 63, 94, 0.3)",
  },
};

// Orange theme variant
export const orangeTheme: Theme = {
  ...defaultTheme,
  name: "Orange",
  colors: {
    ...defaultTheme.colors,
    primary: "#F97316",
    primaryHover: "#EA580C",
    primaryActive: "#C2410C",
    primaryMuted: "#FFEDD5",
    ring: "#F97316",
    inputFocus: "#F97316",
  },
  gradients: {
    ...defaultTheme.gradients,
    primary: "linear-gradient(135deg, #F97316 0%, #C2410C 100%)",
    glow: "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
  },
  shadows: {
    ...defaultTheme.shadows,
    glow: "0 0 20px rgba(249, 115, 22, 0.3)",
  },
};

// =============================================================================
// AVAILABLE THEMES
// =============================================================================

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
