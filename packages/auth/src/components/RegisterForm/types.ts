import { RegisterCredentials, ValidationErrors } from '@vas-dj-saas/types';

export interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
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
  errors: ValidationErrors;
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