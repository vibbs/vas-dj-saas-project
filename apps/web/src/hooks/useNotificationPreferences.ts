/**
 * useNotificationPreferences Hook
 *
 * Manages notification preference settings:
 * - Fetch current preferences
 * - Update preferences by category
 * - Update preferences by channel
 * - Persist to localStorage as fallback
 */

import { useState, useEffect, useCallback } from 'react';
import {
  NotificationsService,
  type NotificationPreferences,
  type NotificationChannels,
} from '@vas-dj-saas/api-client';
import { useAuthStatus } from '@vas-dj-saas/auth';
import { defaultNotificationPreferences } from '@/test/mockNotifications';

// Use a narrower type for preference categories (excludes 'system' which is only for notifications, not preferences)
type NotificationCategory = keyof NotificationPreferences;

// Configuration
const USE_MOCK_DATA = true; // Set to false when backend is ready
const STORAGE_KEY = 'notification_preferences';

type ChannelType = keyof NotificationChannels;

interface UseNotificationPreferencesResult {
  /** Current notification preferences */
  preferences: NotificationPreferences | null;
  /** Loading state */
  isLoading: boolean;
  /** Saving state */
  isSaving: boolean;
  /** Error message if any */
  error: string | null;
  /** Update a specific category's channel setting */
  updateChannel: (category: NotificationCategory, channel: ChannelType, enabled: boolean) => Promise<void>;
  /** Update all channels for a category */
  updateCategory: (category: NotificationCategory, channels: Partial<NotificationChannels>) => Promise<void>;
  /** Update entire preferences object */
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  /** Reset preferences to defaults */
  resetToDefaults: () => Promise<void>;
  /** Refresh preferences from server */
  refresh: () => Promise<void>;
}

/**
 * Get preferences from localStorage
 */
function getStoredPreferences(): NotificationPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save preferences to localStorage
 */
function saveStoredPreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

export function useNotificationPreferences(): UseNotificationPreferencesResult {
  const authStatus = useAuthStatus();

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch preferences from API or storage
   */
  const fetchPreferences = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Use stored preferences or defaults
        const stored = getStoredPreferences();
        setPreferences(stored || { ...defaultNotificationPreferences });
      } else {
        const response = await NotificationsService.getPreferences();

        if (response.status === 200 && response.data) {
          setPreferences(response.data);
          // Also save to localStorage as backup
          saveStoredPreferences(response.data);
        } else {
          throw new Error('Failed to fetch preferences');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preferences';
      console.error('Failed to fetch notification preferences:', err);
      setError(errorMessage);

      // Fall back to stored or default preferences
      const stored = getStoredPreferences();
      setPreferences(stored || { ...defaultNotificationPreferences });
    } finally {
      setIsLoading(false);
    }
  }, [authStatus]);

  /**
   * Update a specific channel for a category
   */
  const updateChannel = useCallback(
    async (category: NotificationCategory, channel: ChannelType, enabled: boolean) => {
      if (!preferences) return;

      const newPreferences: NotificationPreferences = {
        ...preferences,
        [category]: {
          ...preferences[category],
          [channel]: enabled,
        },
      };

      // Optimistic update
      setPreferences(newPreferences);
      saveStoredPreferences(newPreferences);
      setIsSaving(true);

      try {
        if (!USE_MOCK_DATA) {
          const response = await NotificationsService.updatePreferences({
            [category]: {
              ...preferences[category],
              [channel]: enabled,
            },
          });

          if (response.status !== 200) {
            throw new Error('Failed to update preferences');
          }
        }
      } catch (err) {
        // Revert on error
        console.error('Failed to update notification preference:', err);
        setPreferences(preferences);
        saveStoredPreferences(preferences);
        setError('Failed to update preference');
      } finally {
        setIsSaving(false);
      }
    },
    [preferences]
  );

  /**
   * Update all channels for a category
   */
  const updateCategory = useCallback(
    async (category: NotificationCategory, channels: Partial<NotificationChannels>) => {
      if (!preferences) return;

      const newPreferences: NotificationPreferences = {
        ...preferences,
        [category]: {
          ...preferences[category],
          ...channels,
        },
      };

      // Optimistic update
      setPreferences(newPreferences);
      saveStoredPreferences(newPreferences);
      setIsSaving(true);

      try {
        if (!USE_MOCK_DATA) {
          const response = await NotificationsService.updatePreferences({
            [category]: newPreferences[category],
          });

          if (response.status !== 200) {
            throw new Error('Failed to update preferences');
          }
        }
      } catch (err) {
        // Revert on error
        console.error('Failed to update notification category:', err);
        setPreferences(preferences);
        saveStoredPreferences(preferences);
        setError('Failed to update preferences');
      } finally {
        setIsSaving(false);
      }
    },
    [preferences]
  );

  /**
   * Update entire preferences object
   */
  const updatePreferences = useCallback(
    async (newPrefs: Partial<NotificationPreferences>) => {
      if (!preferences) return;

      const newPreferences: NotificationPreferences = {
        ...preferences,
        ...newPrefs,
      };

      // Optimistic update
      setPreferences(newPreferences);
      saveStoredPreferences(newPreferences);
      setIsSaving(true);

      try {
        if (!USE_MOCK_DATA) {
          const response = await NotificationsService.updatePreferences(newPrefs);

          if (response.status !== 200) {
            throw new Error('Failed to update preferences');
          }
        }
      } catch (err) {
        // Revert on error
        console.error('Failed to update notification preferences:', err);
        setPreferences(preferences);
        saveStoredPreferences(preferences);
        setError('Failed to update preferences');
      } finally {
        setIsSaving(false);
      }
    },
    [preferences]
  );

  /**
   * Reset preferences to defaults
   */
  const resetToDefaults = useCallback(async () => {
    const oldPreferences = preferences;

    // Optimistic update
    setPreferences({ ...defaultNotificationPreferences });
    saveStoredPreferences({ ...defaultNotificationPreferences });
    setIsSaving(true);

    try {
      if (!USE_MOCK_DATA) {
        const response = await NotificationsService.updatePreferences(
          defaultNotificationPreferences
        );

        if (response.status !== 200) {
          throw new Error('Failed to reset preferences');
        }
      }
    } catch (err) {
      // Revert on error
      console.error('Failed to reset notification preferences:', err);
      if (oldPreferences) {
        setPreferences(oldPreferences);
        saveStoredPreferences(oldPreferences);
      }
      setError('Failed to reset preferences');
    } finally {
      setIsSaving(false);
    }
  }, [preferences]);

  /**
   * Refresh preferences from server
   */
  const refresh = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  // Initial fetch
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    updateChannel,
    updateCategory,
    updatePreferences,
    resetToDefaults,
    refresh,
  };
}

/**
 * Helper hook to get human-readable category names
 */
export function useNotificationCategoryLabels(): Record<NotificationCategory, { label: string; description: string }> {
  return {
    security: {
      label: 'Security',
      description: 'Login alerts, password changes, and security events',
    },
    billing: {
      label: 'Billing',
      description: 'Invoices, payment confirmations, and subscription updates',
    },
    team: {
      label: 'Team',
      description: 'Member invitations, role changes, and team activity',
    },
    marketing: {
      label: 'Marketing',
      description: 'Product updates, new features, and promotional content',
    },
  };
}

/**
 * Helper hook to get human-readable channel names
 */
export function useNotificationChannelLabels(): Record<ChannelType, { label: string; description: string }> {
  return {
    email: {
      label: 'Email',
      description: 'Receive notifications via email',
    },
    inApp: {
      label: 'In-app',
      description: 'Show notifications in the app',
    },
    push: {
      label: 'Push',
      description: 'Receive push notifications on your devices',
    },
  };
}
