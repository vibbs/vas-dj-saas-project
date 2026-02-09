import { ReactNode } from 'react';

export interface LabelProps {
  /**
   * Label text or content
   */
  children: ReactNode;

  /**
   * ID of the form element this label is for (web only)
   */
  htmlFor?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Disabled state
   */
  disabled?: boolean;

  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing

  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  'aria-label'?: string;           // Web: Accessible name
}
