/**
 * @vas-dj-saas/auth
 * Authentication package for VAS-DJ SaaS Platform
 *
 * Features:
 * - Zustand-based auth state management
 * - Cross-platform auth forms (Web + Native)
 * - Integration with @vas-dj-saas/api-client
 * - Secure token storage
 */

// === Auth Store (Zustand) ===
export {
  useAuth,
  useAuthStatus,
  useAuthAccount,
  useAuthError,
  useAuthActions,
} from "./stores/session";

// === Auth Forms ===
export { LoginForm } from "./components/LoginForm";
export type { LoginFormProps } from "./components/LoginForm/types";

export { RegisterForm } from "./components/RegisterForm";
export type { RegisterFormProps } from "./components/RegisterForm/types";

export { ForgotPasswordForm } from "./components/ForgotPasswordForm";
export type { ForgotPasswordFormProps } from "./components/ForgotPasswordForm/types";

export { ResetPasswordForm } from "./components/ResetPasswordForm";
export type { ResetPasswordFormProps } from "./components/ResetPasswordForm/types";

export { VerifyEmailForm } from "./components/VerifyEmailForm";
export type { VerifyEmailFormProps } from "./components/VerifyEmailForm/types";

export { OAuthButtons } from "./components/OAuthButtons";
export type {
  OAuthButtonsProps,
  OAuthProvider,
} from "./components/OAuthButtons/types";

// === Utilities ===
export { createStorage } from "./utils/storage";
export * from "./utils/validation";

// Re-export commonly used types from api-client for convenience
export type {
  Account,
  LoginCredentials,
  RegistrationFormData,
} from "@vas-dj-saas/api-client";
