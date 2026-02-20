export interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
  onBackToLogin?: () => void;
  className?: string;
  style?: any;
}

export interface ForgotPasswordFormState {
  email: string;
  errors: Record<string, string[]>;
  touched: { email: boolean };
}
