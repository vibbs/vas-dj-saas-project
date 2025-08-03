export interface ListItemProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  avatar?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  divider?: boolean;
  dense?: boolean;
  multiline?: boolean;
  onPress?: () => void;
  onClick?: () => void;
  onLongPress?: () => void;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // Cross-platform style object
  contentStyle?: any;   // Style for content area
  titleStyle?: any;     // Style for title
  subtitleStyle?: any;  // Style for subtitle
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  'aria-label'?: string;               // Web: Accessible name
  'aria-describedby'?: string;         // Web: References describing elements
  'aria-selected'?: boolean;           // Web: Selection state
  role?: string;                       // Web: Element role
  accessibilityRole?: 'button' | 'text' | 'menuitem'; // React Native: Element role
  accessibilityLabel?: string;         // React Native: Accessible name
  accessibilityHint?: string;          // React Native: Additional context
  accessibilityState?: {               // React Native: State information
    disabled?: boolean;
    selected?: boolean;
  };
}