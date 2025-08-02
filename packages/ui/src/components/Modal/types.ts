export interface ModalProps {
  children?: React.ReactNode;
  // Modal state
  isOpen: boolean;
  onClose: () => void;
  // Modal variants
  variant?: 'default' | 'fullscreen' | 'bottom-sheet' | 'dialog';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  // Modal behavior
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showDivider?: boolean;
  // Animation
  animationType?: 'fade' | 'slide' | 'none';
  // Loading state
  loading?: boolean;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'dialog' | 'alertdialog' | 'none'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-labelledby'?: string;      // Web: References to title element
  'aria-modal'?: boolean;          // Web: Modal dialog indicator
  role?: 'dialog' | 'alertdialog'; // Web: Element role
  
  // Modal-specific accessibility
  initialFocusRef?: React.RefObject<HTMLElement>; // Web: Element to focus on open
  finalFocusRef?: React.RefObject<HTMLElement>;   // Web: Element to focus on close
}