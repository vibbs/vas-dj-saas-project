export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  helpText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  indeterminate?: boolean; // Web only
  
  // Event handlers
  onCheckedChange?: (checked: boolean) => void; // Cross-platform
  onChange?: (event: any) => void; // Web
  onPress?: () => void; // React Native fallback
  
  // Platform-specific styling
  className?: string; // Web only
  style?: any; // React Native only
  checkboxStyle?: any; // Additional checkbox styling
  
  // Common props
  testID?: string;
  value?: string; // For form submissions
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}