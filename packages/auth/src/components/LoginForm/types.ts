import type { LoginCredentials } from '@vas-dj-saas/api-client';

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
  errors: Record<string, string[]>;
  touched: {
    email: boolean;
    password: boolean;
  };
}
