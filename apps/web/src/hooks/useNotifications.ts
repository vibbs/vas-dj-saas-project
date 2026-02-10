/**
 * useNotifications Hook
 *
 * Manages notification state including:
 * - Fetching notifications with pagination
 * - Unread count
 * - Mark as read/unread
 * - Delete notifications
 * - Polling for new notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NotificationsService,
  type Notification,
  type NotificationCategory,
} from '@vas-dj-saas/api-client';
import { useAuthStatus } from '@vas-dj-saas/auth';
import {
  getMockNotifications,
  getMockUnreadCount,
  mockMarkAsRead,
  mockMarkAllAsRead,
  mockDeleteNotification,
} from '@/test/mockNotifications';

// Configuration
const POLLING_INTERVAL = 30000; // 30 seconds
const PAGE_SIZE = 10;
const USE_MOCK_DATA = true; // Set to false when backend is ready

// Local storage key for read status fallback
const READ_STATUS_KEY = 'notifications_read_status';

interface UseNotificationsOptions {
  /** Enable polling for new notifications */
  enablePolling?: boolean;
  /** Filter by category */
  category?: NotificationCategory;
  /** Only fetch unread notifications */
  unreadOnly?: boolean;
}

interface UseNotificationsResult {
  /** List of notifications */
  notifications: Notification[];
  /** Total count of notifications */
  totalCount: number;
  /** Unread notification count */
  unreadCount: number;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Current page number */
  page: number;
  /** Whether there are more notifications to load */
  hasMore: boolean;
  /** Fetch next page of notifications */
  loadMore: () => Promise<void>;
  /** Refresh notifications */
  refresh: () => Promise<void>;
  /** Mark a single notification as read */
  markAsRead: (id: string) => Promise<void>;
  /** Mark a single notification as unread */
  markAsUnread: (id: string) => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Delete a notification */
  deleteNotification: (id: string) => Promise<void>;
}

/**
 * Get read status from localStorage fallback
 */
function getLocalReadStatus(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(READ_STATUS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save read status to localStorage fallback
 */
function saveLocalReadStatus(status: Record<string, boolean>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(READ_STATUS_KEY, JSON.stringify(status));
  } catch {
    // Ignore storage errors
  }
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const { enablePolling = true, category, unreadOnly = false } = options;
  const authStatus = useAuthStatus();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Track local read status
  const localReadStatusRef = useRef<Record<string, boolean>>(getLocalReadStatus());

  /**
   * Apply local read status to notifications
   */
  const applyLocalReadStatus = useCallback((notifs: Notification[]): Notification[] => {
    const localStatus = localReadStatusRef.current;
    return notifs.map((n) => ({
      ...n,
      read: localStatus[n.id] !== undefined ? localStatus[n.id] : n.read,
    }));
  }, []);

  /**
   * Fetch notifications from API or mock
   */
  const fetchNotifications = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (authStatus !== 'authenticated') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          // Use mock data
          const result = getMockNotifications({
            page: pageNum,
            pageSize: PAGE_SIZE,
            unreadOnly,
            category,
          });

          const processedNotifications = applyLocalReadStatus(result.results);

          if (append) {
            setNotifications((prev) => [...prev, ...processedNotifications]);
          } else {
            setNotifications(processedNotifications);
          }

          setTotalCount(result.count);
          setHasMore(result.next !== null);
          setUnreadCount(getMockUnreadCount());
        } else {
          // Use real API
          const response = await NotificationsService.getNotifications({
            page: pageNum,
            page_size: PAGE_SIZE,
            unread_only: unreadOnly,
            category,
          });

          if (response.status === 200 && response.data) {
            const processedNotifications = applyLocalReadStatus(response.data.results);

            if (append) {
              setNotifications((prev) => [...prev, ...processedNotifications]);
            } else {
              setNotifications(processedNotifications);
            }

            setTotalCount(response.data.count);
            setHasMore(response.data.next !== null);
          } else {
            throw new Error('Failed to fetch notifications');
          }

          // Fetch unread count separately
          const countResponse = await NotificationsService.getUnreadCount();
          if (countResponse.status === 200 && countResponse.data) {
            setUnreadCount(countResponse.data.count);
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
        console.error('Failed to fetch notifications:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [authStatus, category, unreadOnly, applyLocalReadStatus]
  );

  /**
   * Load more notifications (next page)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchNotifications(nextPage, true);
  }, [hasMore, isLoading, page, fetchNotifications]);

  /**
   * Refresh notifications (reset to page 1)
   */
  const refresh = useCallback(async () => {
    setPage(1);
    await fetchNotifications(1, false);
  }, [fetchNotifications]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Update local storage
      localReadStatusRef.current[id] = true;
      saveLocalReadStatus(localReadStatusRef.current);

      try {
        if (USE_MOCK_DATA) {
          mockMarkAsRead(id);
        } else {
          await NotificationsService.markAsRead(id);
        }
      } catch (err) {
        // Revert on error
        console.error('Failed to mark notification as read:', err);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
        setUnreadCount((prev) => prev + 1);
      }
    },
    []
  );

  /**
   * Mark a single notification as unread
   */
  const markAsUnread = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);

      // Update local storage
      localReadStatusRef.current[id] = false;
      saveLocalReadStatus(localReadStatusRef.current);

      try {
        if (!USE_MOCK_DATA) {
          await NotificationsService.markAsUnread(id);
        }
      } catch (err) {
        // Revert on error
        console.error('Failed to mark notification as unread:', err);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    []
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    // Update local storage
    unreadIds.forEach((id) => {
      localReadStatusRef.current[id] = true;
    });
    saveLocalReadStatus(localReadStatusRef.current);

    try {
      if (USE_MOCK_DATA) {
        mockMarkAllAsRead();
      } else {
        await NotificationsService.markAllAsRead();
      }
    } catch (err) {
      // Revert on error
      console.error('Failed to mark all as read:', err);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: unreadIds.includes(n.id) ? false : n.read,
        }))
      );
      setUnreadCount(unreadIds.length);
    }
  }, [notifications]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    async (id: string) => {
      const notificationToDelete = notifications.find((n) => n.id === id);
      if (!notificationToDelete) return;

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (!notificationToDelete.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Remove from local storage
      delete localReadStatusRef.current[id];
      saveLocalReadStatus(localReadStatusRef.current);

      try {
        if (USE_MOCK_DATA) {
          mockDeleteNotification(id);
        } else {
          await NotificationsService.deleteNotification(id);
        }
      } catch (err) {
        // Revert on error
        console.error('Failed to delete notification:', err);
        setNotifications((prev) => {
          const newList = [...prev];
          // Find the right position to insert back
          const insertIndex = newList.findIndex(
            (n) => new Date(n.createdAt) < new Date(notificationToDelete.createdAt)
          );
          if (insertIndex === -1) {
            newList.push(notificationToDelete);
          } else {
            newList.splice(insertIndex, 0, notificationToDelete);
          }
          return newList;
        });
        setTotalCount((prev) => prev + 1);
        if (!notificationToDelete.read) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    },
    [notifications]
  );

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Polling for new notifications
  useEffect(() => {
    if (!enablePolling || authStatus !== 'authenticated') return;

    const pollInterval = setInterval(() => {
      // Only refresh if user is on the page
      if (document.visibilityState === 'visible') {
        fetchNotifications(1, false);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [enablePolling, authStatus, fetchNotifications]);

  return {
    notifications,
    totalCount,
    unreadCount,
    isLoading,
    error,
    page,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
  };
}
