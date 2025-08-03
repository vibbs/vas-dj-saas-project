export interface CollapseProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  trigger?: React.ReactNode;
  triggerWhenClosed?: React.ReactNode;
  triggerWhenOpen?: React.ReactNode;
  animationDuration?: number;
  disabled?: boolean;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  contentStyle?: any;   // Style for content area
  triggerStyle?: any;   // Style for trigger area
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  'aria-expanded'?: boolean;           // Web: Expansion state
  'aria-controls'?: string;            // Web: References controlled element
  'aria-labelledby'?: string;          // Web: References labeling element
  role?: string;                       // Web: Element role
  accessibilityRole?: 'button' | 'none'; // React Native: Element role
  accessibilityLabel?: string;         // React Native: Accessible name
  accessibilityHint?: string;          // React Native: Additional context
  accessibilityState?: {               // React Native: State information
    expanded?: boolean;
    disabled?: boolean;
  };
}