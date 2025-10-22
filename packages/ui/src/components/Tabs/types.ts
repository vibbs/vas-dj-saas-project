import { ReactNode } from 'react';

export interface TabsProps {
  /**
   * Currently active tab value
   */
  value?: string;

  /**
   * Callback when tab changes
   */
  onValueChange?: (value: string) => void;

  /**
   * Default tab value (for uncontrolled usage)
   */
  defaultValue?: string;

  /**
   * Tab content
   */
  children: ReactNode;

  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
}

export interface TabsListProps {
  /**
   * Tab triggers
   */
  children: ReactNode;

  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
}

export interface TabsTriggerProps {
  /**
   * Tab value identifier
   */
  value: string;

  /**
   * Tab label
   */
  children: ReactNode;

  /**
   * Disabled state
   */
  disabled?: boolean;

  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing

  // Accessibility
  accessibilityLabel?: string;     // React Native
  'aria-label'?: string;           // Web
}

export interface TabsContentProps {
  /**
   * Tab value identifier
   */
  value: string;

  /**
   * Tab content
   */
  children: ReactNode;

  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
}
