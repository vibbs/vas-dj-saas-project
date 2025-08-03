export interface AppBarAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  disabled?: boolean;
  badge?: string | number;
}

export interface AppBarProps {
  // Content
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  
  // Actions
  actions?: AppBarAction[];
  backAction?: {
    icon?: React.ReactNode;
    label?: string;
    onPress?: () => void;  // React Native
    onClick?: () => void;  // Web
  };
  
  // Display options
  position?: 'static' | 'fixed' | 'sticky';
  elevation?: number;
  transparent?: boolean;
  
  // Styling
  height?: number;
  variant?: 'default' | 'minimal' | 'prominent';
  
  // Navigation handlers
  onActionPress?: (action: AppBarAction) => void;  // React Native
  onActionClick?: (action: AppBarAction) => void;  // Web
  onTitlePress?: () => void;  // React Native
  onTitleClick?: () => void;  // Web
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  
  // Custom content areas
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
}

export interface AppBarActionComponentProps {
  action: AppBarAction;
  onPress?: () => void;
  onClick?: () => void;
  variant: 'default' | 'minimal' | 'prominent';
  style?: any;
  className?: string;
  testID?: string;
}