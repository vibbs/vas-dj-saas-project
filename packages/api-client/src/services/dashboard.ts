/**
 * DashboardService
 * High-level service for dashboard statistics and analytics
 *
 * Note: This service provides mock data structure for dashboard analytics.
 * When backend APIs are ready, the implementation can be updated to use
 * actual API endpoints.
 */

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

// Response types matching the api-client pattern
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

/**
 * DashboardService
 * Provides methods for fetching dashboard data
 *
 * Currently returns mock data structure.
 * TODO: Replace with actual API calls when backend endpoints are available.
 */
export const DashboardService = {
  /**
   * Get dashboard statistics for an organization
   * @param _organizationPk - The organization ID (unused until backend ready)
   */
  getDashboardStats: async (_organizationPk: string): Promise<DashboardStatsResponse> => {
    // TODO: Replace with actual API call
    // return v1DashboardStats(_organizationPk);

    // Return empty structure that will be filled with mock data in the hook
    return {
      status: 200,
      data: {
        totalMembers: {
          id: 'total-members',
          label: 'Total Members',
          value: 0,
          formattedValue: '0',
        },
        activeProjects: {
          id: 'active-projects',
          label: 'Active Projects',
          value: 0,
          formattedValue: '0',
        },
        pendingInvites: {
          id: 'pending-invites',
          label: 'Pending Invites',
          value: 0,
          formattedValue: '0',
        },
        monthlyUsage: {
          id: 'monthly-usage',
          label: 'Monthly Usage',
          value: 0,
          formattedValue: '0%',
        },
      },
    };
  },

  /**
   * Get recent activity for an organization
   * @param _organizationPk - The organization ID (unused until backend ready)
   * @param _limit - Number of activities to fetch (unused until backend ready)
   */
  getRecentActivity: async (
    _organizationPk: string,
    _limit: number = 10
  ): Promise<RecentActivityAPIResponse> => {
    // TODO: Replace with actual API call
    // return v1DashboardActivity(_organizationPk, { limit: _limit });

    return {
      status: 200,
      data: {
        activities: [],
        total: 0,
        hasMore: false,
      },
    };
  },

  /**
   * Get team overview for an organization
   * @param _organizationPk - The organization ID (unused until backend ready)
   */
  getTeamOverview: async (_organizationPk: string): Promise<TeamOverviewResponse> => {
    // TODO: Replace with actual API call
    // return v1DashboardTeamOverview(_organizationPk);

    return {
      status: 200,
      data: {
        totalMembers: 0,
        roleBreakdown: [],
        recentMembers: [],
        pendingInvitations: 0,
      },
    };
  },

  /**
   * Get usage metrics for an organization
   * @param _organizationPk - The organization ID (unused until backend ready)
   * @param _period - Time period for metrics (unused until backend ready)
   */
  getUsageMetrics: async (
    _organizationPk: string,
    _period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<UsageMetricsResponse> => {
    // TODO: Replace with actual API call
    // return v1DashboardUsageMetrics(_organizationPk, { period: _period });

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
          totalApiCalls: 0,
          totalStorage: 0,
          averageActiveUsers: 0,
        },
      },
    };
  },
} as const;
