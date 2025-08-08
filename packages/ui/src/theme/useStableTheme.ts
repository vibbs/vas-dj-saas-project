import { useMemo } from 'react';
import { useTheme } from './ThemeProvider';
import { Theme } from './tokens';

/**
 * Mobile-optimized theme hook that provides stable theme references
 * to prevent unnecessary re-renders in React Native StyleSheet.create calls
 */
export function useStableTheme() {
  const { theme, themeName, setTheme, toggleTheme } = useTheme();
  
  // Memoize theme object to ensure reference stability
  const stableTheme = useMemo(() => theme, [
    theme.colors.primary,
    theme.colors.background,
    theme.colors.foreground,
    themeName, // Re-memoize only when theme actually changes
  ]);
  
  return {
    theme: stableTheme,
    themeName,
    setTheme,
    toggleTheme,
  };
}

/**
 * Creates a memoized StyleSheet for React Native components
 * Usage: const styles = useThemedStyles(createStyles);
 */
export function useThemedStyles<T>(
  createStyles: (theme: Theme) => T,
  deps: React.DependencyList = []
): T {
  const { theme } = useStableTheme();
  
  return useMemo(() => createStyles(theme), [theme, ...deps]);
}