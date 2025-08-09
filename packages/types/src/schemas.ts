import { z } from 'zod';

// Base schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    errors: z.array(z.string()).optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    results: z.array(itemSchema),
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
  });

// User and Organization schemas
export const UserRoleSchema = z.enum(['USER', 'ADMIN', 'GUEST']);
export const UserStatusSchema = z.enum([
  'ACTIVE', 
  'INACTIVE', 
  'SUSPENDED', 
  'DELETED', 
  'BANNED', 
  'PENDING'
]);

export const SocialProviderSchema = z.enum([
  'google',
  'github', 
  'facebook',
  'twitter'
]);

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  subdomain: z.string(),
  isActive: z.boolean(),
  onTrial: z.boolean(),
  trialEndsOn: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  abbreviatedName: z.string(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  role: UserRoleSchema,
  organizationId: z.string(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  isAdmin: z.boolean(),
  isOrgAdmin: z.boolean(),
  isOrgCreator: z.boolean(),
  status: UserStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Authentication schemas
export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: UserSchema,
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const AuthStateSchema = z.object({
  user: UserSchema.nullable(),
  organization: OrganizationSchema.nullable(),
  tokens: AuthTokensSchema.nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

// Registration schemas
export const RegistrationDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  passwordConfirm: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  organizationName: z.string().optional(),
  preferredSubdomain: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

export const RegisterCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  organizationName: z.string().optional(),
  preferredSubdomain: z.string().optional(),
});

export const RegistrationResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: UserSchema,
  organization: OrganizationSchema,
});

// Social authentication schemas
export const SocialAuthDataSchema = z.object({
  provider: SocialProviderSchema,
  providerUserId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
  organizationName: z.string().optional(),
  preferredSubdomain: z.string().optional(),
});

export const SocialAuthResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: UserSchema,
  organization: OrganizationSchema,
});

// Email verification schemas
export const EmailVerificationDataSchema = z.object({
  token: z.string(),
});

export const EmailVerificationResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
});

export const ResendVerificationResponseSchema = z.object({
  message: z.string(),
});

export const TokenVerificationResponseSchema = z.object({
  valid: z.boolean(),
  user: UserSchema.optional(),
  error: z.string().optional(),
});

// Error schemas
export const AuthErrorSchema = z.object({
  message: z.string(),
  field: z.string().optional(),
  code: z.string().optional(),
});

export const ValidationErrorsSchema = z.record(z.array(z.string()));

// Form schemas (for react-hook-form)
export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: UserRoleSchema,
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

// Session schema for auth store
export const SessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    org_id: z.string(),
    role: UserRoleSchema,
    firstName: z.string(),
    lastName: z.string(),
    isEmailVerified: z.boolean(),
  }),
});

// Type exports (inferred from schemas)
export type Session = z.infer<typeof SessionSchema>;
export type InviteUser = z.infer<typeof InviteUserSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;