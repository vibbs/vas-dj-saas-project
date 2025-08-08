import React from 'react';

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  abbreviatedName: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  isOrgAdmin: boolean;
  isOrgCreator: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
  BANNED = 'BANNED',
  PENDING = 'PENDING',
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  onTrial: boolean;
  trialEndsOn?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Registration types
export interface RegistrationData {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationName?: string;
  preferredSubdomain?: string;
}

// Alias for form components
export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationName?: string;
  preferredSubdomain?: string;
}

export interface RegistrationResponse {
  access: string;
  refresh: string;
  user: User;
  organization: Organization;
}

// Social authentication types
export interface SocialAuthData {
  provider: SocialProvider;
  providerUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  organizationName?: string;
  preferredSubdomain?: string;
}

export enum SocialProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
}

export interface SocialAuthResponse {
  access: string;
  refresh: string;
  user: User;
  organization: Organization;
}

// Email verification types
export interface EmailVerificationData {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  user: User;
}

export interface ResendVerificationResponse {
  message: string;
}

// Error types
export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface ValidationErrors {
  [field: string]: string[];
}

// Form state types
export interface FormState<T> {
  data: T;
  errors: ValidationErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Token verification types
export interface TokenVerificationResponse {
  valid: boolean;
  user?: User;
  error?: string;
}

// Common UI types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}