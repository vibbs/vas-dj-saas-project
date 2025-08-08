import { useState, useEffect } from 'react';
import { authService } from '../AuthService';
import { AuthState, User, Organization } from '@vas-dj-saas/types';

export interface UseAuthStateReturn {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Computed properties
  isEmailVerified: boolean;
  isOnTrial: boolean;
  trialDaysRemaining: number | null;
  hasAdminRole: boolean;
  canManageBilling: boolean;
}

/**
 * Read-only authentication state hook
 * Use this when you only need to read auth state without performing actions
 */
export function useAuthState(): UseAuthStateReturn {
  const [state, setState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    user: state.user,
    organization: state.organization,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    isEmailVerified: authService.isEmailVerified(),
    isOnTrial: authService.isOnTrial(),
    trialDaysRemaining: authService.getTrialDaysRemaining(),
    hasAdminRole: authService.hasAdminRole(),
    canManageBilling: authService.canManageBilling(),
  };
}