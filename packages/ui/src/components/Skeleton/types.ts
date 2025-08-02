export interface SkeletonProps {
  // Layout and appearance
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: number | string;
  height?: number | string;
  lines?: number; // For text variant - number of text lines
  animation?: 'pulse' | 'wave' | 'none';
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'progressbar' | 'none'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-busy'?: boolean;           // Web: Loading state
  role?: string;                   // Web: Element role
}