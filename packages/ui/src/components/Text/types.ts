export interface TextProps {
  children?: React.ReactNode;
  variant?: 'body' | 'small' | 'large' | 'caption' | 'overline';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'primary' | 'secondary' | 'muted' | 'destructive' | 'inherit';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'text' | 'none' | 'summary'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  role?: string;                   // Web: Element role
  id?: string;                     // Web: For references
}