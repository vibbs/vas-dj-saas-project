/**
 * Mock Dashboard Data
 * Used while backend APIs aren't ready
 */

import type {
  DashboardStats,
  Activity,
  RecentActivityResponse,
  TeamOverview,
  UsageMetrics,
  UsageDataPoint,
} from '@vas-dj-saas/api-client';

// Helper to generate relative timestamps
const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

/**
 * Mock Dashboard Statistics
 */
export const mockDashboardStats: DashboardStats = {
  totalMembers: {
    id: 'total-members',
    label: 'Total Members',
    value: 24,
    formattedValue: '24',
    trend: {
      direction: 'up',
      percentage: 12,
      period: 'vs last month',
    },
    icon: 'Users',
  },
  activeProjects: {
    id: 'active-projects',
    label: 'Active Projects',
    value: 8,
    formattedValue: '8',
    trend: {
      direction: 'up',
      percentage: 25,
      period: 'vs last month',
    },
    icon: 'FolderOpen',
  },
  pendingInvites: {
    id: 'pending-invites',
    label: 'Pending Invites',
    value: 3,
    formattedValue: '3',
    trend: {
      direction: 'neutral',
      percentage: 0,
      period: 'vs last month',
    },
    icon: 'Mail',
  },
  monthlyUsage: {
    id: 'monthly-usage',
    label: 'Monthly Usage',
    value: 67,
    formattedValue: '67%',
    trend: {
      direction: 'up',
      percentage: 8,
      period: 'vs last month',
    },
    icon: 'Activity',
  },
};

/**
 * Mock Recent Activities
 */
export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'member_joined',
    actorName: 'Sarah Johnson',
    actorEmail: 'sarah@example.com',
    description: 'joined the organization',
    timestamp: hoursAgo(2),
  },
  {
    id: 'act-2',
    type: 'invite_sent',
    actorName: 'Admin User',
    actorEmail: 'admin@example.com',
    targetName: 'newdev@example.com',
    description: 'sent an invite to newdev@example.com',
    timestamp: hoursAgo(5),
  },
  {
    id: 'act-3',
    type: 'settings_changed',
    actorName: 'John Doe',
    actorEmail: 'john@example.com',
    description: 'updated organization settings',
    timestamp: hoursAgo(12),
  },
  {
    id: 'act-4',
    type: 'role_changed',
    actorName: 'Admin User',
    actorEmail: 'admin@example.com',
    targetName: 'Jane Smith',
    description: 'changed Jane Smith\'s role to Admin',
    timestamp: daysAgo(1),
  },
  {
    id: 'act-5',
    type: 'project_created',
    actorName: 'Mike Chen',
    actorEmail: 'mike@example.com',
    targetName: 'Q1 Marketing Campaign',
    description: 'created project "Q1 Marketing Campaign"',
    timestamp: daysAgo(2),
  },
  {
    id: 'act-6',
    type: 'invite_accepted',
    actorName: 'Emily Davis',
    actorEmail: 'emily@example.com',
    description: 'accepted invitation and joined',
    timestamp: daysAgo(3),
  },
  {
    id: 'act-7',
    type: 'member_left',
    actorName: 'Former Employee',
    actorEmail: 'former@example.com',
    description: 'left the organization',
    timestamp: daysAgo(5),
  },
  {
    id: 'act-8',
    type: 'project_updated',
    actorName: 'Sarah Johnson',
    actorEmail: 'sarah@example.com',
    targetName: 'Product Roadmap',
    description: 'updated project "Product Roadmap"',
    timestamp: daysAgo(7),
  },
];

export const mockRecentActivity: RecentActivityResponse = {
  activities: mockActivities,
  total: mockActivities.length,
  hasMore: true,
};

/**
 * Mock Team Overview
 */
export const mockTeamOverview: TeamOverview = {
  totalMembers: 24,
  roleBreakdown: [
    { role: 'Admin', count: 3, percentage: 12.5 },
    { role: 'Member', count: 18, percentage: 75 },
    { role: 'Viewer', count: 3, percentage: 12.5 },
  ],
  recentMembers: [
    {
      id: 'user-1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Member',
      joinedAt: hoursAgo(2),
    },
    {
      id: 'user-2',
      name: 'Emily Davis',
      email: 'emily@example.com',
      role: 'Member',
      joinedAt: daysAgo(3),
    },
    {
      id: 'user-3',
      name: 'Alex Turner',
      email: 'alex@example.com',
      role: 'Viewer',
      joinedAt: daysAgo(7),
    },
    {
      id: 'user-4',
      name: 'Chris Morgan',
      email: 'chris@example.com',
      role: 'Admin',
      joinedAt: daysAgo(14),
    },
  ],
  pendingInvitations: 3,
};

/**
 * Mock Usage Metrics
 * Generates data points for the last 30 days
 */
const generateUsageData = (): UsageMetrics => {
  const dataPoints: UsageMetrics['apiCalls'] = [];
  const storagePoints: UsageMetrics['storage'] = [];
  const activeUsersPoints: UsageMetrics['activeUsers'] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate somewhat realistic fluctuating data
    const baseApiCalls = 450 + Math.random() * 300;
    const weekendFactor = [0, 6].includes(date.getDay()) ? 0.4 : 1;
    const apiCalls = Math.round(baseApiCalls * weekendFactor);

    // Storage grows slightly over time
    const storage = 2.1 + (29 - i) * 0.02 + Math.random() * 0.1;

    // Active users fluctuate
    const baseUsers = 18 + Math.random() * 8;
    const activeUsers = Math.round(baseUsers * weekendFactor);

    dataPoints.push({
      date: dateStr,
      value: apiCalls,
      label: `${apiCalls.toLocaleString()} calls`,
    });

    storagePoints.push({
      date: dateStr,
      value: Number(storage.toFixed(2)),
      label: `${storage.toFixed(2)} GB`,
    });

    activeUsersPoints.push({
      date: dateStr,
      value: activeUsers,
      label: `${activeUsers} users`,
    });
  }

  const totalApiCalls = dataPoints.reduce((sum: number, d: UsageDataPoint) => sum + d.value, 0);
  const totalStorage = storagePoints[storagePoints.length - 1].value;
  const averageActiveUsers = Math.round(
    activeUsersPoints.reduce((sum: number, d: UsageDataPoint) => sum + d.value, 0) / activeUsersPoints.length
  );

  return {
    apiCalls: dataPoints,
    storage: storagePoints,
    activeUsers: activeUsersPoints,
    period: {
      start: dataPoints[0].date,
      end: dataPoints[dataPoints.length - 1].date,
    },
    summary: {
      totalApiCalls,
      totalStorage,
      averageActiveUsers,
    },
  };
};

export const mockUsageMetrics: UsageMetrics = generateUsageData();

/**
 * Helper function to get mock data with simulated delay
 * Useful for testing loading states
 */
export const getMockDataWithDelay = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

/**
 * All mock dashboard data combined
 */
export const mockDashboardData = {
  stats: mockDashboardStats,
  recentActivity: mockRecentActivity,
  teamOverview: mockTeamOverview,
  usageMetrics: mockUsageMetrics,
};

export default mockDashboardData;
