export interface HeadingProps {
  children?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'display' | 'title' | 'subtitle' | 'body';
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'muted' | 'destructive' | 'inherit';
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'text' | 'none'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-level'?: number;           // Web: Heading level for screen readers
  role?: string;                   // Web: Element role
  id?: string;                     // Web: For anchor links and references
}