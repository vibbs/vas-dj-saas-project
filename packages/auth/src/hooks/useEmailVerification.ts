import { useState, useCallback } from 'react';
import { authService } from '../AuthService';
import { EmailVerificationData, AuthError } from '@vas-dj-saas/types';

export interface UseEmailVerificationReturn {
  isVerifying: boolean;
  isResending: boolean;
  verificationError: string | null;
  resendError: string | null;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  clearErrors: () => void;
}

/**
 * Email verification specific hook
 * Provides dedicated state and actions for email verification flow
 */
export function useEmailVerification(): UseEmailVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const data: EmailVerificationData = { token };
      await authService.verifyEmail(data);
      setIsVerifying(false);
      return true;
    } catch (error) {
      const authError = error as AuthError;
      setVerificationError(authError.message || 'Email verification failed');
      setIsVerifying(false);
      return false;
    }
  }, []);

  const resendVerification = useCallback(async (): Promise<boolean> => {
    setIsResending(true);
    setResendError(null);

    try {
      await authService.resendVerification();
      setIsResending(false);
      return true;
    } catch (error) {
      const authError = error as AuthError;
      setResendError(authError.message || 'Failed to resend verification email');
      setIsResending(false);
      return false;
    }
  }, []);

  const clearErrors = useCallback(() => {
    setVerificationError(null);
    setResendError(null);
  }, []);

  return {
    isVerifying,
    isResending,
    verificationError,
    resendError,
    verifyEmail,
    resendVerification,
    clearErrors,
  };
}