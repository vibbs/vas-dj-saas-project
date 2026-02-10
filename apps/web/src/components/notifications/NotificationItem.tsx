'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  CreditCard,
  Users,
  Megaphone,
  Settings,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import type { Notification, NotificationType, NotificationCategory } from '@vas-dj-saas/api-client';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

/**
 * Get icon component based on notification type
 */
function getTypeIcon(type: NotificationType): React.ReactNode {
  const iconSize = 16;

  switch (type) {
    case 'success':
      return <CheckCircle size={iconSize} className="text-green-500" />;
    case 'warning':
      return <AlertTriangle size={iconSize} className="text-yellow-500" />;
    case 'error':
      return <XCircle size={iconSize} className="text-red-500" />;
    case 'info':
    default:
      return <Info size={iconSize} className="text-blue-500" />;
  }
}

/**
 * Get category icon component
 */
function getCategoryIcon(category: NotificationCategory): React.ReactNode {
  const iconSize = 14;
  const className = 'text-gray-400';

  switch (category) {
    case 'security':
      return <Shield size={iconSize} className={className} />;
    case 'billing':
      return <CreditCard size={iconSize} className={className} />;
    case 'team':
      return <Users size={iconSize} className={className} />;
    case 'marketing':
      return <Megaphone size={iconSize} className={className} />;
    default:
      return <Settings size={iconSize} className={className} />;
  }
}

/**
 * Get type-based background color for the icon container
 */
function getTypeBackground(type: NotificationType): string {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20';
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20';
    case 'info':
    default:
      return 'bg-blue-50 dark:bg-blue-900/20';
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  compact = false,
}: NotificationItemProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleClick = () => {
    // Mark as read when clicking
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate if there's a link
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.read) {
      onMarkAsUnread?.(notification.id);
    } else {
      onMarkAsRead?.(notification.id);
    }
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
    setShowMenu(false);
  };

  return (
    <div
      className={`
        relative group flex gap-3 p-3 rounded-lg cursor-pointer transition-all
        ${notification.read
          ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        }
        ${compact ? 'py-2' : 'py-3'}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${notification.read ? '' : 'Unread: '}${notification.title}`}
    >
      {/* Unread indicator dot */}
      {!notification.read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      )}

      {/* Icon */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${getTypeBackground(notification.type)}
        `}
      >
        {getTypeIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={`
                text-sm font-medium truncate
                ${notification.read
                  ? 'text-gray-700 dark:text-gray-200'
                  : 'text-gray-900 dark:text-white'
                }
              `}
            >
              {notification.title}
            </p>
            {!compact && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                {notification.message}
              </p>
            )}
          </div>

          {/* Actions menu */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              onClick={handleMenuClick}
              className={`
                p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              `}
              aria-label="Notification options"
            >
              <MoreHorizontal size={16} className="text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div
                className="
                  absolute right-0 top-full mt-1 z-50
                  w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                  py-1
                "
              >
                <button
                  onClick={handleMarkAsRead}
                  className="w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {notification.read ? 'Mark as unread' : 'Mark as read'}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            {getCategoryIcon(notification.category)}
            <span className="capitalize">{notification.category}</span>
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
