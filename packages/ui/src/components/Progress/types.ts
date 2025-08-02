export interface ProgressProps {
  // Core functionality
  value: number; // Progress value between 0 and 100
  variant?: 'linear' | 'circular';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Appearance
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  track?: boolean; // Show background track
  label?: boolean; // Show percentage label
  thickness?: number; // For circular variant, stroke width
  
  // Circular specific
  radius?: number; // For circular variant, custom radius
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'none'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-valuemin'?: number;        // Web: Minimum value
  'aria-valuemax'?: number;        // Web: Maximum value
  'aria-valuenow'?: number;        // Web: Current value
  role?: string;                   // Web: Element role
}