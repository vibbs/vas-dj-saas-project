/**
 * useSecurity Hook
 * Manages security settings including password change and 2FA
 */

import { useState, useCallback } from 'react';
import { AuthService } from '@vas-dj-saas/api-client';
import { useAuthStatus, useAuthAccount } from '@vas-dj-saas/auth';

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UseSecurityReturn {
  // Password change
  isChangingPassword: boolean;
  passwordChangeError: string | null;
  passwordChangeSuccess: boolean;
  changePassword: (data: PasswordChangeData) => Promise<boolean>;

  // Password reset (sends email)
  isRequestingReset: boolean;
  requestPasswordReset: () => Promise<boolean>;

  // 2FA status (placeholder for now)
  is2FAEnabled: boolean;
  enable2FA: () => Promise<boolean>;
  disable2FA: () => Promise<boolean>;

  // Active sessions (placeholder for now)
  sessions: Session[];
  isLoadingSessions: boolean;
  refreshSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<boolean>;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export function useSecurity(): UseSecurityReturn {
  const authStatus = useAuthStatus();
  const account = useAuthAccount();

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // Password reset state
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  // 2FA state (placeholder)
  const [is2FAEnabled] = useState(false);

  // Sessions state (placeholder)
  const [sessions] = useState<Session[]>([
    {
      id: 'current',
      device: 'Chrome on macOS',
      location: 'San Francisco, CA',
      lastActive: new Date().toISOString(),
      isCurrent: true,
    },
  ]);
  const [isLoadingSessions] = useState(false);

  const changePassword = useCallback(async (data: PasswordChangeData): Promise<boolean> => {
    // Validate inputs
    if (data.newPassword !== data.confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return false;
    }

    if (data.newPassword.length < 8) {
      setPasswordChangeError('Password must be at least 8 characters');
      return false;
    }

    setIsChangingPassword(true);
    setPasswordChangeError(null);
    setPasswordChangeSuccess(false);

    try {
      // Note: There's no direct "change password while logged in" endpoint
      // This would need to be added to the backend
      // For now, we'll show an info message to users
      console.log('Password change requested - backend endpoint not yet implemented');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation:
      // const response = await AuthService.changePassword({
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword,
      // });

      setPasswordChangeError(
        'Password change is not yet available. Please use "Forgot Password" to reset your password via email.'
      );
      return false;
    } catch (err) {
      setPasswordChangeError(err instanceof Error ? err.message : 'Failed to change password');
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (): Promise<boolean> => {
    if (authStatus !== 'authenticated' || !account?.email) {
      return false;
    }

    setIsRequestingReset(true);

    try {
      const response = await AuthService.requestPasswordReset({ email: account.email });

      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Password reset request failed:', err);
      return false;
    } finally {
      setIsRequestingReset(false);
    }
  }, [authStatus, account?.email]);

  const enable2FA = useCallback(async (): Promise<boolean> => {
    // Placeholder - 2FA endpoints would need to be implemented
    console.log('2FA enable requested - not yet implemented');
    return false;
  }, []);

  const disable2FA = useCallback(async (): Promise<boolean> => {
    // Placeholder - 2FA endpoints would need to be implemented
    console.log('2FA disable requested - not yet implemented');
    return false;
  }, []);

  const refreshSessions = useCallback(async (): Promise<void> => {
    // Placeholder - sessions endpoint would need to be implemented
    console.log('Sessions refresh requested - not yet implemented');
  }, []);

  const revokeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    // Placeholder - revoke session endpoint would need to be implemented
    console.log('Session revoke requested:', sessionId);
    return false;
  }, []);

  return {
    isChangingPassword,
    passwordChangeError,
    passwordChangeSuccess,
    changePassword,
    isRequestingReset,
    requestPasswordReset,
    is2FAEnabled,
    enable2FA,
    disable2FA,
    sessions,
    isLoadingSessions,
    refreshSessions,
    revokeSession,
  };
}
