export interface SeparatorProps {
  /**
   * Orientation of the separator
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Whether the separator is decorative (no semantic meaning)
   * @default true
   */
  decorative?: boolean;

  /**
   * Thickness of the separator line
   */
  thickness?: number;

  /**
   * Color variant
   */
  variant?: 'default' | 'muted';

  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing

  // Accessibility props
  accessibilityLabel?: string;     // React Native
  'aria-label'?: string;           // Web
}
