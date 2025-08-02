export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  helpText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  
  // Event handlers
  onCheckedChange?: (checked: boolean) => void; // Cross-platform
  onChange?: (event: any) => void; // Web
  onPress?: () => void; // React Native fallback
  
  // Platform-specific styling
  className?: string; // Web only
  style?: any; // React Native only
  switchStyle?: any; // Additional switch styling
  thumbStyle?: any; // Switch thumb styling
  trackStyle?: any; // Switch track styling
  
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