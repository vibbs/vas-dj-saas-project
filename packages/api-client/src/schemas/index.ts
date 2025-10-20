/**
 * Form Validation Schemas
 *
 * These Zod schemas provide runtime validation for form inputs.
 * They extend and validate the generated TypeScript types from the OpenAPI schema.
 *
 * @example
 * ```ts
 * import { LoginCredentialsSchema } from '@vas-dj-saas/api-client/schemas';
 *
 * const result = LoginCredentialsSchema.safeParse(formData);
 * if (!result.success) {
 *   console.error(result.error.format());
 * }
 * ```
 */

// Authentication schemas
export {
  LoginCredentialsSchema,
  RegistrationSchema,
  EmailVerificationSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  type LoginCredentials,
  type RegistrationFormData,
  type EmailVerificationData,
  type PasswordResetRequestData,
  type PasswordResetConfirmData,
  type UpdateProfileData,
  type ChangePasswordData,
} from './auth';

// Organization schemas
export {
  InviteUserSchema,
  AcceptInviteSchema,
  UpdateOrganizationSchema,
  type InviteUserData,
  type AcceptInviteData,
  type UpdateOrganizationData,
} from './organization';
