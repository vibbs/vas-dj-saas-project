/**
 * Zod Validation Schemas for Authentication Forms
 * These schemas provide runtime validation for form inputs
 * and extend the generated TypeScript types
 */

import { z } from 'zod';

/**
 * Login form validation schema
 */
export const LoginCredentialsSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

/**
 * Registration form validation schema
 * Includes password confirmation validation
 */
export const RegistrationSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    organizationName: z.string().optional(),
    preferredSubdomain: z
      .string()
      .regex(
        /^[a-zA-Z0-9-]*$/,
        'Subdomain can only contain letters, numbers, and hyphens'
      )
      .optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type RegistrationFormData = z.infer<typeof RegistrationSchema>;

/**
 * Email verification validation schema
 */
export const EmailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type EmailVerificationData = z.infer<typeof EmailVerificationSchema>;

/**
 * Password reset request validation schema
 */
export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type PasswordResetRequestData = z.infer<
  typeof PasswordResetRequestSchema
>;

/**
 * Password reset confirmation validation schema
 */
export const PasswordResetConfirmSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordResetConfirmData = z.infer<
  typeof PasswordResetConfirmSchema
>;

/**
 * Profile update validation schema
 */
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;

/**
 * Change password validation schema
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
