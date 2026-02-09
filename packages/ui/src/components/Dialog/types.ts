export interface DialogProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
  animationDuration?: number;
  backdrop?: 'blur' | 'dark' | 'light' | 'none';
  // Platform-specific styling
  className?: string;           // Web only
  style?: any;                 // Cross-platform style object
  contentStyle?: any;          // Style for dialog content
  overlayStyle?: any;          // Style for backdrop overlay
  testID?: string;             // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  'aria-labelledby'?: string;          // Web: References title element
  'aria-describedby'?: string;         // Web: References description element
  'aria-modal'?: boolean;              // Web: Modal dialog indicator
  role?: string;                       // Web: Element role
  accessibilityRole?: 'none' | 'button'; // React Native: Element role
  accessibilityLabel?: string;         // React Native: Accessible name
  accessibilityHint?: string;          // React Native: Additional context
  accessibilityViewIsModal?: boolean;  // React Native: Modal behavior
}