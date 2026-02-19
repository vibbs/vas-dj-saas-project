// VAS-DJ Theme variants extending the base design system
import { Theme, defaultTheme, darkTheme } from "./tokens";

// Helper to create a theme variant by overriding specific colors
function createThemeVariant(
  name: string,
  baseTheme: Theme,
  colorOverrides: Partial<Theme["colors"]>,
  gradientOverrides?: Partial<Theme["gradients"]>,
  shadowOverrides?: Partial<Theme["shadows"]>
): Theme {
  return {
    ...baseTheme,
    name,
    colors: {
      ...baseTheme.colors,
      ...colorOverrides,
    },
    gradients: {
      ...baseTheme.gradients,
      ...gradientOverrides,
    },
    shadows: {
      ...baseTheme.shadows,
      ...shadowOverrides,
    },
  };
}

// Lumen Theme - Blue professional
export const lumenTheme: Theme = createThemeVariant(
  "Lumen",
  defaultTheme,
  {
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    primaryActive: "#1E40AF",
    primaryMuted: "#DBEAFE",
    accent: "#4F46E5",
    accentHover: "#4338CA",
    accentActive: "#3730A3",
    accentMuted: "#E0E7FF",
    ring: "#93C5FD",
    inputFocus: "#2563EB",
  },
  {
    primary: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
    glow: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(37, 99, 235, 0.3)",
  }
);

// Lumen Dark Theme
export const lumenDarkTheme: Theme = createThemeVariant(
  "Lumen Dark",
  darkTheme,
  {
    primary: "#60A5FA",
    primaryHover: "#3B82F6",
    primaryActive: "#2563EB",
    primaryMuted: "#1E3A5F",
    accent: "#818CF8",
    accentHover: "#6366F1",
    accentActive: "#4F46E5",
    accentMuted: "#312E81",
    ring: "#60A5FA",
    inputFocus: "#60A5FA",
  },
  {
    primary: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
    glow: "radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(96, 165, 250, 0.4)",
  }
);

// Verdant Theme - Green nature
export const verdantTheme: Theme = createThemeVariant(
  "Verdant",
  defaultTheme,
  {
    primary: "#10B981",
    primaryHover: "#059669",
    primaryActive: "#047857",
    primaryMuted: "#D1FAE5",
    accent: "#14B8A6",
    accentHover: "#0D9488",
    accentActive: "#0F766E",
    accentMuted: "#CCFBF1",
    ring: "#6EE7B7",
    inputFocus: "#10B981",
  },
  {
    primary: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
    glow: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(16, 185, 129, 0.3)",
  }
);

// Verdant Dark Theme
export const verdantDarkTheme: Theme = createThemeVariant(
  "Verdant Dark",
  darkTheme,
  {
    primary: "#34D399",
    primaryHover: "#10B981",
    primaryActive: "#059669",
    primaryMuted: "#064E3B",
    accent: "#2DD4BF",
    accentHover: "#14B8A6",
    accentActive: "#0D9488",
    accentMuted: "#134E4A",
    ring: "#34D399",
    inputFocus: "#34D399",
  },
  {
    primary: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
    glow: "radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(52, 211, 153, 0.4)",
  }
);

// Ember Theme - Warm orange/red
export const emberTheme: Theme = createThemeVariant(
  "Ember",
  defaultTheme,
  {
    primary: "#F97316",
    primaryHover: "#EA580C",
    primaryActive: "#C2410C",
    primaryMuted: "#FFEDD5",
    accent: "#EF4444",
    accentHover: "#DC2626",
    accentActive: "#B91C1C",
    accentMuted: "#FEE2E2",
    ring: "#FDBA74",
    inputFocus: "#F97316",
  },
  {
    primary: "linear-gradient(135deg, #F97316 0%, #C2410C 100%)",
    glow: "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(249, 115, 22, 0.3)",
  }
);

// Ember Dark Theme
export const emberDarkTheme: Theme = createThemeVariant(
  "Ember Dark",
  darkTheme,
  {
    primary: "#FB923C",
    primaryHover: "#F97316",
    primaryActive: "#EA580C",
    primaryMuted: "#7C2D12",
    accent: "#F87171",
    accentHover: "#EF4444",
    accentActive: "#DC2626",
    accentMuted: "#7F1D1D",
    ring: "#FB923C",
    inputFocus: "#FB923C",
  },
  {
    primary: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
    glow: "radial-gradient(circle, rgba(251, 146, 60, 0.2) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(251, 146, 60, 0.4)",
  }
);

// Amethyst Theme - Purple elegant
export const amethystTheme: Theme = createThemeVariant(
  "Amethyst",
  defaultTheme,
  {
    primary: "#8B5CF6",
    primaryHover: "#7C3AED",
    primaryActive: "#6D28D9",
    primaryMuted: "#EDE9FE",
    accent: "#EC4899",
    accentHover: "#DB2777",
    accentActive: "#BE185D",
    accentMuted: "#FCE7F3",
    ring: "#A78BFA",
    inputFocus: "#8B5CF6",
  },
  {
    primary: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
    glow: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(139, 92, 246, 0.3)",
  }
);

// Amethyst Dark Theme
export const amethystDarkTheme: Theme = createThemeVariant(
  "Amethyst Dark",
  darkTheme,
  {
    primary: "#A78BFA",
    primaryHover: "#8B5CF6",
    primaryActive: "#7C3AED",
    primaryMuted: "#2E1065",
    accent: "#F472B6",
    accentHover: "#EC4899",
    accentActive: "#DB2777",
    accentMuted: "#831843",
    ring: "#A78BFA",
    inputFocus: "#A78BFA",
  },
  {
    primary: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
    glow: "radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(167, 139, 250, 0.4)",
  }
);

// Ocean Theme - Deep blue
export const oceanTheme: Theme = createThemeVariant(
  "Ocean",
  defaultTheme,
  {
    primary: "#0EA5E9",
    primaryHover: "#0284C7",
    primaryActive: "#0369A1",
    primaryMuted: "#E0F2FE",
    accent: "#06B6D4",
    accentHover: "#0891B2",
    accentActive: "#0E7490",
    accentMuted: "#CFFAFE",
    ring: "#38BDF8",
    inputFocus: "#0EA5E9",
  },
  {
    primary: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)",
    glow: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(14, 165, 233, 0.3)",
  }
);

// Ocean Dark Theme
export const oceanDarkTheme: Theme = createThemeVariant(
  "Ocean Dark",
  darkTheme,
  {
    primary: "#38BDF8",
    primaryHover: "#0EA5E9",
    primaryActive: "#0284C7",
    primaryMuted: "#0C4A6E",
    accent: "#22D3EE",
    accentHover: "#06B6D4",
    accentActive: "#0891B2",
    accentMuted: "#164E63",
    ring: "#38BDF8",
    inputFocus: "#38BDF8",
  },
  {
    primary: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
    glow: "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(56, 189, 248, 0.4)",
  }
);

// Rose Theme - Pink elegant
export const roseVasdjTheme: Theme = createThemeVariant(
  "Rose",
  defaultTheme,
  {
    primary: "#F43F5E",
    primaryHover: "#E11D48",
    primaryActive: "#BE123C",
    primaryMuted: "#FFE4E6",
    accent: "#EC4899",
    accentHover: "#DB2777",
    accentActive: "#BE185D",
    accentMuted: "#FCE7F3",
    ring: "#FB7185",
    inputFocus: "#F43F5E",
  },
  {
    primary: "linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)",
    glow: "radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(244, 63, 94, 0.3)",
  }
);

// Rose Dark Theme
export const roseVasdjDarkTheme: Theme = createThemeVariant(
  "Rose Dark",
  darkTheme,
  {
    primary: "#FB7185",
    primaryHover: "#F43F5E",
    primaryActive: "#E11D48",
    primaryMuted: "#881337",
    accent: "#F472B6",
    accentHover: "#EC4899",
    accentActive: "#DB2777",
    accentMuted: "#831843",
    ring: "#FB7185",
    inputFocus: "#FB7185",
  },
  {
    primary: "linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)",
    glow: "radial-gradient(circle, rgba(251, 113, 133, 0.2) 0%, transparent 70%)",
  },
  {
    glow: "0 0 20px rgba(251, 113, 133, 0.4)",
  }
);

// Export all VAS-DJ themes
export const vasdjThemes = {
  lumen: lumenTheme,
  lumenDark: lumenDarkTheme,
  verdant: verdantTheme,
  verdantDark: verdantDarkTheme,
  ember: emberTheme,
  emberDark: emberDarkTheme,
  amethyst: amethystTheme,
  amethystDark: amethystDarkTheme,
  ocean: oceanTheme,
  oceanDark: oceanDarkTheme,
  rose: roseVasdjTheme,
  roseDark: roseVasdjDarkTheme,
} as const;

export type VasdjThemeName = keyof typeof vasdjThemes;

// Backward compatibility exports
export const themes = vasdjThemes;
export type ThemeName = VasdjThemeName;
