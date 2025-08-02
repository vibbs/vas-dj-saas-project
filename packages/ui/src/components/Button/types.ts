export interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  style?: any;
  disabled?: boolean;
  testID?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onPress?: () => void;
  onClick?: () => void;
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'none' | 'menuitem';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-pressed'?: boolean;
  role?: string;
  type?: 'button' | 'submit' | 'reset';
}