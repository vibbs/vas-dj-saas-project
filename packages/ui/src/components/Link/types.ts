export interface LinkProps {
  children?: React.ReactNode;
  href?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'destructive';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  underline?: 'always' | 'hover' | 'never';
  external?: boolean;
  disabled?: boolean;
  // Platform-specific handlers
  onPress?: () => void;  // React Native
  onClick?: () => void;  // Web
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Web-specific props
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  download?: boolean | string;
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'link' | 'button' | 'none'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'; // Web: Current item in a set
  role?: string;                   // Web: Element role
}