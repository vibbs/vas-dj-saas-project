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
  
  // Spacing variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = `${value}px`;
  });
  
  // Typography variables
  cssVars['--font-family'] = theme.typography.fontFamily;
  
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
  // Colors
  primary: 'var(--color-primary)',
  primaryForeground: 'var(--color-primary-foreground)',
  secondary: 'var(--color-secondary)',
  secondaryForeground: 'var(--color-secondary-foreground)',
  background: 'var(--color-background)',
  foreground: 'var(--color-foreground)',
  muted: 'var(--color-muted)',
  mutedForeground: 'var(--color-muted-foreground)',
  border: 'var(--color-border)',
  success: 'var(--color-success)',
  successForeground: 'var(--color-success-foreground)',
  warning: 'var(--color-warning)',
  warningForeground: 'var(--color-warning-foreground)',
  destructive: 'var(--color-destructive)',
  destructiveForeground: 'var(--color-destructive-foreground)',
  info: 'var(--color-info)',
  infoForeground: 'var(--color-info-foreground)',
  
  // Spacing
  spacingXs: 'var(--spacing-xs)',
  spacingSm: 'var(--spacing-sm)',
  spacingMd: 'var(--spacing-md)',
  spacingLg: 'var(--spacing-lg)',
  spacingXl: 'var(--spacing-xl)',
  
  // Typography
  fontFamily: 'var(--font-family)',
  fontSizeXs: 'var(--font-size-xs)',
  fontSizeSm: 'var(--font-size-sm)',
  fontSizeBase: 'var(--font-size-base)',
  fontSizeLg: 'var(--font-size-lg)',
  fontSizeXl: 'var(--font-size-xl)',
  
  // Borders
  borderRadiusSm: 'var(--border-radius-sm)',
  borderRadiusMd: 'var(--border-radius-md)',
  borderRadiusLg: 'var(--border-radius-lg)',
  borderRadiusFull: 'var(--border-radius-full)',
  
  // Shadows
  shadowSm: 'var(--shadow-sm)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',
} as const;