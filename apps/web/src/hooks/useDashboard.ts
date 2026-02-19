/**
 * Dashboard Data Hook
 * Provides dashboard statistics, activity, team overview, and usage metrics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DashboardService,
} from '@vas-dj-saas/api-client';
import type {
  DashboardStats,
  Activity,
  TeamOverview,
  UsageMetrics,
} from '@vas-dj-saas/api-client';
import { useOrganization } from './useOrganization';

interface UseDashboardResult {
  // Data
  stats: DashboardStats | null;
  activities: Activity[];
  teamOverview: TeamOverview | null;
  usageMetrics: UsageMetrics | null;

  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  isActivitiesLoading: boolean;
  isTeamLoading: boolean;
  isUsageLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshTeamOverview: () => Promise<void>;
  refreshUsageMetrics: () => Promise<void>;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Simple in-memory cache for dashboard data
const cache: {
  stats?: CacheEntry<DashboardStats>;
  activities?: CacheEntry<Activity[]>;
  teamOverview?: CacheEntry<TeamOverview>;
  usageMetrics?: CacheEntry<UsageMetrics>;
} = {};

const isCacheValid = <T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> => {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_DURATION;
};

export function useDashboard(): UseDashboardResult {
  const { organizationId } = useOrganization();

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teamOverview, setTeamOverview] = useState<TeamOverview | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);

  // Loading states
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [isTeamLoading, setIsTeamLoading] = useState(true);
  const [isUsageLoading, setIsUsageLoading] = useState(true);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetch dashboard stats
   * Currently uses mock data - replace with API call when ready
   */
  const fetchStats = useCallback(async (useCache = true) => {
    // Check cache first (works even without organizationId for mock data)
    if (useCache && isCacheValid(cache.stats)) {
      setStats(cache.stats.data);
      setIsStatsLoading(false);
      return;
    }

    setIsStatsLoading(true);

    try {
      const response = await DashboardService.getDashboardStats(organizationId || '');

      if (!isMountedRef.current) return;

      const data = response.data;

      // Update cache
      cache.stats = { data, timestamp: Date.now() };

      setStats(data);
    } catch (err: unknown) {
      console.error('Failed to fetch dashboard stats:', err);
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsStatsLoading(false);
      }
    }
  }, []);

  /**
   * Fetch recent activities
   */
  const fetchActivities = useCallback(async (useCache = true) => {
    // Check cache first (works even without organizationId for mock data)
    if (useCache && isCacheValid(cache.activities)) {
      setActivities(cache.activities.data);
      setIsActivitiesLoading(false);
      return;
    }

    setIsActivitiesLoading(true);

    try {
      const response = await DashboardService.getRecentActivity(organizationId || '');

      if (!isMountedRef.current) return;

      const data = response.data.activities;

      cache.activities = { data, timestamp: Date.now() };

      setActivities(data);
    } catch (err: unknown) {
      console.error('Failed to fetch activities:', err);
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities';
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsActivitiesLoading(false);
      }
    }
  }, []);

  /**
   * Fetch team overview
   */
  const fetchTeamOverview = useCallback(async (useCache = true) => {
    // Check cache first (works even without organizationId for mock data)
    if (useCache && isCacheValid(cache.teamOverview)) {
      setTeamOverview(cache.teamOverview.data);
      setIsTeamLoading(false);
      return;
    }

    setIsTeamLoading(true);

    try {
      const response = await DashboardService.getTeamOverview(organizationId || '');

      if (!isMountedRef.current) return;

      const data = response.data;

      cache.teamOverview = { data, timestamp: Date.now() };

      setTeamOverview(data);
    } catch (err: unknown) {
      console.error('Failed to fetch team overview:', err);
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team overview';
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsTeamLoading(false);
      }
    }
  }, []);

  /**
   * Fetch usage metrics
   */
  const fetchUsageMetrics = useCallback(async (useCache = true) => {
    // Check cache first (works even without organizationId for mock data)
    if (useCache && isCacheValid(cache.usageMetrics)) {
      setUsageMetrics(cache.usageMetrics.data);
      setIsUsageLoading(false);
      return;
    }

    setIsUsageLoading(true);

    try {
      const response = await DashboardService.getUsageMetrics(organizationId || '');

      if (!isMountedRef.current) return;

      const data = response.data;

      cache.usageMetrics = { data, timestamp: Date.now() };

      setUsageMetrics(data);
    } catch (err: unknown) {
      console.error('Failed to fetch usage metrics:', err);
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch usage metrics';
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsUsageLoading(false);
      }
    }
  }, []);

  /**
   * Refresh all dashboard data
   */
  const refresh = useCallback(async () => {
    setError(null);
    await Promise.all([
      fetchStats(false),
      fetchActivities(false),
      fetchTeamOverview(false),
      fetchUsageMetrics(false),
    ]);
  }, [fetchStats, fetchActivities, fetchTeamOverview, fetchUsageMetrics]);

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchActivities();
    fetchTeamOverview();
    fetchUsageMetrics();
  }, [fetchStats, fetchActivities, fetchTeamOverview, fetchUsageMetrics]);

  // Computed loading state
  const isLoading = isStatsLoading || isActivitiesLoading || isTeamLoading || isUsageLoading;

  return {
    // Data
    stats,
    activities,
    teamOverview,
    usageMetrics,

    // Loading states
    isLoading,
    isStatsLoading,
    isActivitiesLoading,
    isTeamLoading,
    isUsageLoading,

    // Error state
    error,

    // Actions
    refresh,
    refreshStats: () => fetchStats(false),
    refreshActivities: () => fetchActivities(false),
    refreshTeamOverview: () => fetchTeamOverview(false),
    refreshUsageMetrics: () => fetchUsageMetrics(false),
  };
}
