export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  
  // Display options
  separator?: React.ReactNode | string;
  showHomeIcon?: boolean;
  maxItems?: number;
  
  // Styling
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  
  // Navigation handlers
  onItemPress?: (item: BreadcrumbItem, index: number) => void;  // React Native
  onItemClick?: (item: BreadcrumbItem, index: number) => void;  // Web
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
}

export interface BreadcrumbItemComponentProps {
  item: BreadcrumbItem;
  index: number;
  isLast: boolean;
  separator?: React.ReactNode | string;
  onPress?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  style?: any;
  className?: string;
  testID?: string;
}