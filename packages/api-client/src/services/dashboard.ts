/**
 * DashboardService
 * High-level service for dashboard statistics and analytics
 *
 * Connects to /api/v1/dashboard/ endpoints.
 */

import { customFetch } from '../core/mutator';

// Dashboard Stats Types
export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    period: string;
  };
  icon?: string;
}

export interface DashboardStats {
  totalMembers: DashboardStat;
  activeProjects: DashboardStat;
  pendingInvites: DashboardStat;
  monthlyUsage: DashboardStat;
}

// Activity Types
export type ActivityType =
  | 'member_joined'
  | 'member_left'
  | 'invite_sent'
  | 'invite_accepted'
  | 'settings_changed'
  | 'project_created'
  | 'project_updated'
  | 'role_changed';

export interface Activity {
  id: string;
  type: ActivityType;
  actorName: string;
  actorEmail?: string;
  actorAvatar?: string;
  targetName?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RecentActivityResponse {
  activities: Activity[];
  total: number;
  hasMore: boolean;
}

// Team Overview Types
export interface RoleBreakdown {
  role: string;
  count: number;
  percentage: number;
}

export interface RecentMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: string;
}

export interface TeamOverview {
  totalMembers: number;
  roleBreakdown: RoleBreakdown[];
  recentMembers: RecentMember[];
  pendingInvitations: number;
}

// Usage Metrics Types
export interface UsageDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface UsageMetrics {
  apiCalls: UsageDataPoint[];
  storage: UsageDataPoint[];
  activeUsers: UsageDataPoint[];
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalApiCalls: number;
    totalStorage: number;
    averageActiveUsers: number;
  };
}

// Response types
export interface DashboardStatsResponse {
  status: number;
  data: DashboardStats;
}

export interface RecentActivityAPIResponse {
  status: number;
  data: RecentActivityResponse;
}

export interface TeamOverviewResponse {
  status: number;
  data: TeamOverview;
}

export interface UsageMetricsResponse {
  status: number;
  data: UsageMetrics;
}

function transformStats(raw: Record<string, number>): DashboardStats {
  return {
    totalMembers: {
      id: 'total-members',
      label: 'Total Members',
      value: raw.totalMembers ?? 0,
      formattedValue: String(raw.totalMembers ?? 0),
    },
    activeProjects: {
      id: 'active-api-keys',
      label: 'Active API Keys',
      value: raw.activeApiKeys ?? 0,
      formattedValue: String(raw.activeApiKeys ?? 0),
    },
    pendingInvites: {
      id: 'pending-invites',
      label: 'Pending Invites',
      value: raw.pendingInvites ?? 0,
      formattedValue: String(raw.pendingInvites ?? 0),
    },
    monthlyUsage: {
      id: 'unread-notifications',
      label: 'Unread Notifications',
      value: raw.unreadNotifications ?? 0,
      formattedValue: String(raw.unreadNotifications ?? 0),
    },
  };
}

export const DashboardService = {
  getDashboardStats: async (_organizationPk: string): Promise<DashboardStatsResponse> => {
    try {
      const response = await customFetch<Record<string, number>>(
        '/api/v1/dashboard/stats/',
        { method: 'GET' }
      );
      return { status: 200, data: transformStats(response as Record<string, number>) };
    } catch {
      return { status: 500, data: transformStats({}) };
    }
  },

  getRecentActivity: async (
    _organizationPk: string,
    _limit: number = 10
  ): Promise<RecentActivityAPIResponse> => {
    try {
      const response = await customFetch<Activity[]>(
        '/api/v1/dashboard/activity/',
        { method: 'GET' }
      );
      const activities = Array.isArray(response) ? response : [];
      return { status: 200, data: { activities, total: activities.length, hasMore: false } };
    } catch {
      return { status: 500, data: { activities: [], total: 0, hasMore: false } };
    }
  },

  getTeamOverview: async (_organizationPk: string): Promise<TeamOverviewResponse> => {
    try {
      const response = await customFetch<Record<string, unknown>>(
        '/api/v1/dashboard/team/',
        { method: 'GET' }
      );
      const raw = response as Record<string, unknown>;
      const membersByRole = (raw.membersByRole ?? {}) as Record<string, number>;
      const total = (raw.totalMembers as number) ?? 0;
      return {
        status: 200,
        data: {
          totalMembers: total,
          roleBreakdown: Object.entries(membersByRole).map(([role, count]) => ({
            role,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          })),
          recentMembers: [],
          pendingInvitations: 0,
        },
      };
    } catch {
      return {
        status: 500,
        data: { totalMembers: 0, roleBreakdown: [], recentMembers: [], pendingInvitations: 0 },
      };
    }
  },

  getUsageMetrics: async (
    _organizationPk: string,
    _period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<UsageMetricsResponse> => {
    try {
      const response = await customFetch<Record<string, number>>(
        '/api/v1/dashboard/usage/',
        { method: 'GET' }
      );
      const raw = response as Record<string, number>;
      return {
        status: 200,
        data: {
          apiCalls: [],
          storage: [],
          activeUsers: [],
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          summary: {
            totalApiCalls: raw.apiRequestsThisMonth ?? 0,
            totalStorage: raw.storageUsedMb ?? 0,
            averageActiveUsers: raw.activeIntegrations ?? 0,
          },
        },
      };
    } catch {
      return {
        status: 500,
        data: {
          apiCalls: [],
          storage: [],
          activeUsers: [],
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          summary: { totalApiCalls: 0, totalStorage: 0, averageActiveUsers: 0 },
        },
      };
    }
  },
} as const;
