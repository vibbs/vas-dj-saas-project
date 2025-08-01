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
}