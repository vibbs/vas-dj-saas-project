export interface ToastProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  position?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  duration?: number; // in milliseconds, 0 means persistent
  visible?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  closable?: boolean;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'alert' | 'none'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-live'?: 'polite' | 'assertive' | 'off'; // Web: Live region announcements
  role?: string;                   // Web: Element role
}