export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  helpText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  
  // Event handlers
  onValueChange?: (value: number) => void; // Cross-platform
  onChange?: (event: any) => void; // Web
  onSlidingStart?: () => void; // React Native
  onSlidingComplete?: (value: number) => void; // React Native
  
  // Platform-specific styling
  className?: string; // Web only
  style?: any; // React Native only
  sliderStyle?: any; // Additional slider styling
  trackStyle?: any; // Track styling
  thumbStyle?: any; // Thumb styling
  
  // Common props
  testID?: string;
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
}