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
  // Billing types
  Plan,
  PlanInterval,
  Subscription,
  SubscriptionStatus,
  Invoice,
  InvoiceStatus,
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
  PaginatedPlanList,
  PaginatedSubscriptionList,
  PaginatedInvoiceList,
} from './generated/api.schemas';

// Re-export billing request types
export type {
  SubscriptionRequest,
  SubscriptionRequestStatus,
  V1BillingPlansListParams,
  V1BillingSubscriptionsListParams,
  V1BillingInvoicesListParams,
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

// Re-export dashboard types
export type {
  DashboardStat,
  DashboardStats,
  ActivityType,
  Activity,
  RecentActivityResponse,
  RoleBreakdown,
  RecentMember,
  TeamOverview,
  UsageDataPoint,
  UsageMetrics,
} from './services/dashboard';

// Re-export API Keys types
export type {
  ApiKey,
  ApiKeyScope,
  ApiKeyStatus,
  ApiKeyExpiration,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ApiKeyUsage,
  ApiKeyListParams,
  ApiKeyListResponse,
} from './services/apiKeys';
