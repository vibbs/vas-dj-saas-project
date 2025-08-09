import { http } from './http';
import { 
  LoginCredentialsSchema,
  LoginResponseSchema,
  RegistrationDataSchema,
  RegistrationResponseSchema,
  EmailVerificationDataSchema,
  EmailVerificationResponseSchema,
  ResendVerificationResponseSchema,
  TokenVerificationResponseSchema,
  SocialAuthDataSchema,
  SocialAuthResponseSchema,
  UserSchema,
  SessionSchema,
  type LoginCredentials,
  type LoginResponse,
  type RegistrationData,
  type RegistrationResponse,
  type EmailVerificationData,
  type EmailVerificationResponse,
  type ResendVerificationResponse,
  type TokenVerificationResponse,
  type SocialAuthData,
  type SocialAuthResponse,
  type User,
  type Session,
} from '@vas-dj-saas/types';

// Authentication endpoints
export async function login(input: LoginCredentials): Promise<LoginResponse> {
  const validatedInput = LoginCredentialsSchema.parse(input);
  const { data } = await http.post('/auth/login/', validatedInput);
  return LoginResponseSchema.parse(data);
}

export async function register(input: RegistrationData): Promise<RegistrationResponse> {
  const validatedInput = RegistrationDataSchema.parse(input);
  const { data } = await http.post('/auth/register/', validatedInput);
  return RegistrationResponseSchema.parse(data);
}

export async function socialAuth(input: SocialAuthData): Promise<SocialAuthResponse> {
  const validatedInput = SocialAuthDataSchema.parse(input);
  const { data } = await http.post('/auth/social/', validatedInput);
  return SocialAuthResponseSchema.parse(data);
}

export async function verifyEmail(input: EmailVerificationData): Promise<EmailVerificationResponse> {
  const validatedInput = EmailVerificationDataSchema.parse(input);
  const { data } = await http.post('/auth/verify-email/', validatedInput);
  return EmailVerificationResponseSchema.parse(data);
}

export async function resendVerification(): Promise<ResendVerificationResponse> {
  const { data } = await http.post('/auth/resend-verification/');
  return ResendVerificationResponseSchema.parse(data);
}

export async function verifyToken(): Promise<TokenVerificationResponse> {
  const { data } = await http.get('/auth/verify/');
  return TokenVerificationResponseSchema.parse(data);
}

export async function me(): Promise<User> {
  const { data } = await http.get('/auth/me/');
  return UserSchema.parse(data);
}

export async function logout(): Promise<{ message: string }> {
  const { data } = await http.post('/auth/logout/');
  return data;
}

export async function refreshToken(): Promise<Session> {
  const { data } = await http.post('/auth/refresh/');
  return SessionSchema.parse(data);
}

// Organization endpoints (examples)
export async function getOrganizationUsers(orgId: string) {
  const { data } = await http.get(`/organizations/${orgId}/users/`);
  return data;
}

export async function inviteUser(orgId: string, payload: { email: string; role: string }) {
  const { data } = await http.post(`/organizations/${orgId}/users/invite/`, payload);
  return data;
}

// Profile endpoints
export async function updateProfile(payload: { firstName?: string; lastName?: string; phone?: string }) {
  const { data } = await http.patch('/auth/profile/', payload);
  return UserSchema.parse(data);
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const { data } = await http.post('/auth/change-password/', payload);
  return data;
}