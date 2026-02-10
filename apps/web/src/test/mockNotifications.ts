/**
 * Mock Notifications for Testing
 *
 * Use these while the backend notification system isn't ready.
 * These mocks simulate real notification data and can be used
 * for UI development and testing.
 */

import type {
  Notification,
  NotificationPreferences,
  PaginatedNotifications,
} from '@vas-dj-saas/api-client';

// Helper to generate dates relative to now
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
 * Sample notifications for different categories and types
 */
export const mockNotifications: Notification[] = [
  // Security notifications
  {
    id: 'notif-001',
    type: 'warning',
    category: 'security',
    title: 'New Login Detected',
    message: 'A new login was detected from Chrome on macOS in San Francisco, CA.',
    link: '/settings/personal?tab=security',
    read: false,
    createdAt: hoursAgo(1),
    metadata: {
      device: 'Chrome on macOS',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
    },
  },
  {
    id: 'notif-002',
    type: 'success',
    category: 'security',
    title: 'Two-Factor Authentication Enabled',
    message: 'Your account is now protected with two-factor authentication.',
    link: '/settings/personal?tab=security',
    read: true,
    createdAt: daysAgo(2),
  },
  {
    id: 'notif-003',
    type: 'error',
    category: 'security',
    title: 'Failed Login Attempt',
    message: 'Someone tried to access your account with an incorrect password.',
    link: '/settings/personal?tab=security',
    read: false,
    createdAt: hoursAgo(4),
    metadata: {
      attempts: 3,
      location: 'Unknown',
    },
  },

  // Billing notifications
  {
    id: 'notif-004',
    type: 'info',
    category: 'billing',
    title: 'Invoice Available',
    message: 'Your invoice for January 2024 is now available for download.',
    link: '/settings/billing/invoices',
    read: false,
    createdAt: hoursAgo(6),
    metadata: {
      invoiceId: 'INV-2024-001',
      amount: '$99.00',
    },
  },
  {
    id: 'notif-005',
    type: 'warning',
    category: 'billing',
    title: 'Payment Method Expiring',
    message: 'Your credit card ending in 4242 will expire next month.',
    link: '/settings/billing/payment-methods',
    read: false,
    createdAt: daysAgo(1),
  },
  {
    id: 'notif-006',
    type: 'success',
    category: 'billing',
    title: 'Payment Successful',
    message: 'Your payment of $99.00 has been processed successfully.',
    link: '/settings/billing',
    read: true,
    createdAt: daysAgo(7),
    metadata: {
      amount: '$99.00',
      transactionId: 'txn_12345',
    },
  },

  // Team notifications
  {
    id: 'notif-007',
    type: 'info',
    category: 'team',
    title: 'New Team Member',
    message: 'Sarah Johnson has joined your organization as a Developer.',
    link: '/settings/organization/members',
    read: false,
    createdAt: hoursAgo(2),
    metadata: {
      memberName: 'Sarah Johnson',
      role: 'Developer',
    },
  },
  {
    id: 'notif-008',
    type: 'info',
    category: 'team',
    title: 'Invitation Accepted',
    message: 'John Doe accepted your invitation to join the team.',
    link: '/settings/organization/invitations',
    read: true,
    createdAt: daysAgo(3),
  },
  {
    id: 'notif-009',
    type: 'warning',
    category: 'team',
    title: 'Role Change',
    message: 'Your role has been changed from Viewer to Editor by Admin.',
    read: false,
    createdAt: hoursAgo(12),
  },

  // Marketing notifications
  {
    id: 'notif-010',
    type: 'info',
    category: 'marketing',
    title: 'New Feature Available',
    message: 'Check out our new analytics dashboard with advanced insights.',
    link: '/dashboard',
    read: true,
    createdAt: daysAgo(5),
  },
  {
    id: 'notif-011',
    type: 'info',
    category: 'marketing',
    title: 'Product Update',
    message: 'We\'ve improved performance by 50% - learn more about the changes.',
    read: true,
    createdAt: daysAgo(10),
  },

  // System notifications
  {
    id: 'notif-012',
    type: 'warning',
    category: 'system',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for Saturday 2 AM - 4 AM UTC.',
    read: false,
    createdAt: hoursAgo(8),
    metadata: {
      startTime: '2024-02-10T02:00:00Z',
      endTime: '2024-02-10T04:00:00Z',
    },
  },
  {
    id: 'notif-013',
    type: 'success',
    category: 'system',
    title: 'API Integration Connected',
    message: 'Your Slack integration has been successfully connected.',
    link: '/settings/developer',
    read: true,
    createdAt: daysAgo(4),
  },
];

/**
 * Get mock notifications with pagination support
 */
export function getMockNotifications(options?: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  category?: string;
}): PaginatedNotifications {
  const { page = 1, pageSize = 10, unreadOnly = false, category } = options || {};

  let filtered = [...mockNotifications];

  // Filter by unread
  if (unreadOnly) {
    filtered = filtered.filter((n) => !n.read);
  }

  // Filter by category
  if (category) {
    filtered = filtered.filter((n) => n.category === category);
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Paginate
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const results = filtered.slice(startIndex, endIndex);

  return {
    results,
    count: filtered.length,
    next: endIndex < filtered.length ? `/api/v1/notifications/?page=${page + 1}` : null,
    previous: page > 1 ? `/api/v1/notifications/?page=${page - 1}` : null,
  };
}

/**
 * Get unread notification count
 */
export function getMockUnreadCount(): number {
  return mockNotifications.filter((n) => !n.read).length;
}

/**
 * Default notification preferences
 */
export const defaultNotificationPreferences: NotificationPreferences = {
  security: {
    email: true,
    inApp: true,
    push: true,
  },
  billing: {
    email: true,
    inApp: true,
    push: false,
  },
  team: {
    email: true,
    inApp: true,
    push: true,
  },
  marketing: {
    email: false,
    inApp: true,
    push: false,
  },
};

/**
 * Simulate marking a notification as read
 * Returns the updated notification
 */
export function mockMarkAsRead(id: string): Notification | null {
  const notification = mockNotifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    return { ...notification };
  }
  return null;
}

/**
 * Simulate marking all notifications as read
 * Returns the count of updated notifications
 */
export function mockMarkAllAsRead(): number {
  let count = 0;
  mockNotifications.forEach((n) => {
    if (!n.read) {
      n.read = true;
      count++;
    }
  });
  return count;
}

/**
 * Simulate deleting a notification
 * Returns true if successful
 */
export function mockDeleteNotification(id: string): boolean {
  const index = mockNotifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    mockNotifications.splice(index, 1);
    return true;
  }
  return false;
}
