'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthAccount, useAuthActions } from '@vas-dj-saas/auth';
import { useNavigation, type NavItem } from '@vas-dj-saas/core/navigation';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';

/**
 * Main Sidebar Navigation
 * Unified sidebar for all protected pages using core navigation config
 */
export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const account = useAuthAccount();
  const { logout } = useAuthActions();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['settings-personal']) // Personal settings expanded by default
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get filtered navigation based on account and platform
  const { sections } = useNavigation({
    platform: 'web',
    account,
    // Can add feature flags here:
    // featureFlags: { flags: { newDashboard: true } },
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const toggleSection = (itemId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(item.href + '/');
    }
    if (item.children) {
      return item.children.some((child) => isItemActive(child));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isExpanded = expandedSections.has(item.id);
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;

    if (item.expandable && hasChildren) {
      // Expandable item with children
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleSection(item.id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors',
              isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              depth > 0 && 'ml-4 text-sm'
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <div
              className={cn(
                'flex items-center',
                isCollapsed ? 'justify-center w-full' : 'space-x-3'
              )}
            >
              <span className={cn(depth > 0 ? 'text-base' : 'text-lg')}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className={cn('font-medium', depth > 0 ? 'text-sm' : 'text-sm')}>
                  {item.label}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <svg
                className={cn(
                  'w-4 h-4 transition-transform',
                  isExpanded ? 'rotate-90' : ''
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {/* Render children when expanded */}
          {isExpanded && !isCollapsed && hasChildren && (
            <div className="mt-1 space-y-1">
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Direct link item
    return (
      <Link
        key={item.id}
        href={item.href!}
        className={cn(
          'flex items-center px-3 py-2 rounded-md transition-colors',
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          isCollapsed ? 'justify-center' : 'space-x-3',
          depth > 0 && 'ml-4 text-sm'
        )}
        title={isCollapsed ? item.label : item.description}
      >
        <span className={cn(depth > 0 ? 'text-base' : 'text-lg')}>{item.icon}</span>
        {!isCollapsed && (
          <span className={cn('font-medium', depth > 0 ? 'text-sm' : 'text-sm')}>
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col h-screen sticky top-0',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {env.appName}
            </span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn(
              'w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform',
              isCollapsed ? 'rotate-180' : ''
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            {section.title && !isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {!isCollapsed && account ? (
          <>
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {account.abbreviatedName}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {account.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {account.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <span className="text-lg">🚪</span>
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            title="Sign Out"
          >
            <span className="text-lg">🚪</span>
          </button>
        )}
      </div>
    </aside>
  );
}
