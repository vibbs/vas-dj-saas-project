import { FormFieldProps } from '../FormField/types';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps extends Omit<FormFieldProps, 'children'> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean; // For web implementation
  clearable?: boolean;
  
  // Event handlers
  onChange?: (value: string | string[]) => void;
  onValueChange?: (value: string | string[]) => void; // React Native style
  onFocus?: () => void;
  onBlur?: () => void;
  onSearch?: (query: string) => void; // For searchable select
  
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