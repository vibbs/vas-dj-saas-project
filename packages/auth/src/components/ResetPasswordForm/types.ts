export interface ResetPasswordFormProps {
  onSubmit: (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  token: string;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
  onBackToLogin?: () => void;
  className?: string;
  style?: any;
}

export interface ResetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
  errors: Record<string, string[]>;
  touched: { newPassword: boolean; confirmPassword: boolean };
}
