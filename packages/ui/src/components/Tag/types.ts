export interface TagProps {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  disabled?: boolean;
  outlined?: boolean;
  rounded?: boolean;
  icon?: React.ReactNode;
  onClose?: () => void;
  onPress?: () => void;
  onClick?: () => void;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // Cross-platform style object
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  'aria-label'?: string;               // Web: Accessible name
  'aria-describedby'?: string;         // Web: References describing elements
  role?: string;                       // Web: Element role
  accessibilityRole?: 'button' | 'text' | 'none'; // React Native: Element role
  accessibilityLabel?: string;         // React Native: Accessible name
  accessibilityHint?: string;          // React Native: Additional context
  accessibilityState?: {               // React Native: State information
    disabled?: boolean;
    selected?: boolean;
  };
}