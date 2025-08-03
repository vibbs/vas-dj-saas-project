export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  
  // Display options
  collapsed?: boolean;
  collapsible?: boolean;
  position?: 'left' | 'right';
  overlay?: boolean;
  
  // Styling
  width?: number | string;
  collapsedWidth?: number;
  variant?: 'default' | 'minimal' | 'floating';
  
  // Navigation handlers
  onItemPress?: (item: SidebarItem) => void;  // React Native
  onItemClick?: (item: SidebarItem) => void;  // Web
  onToggle?: (collapsed: boolean) => void;
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  
  // Header and footer content
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface SidebarItemComponentProps {
  item: SidebarItem;
  level: number;
  collapsed: boolean;
  onPress?: () => void;
  onClick?: () => void;
  variant: 'default' | 'minimal' | 'floating';
  style?: any;
  className?: string;
  testID?: string;
}