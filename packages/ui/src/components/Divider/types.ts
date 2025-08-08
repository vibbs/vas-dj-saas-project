export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
  margin?: number;
  length?: number | string;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  'aria-orientation'?: 'horizontal' | 'vertical';  // Web: Divider orientation
  role?: string;                                   // Web: Element role
  accessibilityRole?: 'none';                     // React Native: Element role
  accessibilityLabel?: string;                     // React Native: Accessible name
}