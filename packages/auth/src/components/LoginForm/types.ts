import { LoginCredentials, ValidationErrors } from '@vas-dj-saas/types';

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  initialEmail?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  onForgotPassword?: () => void;
  onSignUpClick?: () => void;
  className?: string;
  style?: any;
}

export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  errors: ValidationErrors;
  touched: {
    email: boolean;
    password: boolean;
  };
}