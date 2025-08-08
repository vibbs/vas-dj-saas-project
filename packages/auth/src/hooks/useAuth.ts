import { useState, useEffect, useCallback } from 'react';
import { authService } from '../AuthService';
import {
  AuthState,
  LoginCredentials,
  RegistrationData,
  SocialAuthData,
  EmailVerificationData,
} from '@vas-dj-saas/types';

export interface UseAuthReturn extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  socialAuth: (data: SocialAuthData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (data: EmailVerificationData) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
  
  // Computed properties
  isEmailVerified: boolean;
  isOnTrial: boolean;
  trialDaysRemaining: number | null;
  hasAdminRole: boolean;
  canManageBilling: boolean;
}

/**
 * Main authentication hook that provides complete auth state and actions
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setState);
    return unsubscribe;
  }, []);

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
    ...state,
    login,
    register,
    socialAuth,
    logout,
    verifyEmail,
    resendVerification,
    clearError,
    isEmailVerified: authService.isEmailVerified(),
    isOnTrial: authService.isOnTrial(),
    trialDaysRemaining: authService.getTrialDaysRemaining(),
    hasAdminRole: authService.hasAdminRole(),
    canManageBilling: authService.canManageBilling(),
  };
}