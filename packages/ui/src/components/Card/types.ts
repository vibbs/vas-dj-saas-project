export interface CardProps {
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  // Platform-specific handlers
  onPress?: () => void;  // React Native
  onClick?: () => void;  // Web
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'button' | 'link' | 'none' | 'menuitem'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-pressed'?: boolean;        // Web: Toggle button state
  role?: string;                   // Web: Element role
  type?: 'button' | 'submit' | 'reset'; // Web: Button type
}