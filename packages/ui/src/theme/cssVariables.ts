import { Theme } from './tokens';

/**
 * Converts theme colors to CSS custom properties (variables)
 * This enables using theme colors in regular CSS and styled components
 */
export function themeToCssVariables(theme: Theme): Record<string, string> {
  const cssVars: Record<string, string> = {};

  // Color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Handle avatar colors array
      value.forEach((color, index) => {
        cssVars[`--color-${key}-${index}`] = color;
      });
    } else {
      cssVars[`--color-${kebabCase(key)}`] = value;
    }
  });

  // Gradient variables
  Object.entries(theme.gradients).forEach(([key, value]) => {
    cssVars[`--gradient-${key}`] = value;
  });

  // Spacing variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = `${value}px`;
  });

  // Typography variables
  cssVars['--font-family'] = theme.typography.fontFamily;
  cssVars['--font-family-display'] = theme.typography.fontFamilyDisplay;
  cssVars['--font-family-body'] = theme.typography.fontFamilyBody;
  cssVars['--font-family-mono'] = theme.typography.fontFamilyMono;

  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = `${value}px`;
  });

  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    cssVars[`--font-weight-${key}`] = value;
  });

  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    cssVars[`--line-height-${key}`] = value.toString();
  });

  Object.entries(theme.typography.letterSpacing).forEach(([key, value]) => {
    cssVars[`--letter-spacing-${key}`] = `${value}em`;
  });

  // Border variables
  Object.entries(theme.borders.radius).forEach(([key, value]) => {
    cssVars[`--border-radius-${key}`] = `${value}px`;
  });

  Object.entries(theme.borders.width).forEach(([key, value]) => {
    cssVars[`--border-width-${key}`] = `${value}px`;
  });

  // Shadow variables
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });

  // Animation variables
  Object.entries(theme.animation.duration).forEach(([key, value]) => {
    cssVars[`--animation-duration-${key}`] = `${value}ms`;
  });

  Object.entries(theme.animation.easing).forEach(([key, value]) => {
    cssVars[`--animation-easing-${key}`] = value;
  });

  return cssVars;
}

/**
 * Injects theme CSS variables into the document root
 * This makes theme values available as CSS custom properties throughout the app
 */
export function injectThemeCssVariables(theme: Theme): void {
  if (typeof document === 'undefined') return; // Skip on server-side

  const cssVars = themeToCssVariables(theme);
  const root = document.documentElement;

  // Apply all CSS variables to :root
  Object.entries(cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Add a data attribute to indicate current theme
  root.setAttribute('data-theme', theme.name.toLowerCase().replace(/\s+/g, '-'));
}

/**
 * Creates a CSS string with all theme variables for server-side rendering
 */
export function generateThemeCssString(theme: Theme): string {
  const cssVars = themeToCssVariables(theme);

  const cssVarDeclarations = Object.entries(cssVars)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');

  return `:root {\n${cssVarDeclarations}\n}`;
}

/**
 * Helper function to convert camelCase to kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Hook to access CSS variable names for a theme
 * Useful for styled-components or emotion
 */
export function getThemeCssVar(path: string): string {
  return `var(--${kebabCase(path)})`;
}

// Pre-built CSS variable accessors for common use
export const cssVars = {
  // Colors - Primary
  primary: 'var(--color-primary)',
  primaryHover: 'var(--color-primary-hover)',
  primaryActive: 'var(--color-primary-active)',
  primaryMuted: 'var(--color-primary-muted)',
  primaryForeground: 'var(--color-primary-foreground)',

  // Colors - Accent
  accent: 'var(--color-accent)',
  accentHover: 'var(--color-accent-hover)',
  accentActive: 'var(--color-accent-active)',
  accentMuted: 'var(--color-accent-muted)',
  accentForeground: 'var(--color-accent-foreground)',

  // Colors - Secondary
  secondary: 'var(--color-secondary)',
  secondaryHover: 'var(--color-secondary-hover)',
  secondaryForeground: 'var(--color-secondary-foreground)',

  // Colors - Background/Foreground
  background: 'var(--color-background)',
  foreground: 'var(--color-foreground)',

  // Colors - Card
  card: 'var(--color-card)',
  cardHover: 'var(--color-card-hover)',
  cardForeground: 'var(--color-card-foreground)',

  // Colors - Muted
  muted: 'var(--color-muted)',
  mutedForeground: 'var(--color-muted-foreground)',

  // Colors - Border & Input
  border: 'var(--color-border)',
  borderHover: 'var(--color-border-hover)',
  input: 'var(--color-input)',
  inputFocus: 'var(--color-input-focus)',
  ring: 'var(--color-ring)',

  // Colors - Status
  success: 'var(--color-success)',
  successHover: 'var(--color-success-hover)',
  successForeground: 'var(--color-success-foreground)',
  warning: 'var(--color-warning)',
  warningHover: 'var(--color-warning-hover)',
  warningForeground: 'var(--color-warning-foreground)',
  destructive: 'var(--color-destructive)',
  destructiveHover: 'var(--color-destructive-hover)',
  destructiveForeground: 'var(--color-destructive-foreground)',
  info: 'var(--color-info)',
  infoHover: 'var(--color-info-hover)',
  infoForeground: 'var(--color-info-foreground)',

  // Colors - Utility
  overlay: 'var(--color-overlay)',
  overlayLight: 'var(--color-overlay-light)',
  overlayDark: 'var(--color-overlay-dark)',
  glass: 'var(--color-glass)',
  glassBorder: 'var(--color-glass-border)',

  // Gradients
  gradientPrimary: 'var(--gradient-primary)',
  gradientAccent: 'var(--gradient-accent)',
  gradientGlass: 'var(--gradient-glass)',
  gradientGlow: 'var(--gradient-glow)',
  gradientShimmer: 'var(--gradient-shimmer)',

  // Spacing
  spacingXs: 'var(--spacing-xs)',
  spacingSm: 'var(--spacing-sm)',
  spacingMd: 'var(--spacing-md)',
  spacingLg: 'var(--spacing-lg)',
  spacingXl: 'var(--spacing-xl)',
  spacing2xl: 'var(--spacing-2xl)',
  spacing3xl: 'var(--spacing-3xl)',

  // Typography - Font Family
  fontFamily: 'var(--font-family)',
  fontFamilyDisplay: 'var(--font-family-display)',
  fontFamilyBody: 'var(--font-family-body)',
  fontFamilyMono: 'var(--font-family-mono)',

  // Typography - Font Size
  fontSizeXs: 'var(--font-size-xs)',
  fontSizeSm: 'var(--font-size-sm)',
  fontSizeBase: 'var(--font-size-base)',
  fontSizeLg: 'var(--font-size-lg)',
  fontSizeXl: 'var(--font-size-xl)',
  fontSize2xl: 'var(--font-size-2xl)',
  fontSize3xl: 'var(--font-size-3xl)',
  fontSize4xl: 'var(--font-size-4xl)',
  fontSize5xl: 'var(--font-size-5xl)',

  // Typography - Font Weight
  fontWeightNormal: 'var(--font-weight-normal)',
  fontWeightMedium: 'var(--font-weight-medium)',
  fontWeightSemibold: 'var(--font-weight-semibold)',
  fontWeightBold: 'var(--font-weight-bold)',

  // Typography - Line Height
  lineHeightNone: 'var(--line-height-none)',
  lineHeightTight: 'var(--line-height-tight)',
  lineHeightNormal: 'var(--line-height-normal)',
  lineHeightRelaxed: 'var(--line-height-relaxed)',
  lineHeightLoose: 'var(--line-height-loose)',

  // Borders - Radius
  borderRadiusNone: 'var(--border-radius-none)',
  borderRadiusSm: 'var(--border-radius-sm)',
  borderRadiusMd: 'var(--border-radius-md)',
  borderRadiusLg: 'var(--border-radius-lg)',
  borderRadiusXl: 'var(--border-radius-xl)',
  borderRadius2xl: 'var(--border-radius-2xl)',
  borderRadiusFull: 'var(--border-radius-full)',

  // Shadows
  shadowXs: 'var(--shadow-xs)',
  shadowSm: 'var(--shadow-sm)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',
  shadowXl: 'var(--shadow-xl)',
  shadowInner: 'var(--shadow-inner)',
  shadowGlow: 'var(--shadow-glow)',

  // Animation - Duration
  animationDurationInstant: 'var(--animation-duration-instant)',
  animationDurationFast: 'var(--animation-duration-fast)',
  animationDurationNormal: 'var(--animation-duration-normal)',
  animationDurationSlow: 'var(--animation-duration-slow)',
  animationDurationSlower: 'var(--animation-duration-slower)',

  // Animation - Easing
  animationEasingLinear: 'var(--animation-easing-linear)',
  animationEasingEaseIn: 'var(--animation-easing-ease-in)',
  animationEasingEaseOut: 'var(--animation-easing-ease-out)',
  animationEasingEaseInOut: 'var(--animation-easing-ease-in-out)',
  animationEasingSpring: 'var(--animation-easing-spring)',
  animationEasingBounce: 'var(--animation-easing-bounce)',
} as const;
