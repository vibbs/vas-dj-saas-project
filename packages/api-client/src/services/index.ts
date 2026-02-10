/**
 * Service layer exports
 * Stable, clean API over generated code
 */

export { AuthService } from './auth';
export { UsersService } from './users';
export { OrganizationsService } from './organizations';
export { InvitesService } from './invites';
export { MembersService } from './members';
export { BillingService } from './billing';
export { NotificationsService } from './notifications';
export { DashboardService } from './dashboard';
export { OnboardingService, OnboardingStage } from './onboarding';

// Re-export notification types for convenience
export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPreferences,
  NotificationChannels,
  PaginatedNotifications,
  GetNotificationsParams,
} from './notifications';

// Re-export dashboard types for convenience
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
} from './dashboard';

// Re-export onboarding types for convenience
export type {
  OnboardingAction,
  OnboardingStageType,
  UserOnboardingProgress,
} from './onboarding';

// API Keys service
export { ApiKeysService } from './apiKeys';
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
} from './apiKeys';
