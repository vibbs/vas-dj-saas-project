export interface ScrollAreaProps {
  children?: React.ReactNode;
  height?: number | string;
  maxHeight?: number | string;
  width?: number | string;
  maxWidth?: number | string;
  scrollDirection?: 'vertical' | 'horizontal' | 'both';
  showScrollbars?: boolean;
  scrollbarSize?: number;
  fadeScrollbars?: boolean;
  onScroll?: (event: any) => void;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // Cross-platform style object
  contentStyle?: any;   // Style for content container
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  'aria-label'?: string;               // Web: Accessible name
  'aria-describedby'?: string;         // Web: References describing elements
  role?: string;                       // Web: Element role
  tabIndex?: number;                   // Web: Tab order
  accessibilityRole?: 'scrollbar' | 'none'; // React Native: Element role
  accessibilityLabel?: string;         // React Native: Accessible name
  accessibilityHint?: string;          // React Native: Additional context
}