/**
 * Domain Types
 * Stable public API types re-exported from generated code
 * These types are committed to for this major version (v1.x)
 */

// Re-export key domain models from generated schemas
export type {
  Account,
  AccountGender,
  AccountRole,
  AccountStatus,
  Organization,
  OrganizationMembership,
  OrganizationMembershipRole,
  OrganizationMembershipStatus,
  Invite,
  InviteRole,
  InviteStatus,
} from './generated/api.schemas';

// Re-export request/response types
export type {
  RegistrationRequest,
  RegistrationResponse,
  LoginRequestRequest,
  LoginResponse,
  RefreshTokenRequestRequest,
  RefreshTokenResponse,
  AccountRequest,
  AccountCreateRequest,
  PatchedAccountRequest,
  OrganizationRequest,
  PatchedOrganizationRequest,
  PatchedMembershipUpdateRequest,
  CreateInviteRequest,
  CreateInviteRequestRole,
} from './generated/api.schemas';

// Re-export pagination types
export type {
  PaginatedAccountList,
  PaginatedOrganizationList,
  PaginatedOrganizationMembershipList,
  PaginatedInviteList,
} from './generated/api.schemas';

// Re-export error types
export type { Problem } from './generated/api.schemas';

// Re-export core types
export type {
  AuthProvider,
  ClientConfig,
  WireAuthOptions,
  RequestOptions,
} from './core/types';

// Re-export pagination utilities types
export type {
  Paginated,
  CursorPaginated,
  PaginationParams,
} from './core/pagination';

// Re-export error class
export { ApiError, formatApiError } from './core/errors';
export type { ProblemDetails } from './core/errors';
