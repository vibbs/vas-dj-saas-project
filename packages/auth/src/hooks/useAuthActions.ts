import { useCallback } from 'react';
import { authService } from '../AuthService';
import {
  LoginCredentials,
  RegistrationData,
  SocialAuthData,
  EmailVerificationData,
} from '@vas-dj-saas/types';

export interface UseAuthActionsReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  socialAuth: (data: SocialAuthData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (data: EmailVerificationData) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
}

/**
 * Authentication actions hook
 * Use this when you only need auth actions without state
 */
export function useAuthActions(): UseAuthActionsReturn {
  const login = useCallback(async (credentials: LoginCredentials) => {
    await authService.login(credentials);
  }, []);

  const register = useCallback(async (data: RegistrationData) => {
    await authService.register(data);
  }, []);

  const socialAuth = useCallback(async (data: SocialAuthData) => {
    await authService.socialAuth(data);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const verifyEmail = useCallback(async (data: EmailVerificationData) => {
    await authService.verifyEmail(data);
  }, []);

  const resendVerification = useCallback(async () => {
    await authService.resendVerification();
  }, []);

  const clearError = useCallback(() => {
    authService.clearError();
  }, []);

  return {
    login,
    register,
    socialAuth,
    logout,
    verifyEmail,
    resendVerification,
    clearError,
  };
}