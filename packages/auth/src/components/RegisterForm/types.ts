import type { RegistrationFormData } from '@vas-dj-saas/api-client';

export interface RegisterFormProps {
  onSubmit: (credentials: Omit<RegistrationFormData, 'passwordConfirm'>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onLoginClick?: () => void;
  className?: string;
  style?: any;
}

export interface RegisterFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationName: string;
  preferredSubdomain: string;
  password: string;
  passwordConfirm: string;
  errors: Record<string, string[]>;
  touched: {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    phone: boolean;
    organizationName: boolean;
    preferredSubdomain: boolean;
    password: boolean;
    passwordConfirm: boolean;
  };
}
