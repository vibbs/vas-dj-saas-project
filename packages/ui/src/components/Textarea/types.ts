import { FormFieldProps } from '../FormField/types';

export interface TextareaProps extends Omit<FormFieldProps, 'children'> {
  // Text input props
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  autoFocus?: boolean;
  readOnly?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'; // Web only
  
  // Event handlers
  onChange?: (value: string) => void;
  onChangeText?: (text: string) => void; // React Native style
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyPress?: (key: string) => void;
  
  // Styling
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
}