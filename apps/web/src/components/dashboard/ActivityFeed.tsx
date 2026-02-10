'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Avatar, Icon, Skeleton } from '@vas-dj-saas/ui';
import type { Activity, ActivityType } from '@vas-dj-saas/api-client';

// Activity type configuration
const activityConfig: Record<
  ActivityType,
  {
    icon: string;
    iconColor: string;
    iconBg: string;
  }
> = {
  member_joined: {
    icon: 'UserPlus',
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
  },
  member_left: {
    icon: 'UserMinus',
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
  },
  invite_sent: {
    icon: 'Send',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  invite_accepted: {
    icon: 'CheckCircle',
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
  },
  settings_changed: {
    icon: 'Settings',
    iconColor: 'text-gray-600 dark:text-gray-400',
    iconBg: 'bg-gray-50 dark:bg-gray-800/50',
  },
  project_created: {
    icon: 'FolderPlus',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  project_updated: {
    icon: 'FolderEdit',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  role_changed: {
    icon: 'Shield',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
  },
};

/**
 * Format relative time from ISO timestamp
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Show actual date for older items
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export interface ActivityItemProps {
  activity: Activity;
}

/**
 * ActivityItem Component
 * Single activity row with avatar, description, and timestamp
 */
function ActivityItem({ activity }: ActivityItemProps) {
  const config = activityConfig[activity.type];

  return (
    <div className="flex items-start space-x-3 py-3 group">
      {/* Activity type icon or Avatar */}
      <div className="flex-shrink-0">
        {activity.actorAvatar ? (
          <Avatar
            src={activity.actorAvatar}
            name={activity.actorName}
            size="sm"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center`}
          >
            <Icon
              name={config.icon as any}
              size="sm"
              className={config.iconColor}
              aria-hidden
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-gray-100">
          <span className="font-medium">{activity.actorName}</span>
          <span className="text-gray-600 dark:text-gray-400">
            {' '}
            {activity.description}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

/**
 * ActivityFeed Loading Skeleton
 */
function ActivityFeedSkeleton() {
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start space-x-3 py-3">
          <Skeleton width={32} height={32} variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="80%" height={14} variant="text" />
            <Skeleton width="40%" height={12} variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  maxItems?: number;
  showViewAll?: boolean;
  viewAllHref?: string;
}

/**
 * ActivityFeed Component
 * List of recent activities with avatars and timestamps
 */
export function ActivityFeed({
  activities,
  isLoading = false,
  maxItems = 5,
  showViewAll = true,
  viewAllHref = '/activity',
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card variant="default" className="h-full">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h3>
          {showViewAll && activities.length > 0 && (
            <Link
              href={viewAllHref}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View all
            </Link>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <ActivityFeedSkeleton />
        ) : displayedActivities.length === 0 ? (
          <div className="py-8 text-center">
            <Icon
              name="Clock"
              size="lg"
              className="mx-auto text-gray-400 dark:text-gray-500 mb-2"
              aria-hidden
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayedActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {/* View more indicator */}
        {!isLoading &&
          activities.length > maxItems &&
          showViewAll && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              +{activities.length - maxItems} more activities
            </p>
          )}
      </div>
    </Card>
  );
}

export default ActivityFeed;
