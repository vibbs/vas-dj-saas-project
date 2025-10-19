/**
 * Authentication Service
 * Clean wrapper over generated authentication endpoints
 */

import {
  v1AuthRegisterCreate,
  v1AuthLoginCreate,
  v1AuthRefreshCreate,
  v1AuthLogoutCreate,
  v1AuthVerifyRetrieve,
  v1AuthVerifyEmailCreate,
  v1AuthPasswordResetCreate,
  v1AuthPasswordResetConfirmCreate,
} from '../generated/authentication/authentication';

import type {
  RegistrationRequest,
  LoginRequestRequest,
  RefreshTokenRequestRequest,
  LogoutRequestRequest,
  EmailVerificationRequest,
  PasswordResetRequestRequest,
  PasswordResetConfirmRequest,
} from '../generated/api.schemas';

export const AuthService = {
  /**
   * Register a new user with automatic organization creation
   */
  register: (data: RegistrationRequest) => v1AuthRegisterCreate(data),

  /**
   * Login with email and password
   */
  login: (data: LoginRequestRequest) => v1AuthLoginCreate(data),

  /**
   * Refresh JWT access token
   */
  refresh: (data: RefreshTokenRequestRequest) => v1AuthRefreshCreate(data),

  /**
   * Logout and blacklist refresh token
   */
  logout: (data: LogoutRequestRequest) => v1AuthLogoutCreate(data),

  /**
   * Verify current JWT token
   */
  verify: () => v1AuthVerifyRetrieve(),

  /**
   * Verify email address with token
   */
  verifyEmail: (data: EmailVerificationRequest) => v1AuthVerifyEmailCreate(data),

  /**
   * Request password reset email
   */
  requestPasswordReset: (data: PasswordResetRequestRequest) =>
    v1AuthPasswordResetCreate(data),

  /**
   * Confirm password reset with token
   */
  confirmPasswordReset: (data: PasswordResetConfirmRequest) =>
    v1AuthPasswordResetConfirmCreate(data),
} as const;
