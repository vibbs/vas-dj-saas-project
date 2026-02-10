'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, Check, Settings, Inbox, X } from 'lucide-react';
import { Badge, Spinner } from '@vas-dj-saas/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface NotificationCenterProps {
  /** Custom class name for the container */
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ enablePolling: true });

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Prevent body scroll when panel is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleGoToSettings = () => {
    setIsOpen(false);
    router.push('/settings/personal?tab=notifications');
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const BellIcon = unreadCount > 0 ? BellRing : Bell;

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className={`
          relative p-2 rounded-md transition-colors
          hover:bg-gray-100 dark:hover:bg-gray-700
          ${isOpen ? 'bg-gray-100 dark:bg-gray-700' : ''}
        `}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BellIcon
          size={20}
          className={unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}
        />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="
              absolute -top-0.5 -right-0.5
              flex items-center justify-center
              min-w-[18px] h-[18px] px-1
              text-xs font-medium text-white
              bg-red-500 rounded-full
            "
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification panel */}
      {isOpen && (
        <>
          {/* Mobile overlay */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Panel */}
          <div
            ref={panelRef}
            className={`
              ${isMobile
                ? 'fixed inset-x-0 bottom-0 top-16 z-50 rounded-t-2xl'
                : 'absolute right-0 top-full mt-2 w-96 rounded-xl z-50'
              }
              bg-white dark:bg-gray-800
              shadow-xl border border-gray-200 dark:border-gray-700
              flex flex-col overflow-hidden
            `}
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <Badge variant="primary" size="sm">
                    {unreadCount} new
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Mark all as read"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  onClick={handleGoToSettings}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Notification settings"
                >
                  <Settings size={18} />
                </button>
                {isMobile && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    aria-label="Close notifications"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div
              className={`
                flex-1 overflow-y-auto
                ${isMobile ? '' : 'max-h-[400px]'}
              `}
            >
              {isLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="md" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Inbox size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium mb-1">
                    No notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onMarkAsUnread={markAsUnread}
                      onDelete={deleteNotification}
                    />
                  ))}

                  {/* Load more button */}
                  {hasMore && (
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="
                        w-full py-3 text-sm text-blue-600 dark:text-blue-400
                        hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                        transition-colors disabled:opacity-50
                        flex items-center justify-center gap-2
                      "
                    >
                      {isLoading ? (
                        <>
                          <Spinner size="sm" />
                          Loading...
                        </>
                      ) : (
                        'Load more'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                onClick={handleGoToSettings}
                className="
                  w-full py-2 text-sm text-center text-blue-600 dark:text-blue-400
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  transition-colors
                "
              >
                Notification preferences
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
