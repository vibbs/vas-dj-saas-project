'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Avatar, Icon, Skeleton } from '@vas-dj-saas/ui';
import type { Activity, ActivityType } from '@vas-dj-saas/api-client';

// Activity type configuration using CSS variables
const activityConfig: Record<
  ActivityType,
  {
    icon: string;
    iconColor: string;
    iconBgColor: string;
  }
> = {
  member_joined: {
    icon: 'UserPlus',
    iconColor: 'var(--color-success)',
    iconBgColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
  },
  member_left: {
    icon: 'UserMinus',
    iconColor: 'var(--color-destructive)',
    iconBgColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)',
  },
  invite_sent: {
    icon: 'Send',
    iconColor: 'var(--color-primary)',
    iconBgColor: 'var(--color-primary-muted)',
  },
  invite_accepted: {
    icon: 'CheckCircle',
    iconColor: 'var(--color-success)',
    iconBgColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
  },
  settings_changed: {
    icon: 'Settings',
    iconColor: 'var(--color-muted-foreground)',
    iconBgColor: 'color-mix(in srgb, var(--color-muted-foreground) 10%, transparent)',
  },
  project_created: {
    icon: 'FolderPlus',
    iconColor: 'var(--color-accent)',
    iconBgColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
  },
  project_updated: {
    icon: 'FolderEdit',
    iconColor: 'var(--color-primary)',
    iconBgColor: 'var(--color-primary-muted)',
  },
  role_changed: {
    icon: 'Shield',
    iconColor: 'var(--color-warning)',
    iconBgColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
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
    <div
      className="flex items-start space-x-3 py-3 px-2 -mx-2 rounded-lg group transition-all duration-200 ease-in-out hover:scale-[1.01]"
      style={{
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-muted) 50%, transparent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Activity type icon or Avatar */}
      <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
        {activity.actorAvatar ? (
          <Avatar
            src={activity.actorAvatar}
            name={activity.actorName}
            size="sm"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: config.iconBgColor,
            }}
          >
            <Icon
              name={config.icon as any}
              size="sm"
              style={{ color: config.iconColor }}
              aria-hidden
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm"
          style={{ color: 'var(--color-foreground)' }}
        >
          <span className="font-medium">{activity.actorName}</span>
          <span style={{ color: 'var(--color-muted-foreground)' }}>
            {' '}
            {activity.description}
          </span>
        </p>
        <p
          className="mt-0.5 text-xs transition-colors duration-200"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
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
          <h3
            className="text-base font-semibold"
            style={{ color: 'var(--color-foreground)' }}
          >
            Recent Activity
          </h3>
          {showViewAll && activities.length > 0 && (
            <Link
              href={viewAllHref}
              className="text-sm font-medium transition-all duration-200 hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
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
              className="mx-auto mb-2"
              style={{ color: 'var(--color-muted-foreground)' }}
              aria-hidden
            />
            <p
              className="text-sm"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              No recent activity
            </p>
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {displayedActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {/* View more indicator */}
        {!isLoading &&
          activities.length > maxItems &&
          showViewAll && (
            <p
              className="mt-2 text-xs text-center"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              +{activities.length - maxItems} more activities
            </p>
          )}
      </div>
    </Card>
  );
}

export default ActivityFeed;
