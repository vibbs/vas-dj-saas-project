export interface InputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  helpText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  numberOfLines?: number; // React Native only
  
  // Input types
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  secureTextEntry?: boolean; // React Native equivalent of password
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url'; // React Native
  autoComplete?: string; // Web
  autoCorrect?: boolean; // React Native
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; // React Native
  
  // Event handlers
  onChangeText?: (text: string) => void; // React Native
  onChange?: (event: any) => void; // Web
  onFocus?: (event: any) => void;
  onBlur?: (event: any) => void;
  onSubmitEditing?: (event: any) => void; // React Native
  
  // Platform-specific styling
  className?: string; // Web only
  style?: any; // React Native only
  inputStyle?: any; // Additional input styling
  
  // Common props
  testID?: string;
  maxLength?: number;
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}