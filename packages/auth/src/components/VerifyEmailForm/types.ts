export interface VerifyEmailFormProps {
  email?: string;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  successMessage?: string | null;
  onBackToLogin?: () => void;
  className?: string;
  style?: any;
}
