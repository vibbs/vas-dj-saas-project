import { FormFieldProps } from '../FormField/types';

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioProps extends Omit<FormFieldProps, 'children'> {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  layout?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  
  // Event handlers
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void; // React Native style
  
  // Styling
  variant?: 'default' | 'card';
  
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