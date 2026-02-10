/**
 * Notifications Service
 * Clean wrapper for notification endpoints
 *
 * Note: Backend notification endpoints may not exist yet.
 * This service provides stub methods that can work with mock data
 * and will be ready when backend is implemented.
 */

import { customFetch } from '../core/mutator';

// ================== Types ==================

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export type NotificationCategory = 'security' | 'billing' | 'team' | 'marketing' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedNotifications {
  results: Notification[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface NotificationPreferences {
  security: NotificationChannels;
  billing: NotificationChannels;
  team: NotificationChannels;
  marketing: NotificationChannels;
}

export interface NotificationChannels {
  email: boolean;
  inApp: boolean;
  push: boolean;
}

export interface GetNotificationsParams {
  page?: number;
  page_size?: number;
  unread_only?: boolean;
  category?: NotificationCategory;
}

// ================== API Response Types ==================

interface NotificationsListResponse {
  data: PaginatedNotifications;
  status: number;
  headers: Headers;
}

interface NotificationResponse {
  data: Notification;
  status: number;
  headers: Headers;
}

interface NotificationPreferencesResponse {
  data: NotificationPreferences;
  status: number;
  headers: Headers;
}

interface UnreadCountResponse {
  data: { count: number };
  status: number;
  headers: Headers;
}

interface MarkAllReadResponse {
  data: { message: string; updated_count: number };
  status: number;
  headers: Headers;
}

interface DeleteNotificationResponse {
  data: void;
  status: number;
  headers: Headers;
}

// ================== Helper Functions ==================

const buildUrl = (base: string, params?: Record<string, unknown>): string => {
  if (!params) return base;

  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlParams.append(key, String(value));
    }
  });

  const queryString = urlParams.toString();
  return queryString ? `${base}?${queryString}` : base;
};

// ================== Service ==================

export const NotificationsService = {
  /**
   * Get paginated list of notifications
   */
  getNotifications: async (
    params?: GetNotificationsParams
  ): Promise<NotificationsListResponse> => {
    const url = buildUrl('/api/v1/notifications/', params as Record<string, unknown>);
    return customFetch<NotificationsListResponse>(url, {
      method: 'GET',
    });
  },

  /**
   * Get single notification by ID
   */
  getNotification: async (id: string): Promise<NotificationResponse> => {
    return customFetch<NotificationResponse>(`/api/v1/notifications/${id}/`, {
      method: 'GET',
    });
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return customFetch<UnreadCountResponse>('/api/v1/notifications/unread-count/', {
      method: 'GET',
    });
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string): Promise<NotificationResponse> => {
    return customFetch<NotificationResponse>(`/api/v1/notifications/${id}/mark-read/`, {
      method: 'POST',
    });
  },

  /**
   * Mark a single notification as unread
   */
  markAsUnread: async (id: string): Promise<NotificationResponse> => {
    return customFetch<NotificationResponse>(`/api/v1/notifications/${id}/mark-unread/`, {
      method: 'POST',
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<MarkAllReadResponse> => {
    return customFetch<MarkAllReadResponse>('/api/v1/notifications/mark-all-read/', {
      method: 'POST',
    });
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<DeleteNotificationResponse> => {
    return customFetch<DeleteNotificationResponse>(`/api/v1/notifications/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get user notification preferences
   */
  getPreferences: async (): Promise<NotificationPreferencesResponse> => {
    return customFetch<NotificationPreferencesResponse>('/api/v1/notifications/preferences/', {
      method: 'GET',
    });
  },

  /**
   * Update user notification preferences
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferencesResponse> => {
    return customFetch<NotificationPreferencesResponse>('/api/v1/notifications/preferences/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
  },
} as const;
