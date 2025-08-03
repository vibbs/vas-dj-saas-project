export interface EmptyStateProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  image?: React.ReactNode;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'illustration';
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // Cross-platform style object
  titleStyle?: any;     // Style for title
  descriptionStyle?: any; // Style for description
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  'aria-label'?: string;               // Web: Accessible name
  'aria-describedby'?: string;         // Web: References describing elements
  role?: string;                       // Web: Element role
  accessibilityRole?: 'text' | 'none'; // React Native: Element role
  accessibilityLabel?: string;         // React Native: Accessible name
  accessibilityHint?: string;          // React Native: Additional context
}