export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  
  // Display options
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  
  // Styling
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
  
  // Platform-specific handlers
  onPress?: (page: number) => void;  // React Native
  onClick?: (page: number) => void;  // Web
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  
  // Loading and disabled states
  disabled?: boolean;
  loading?: boolean;
  
  // Custom labels
  previousLabel?: string;
  nextLabel?: string;
  firstLabel?: string;
  lastLabel?: string;
}

export interface PaginationItemProps {
  page: number | 'prev' | 'next' | 'first' | 'last' | 'ellipsis';
  isActive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onClick?: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
  style?: any;
  className?: string;
  testID?: string;
}