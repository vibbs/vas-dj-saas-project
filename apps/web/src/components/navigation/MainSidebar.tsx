'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthAccount, useAuthActions } from '@vas-dj-saas/auth';
import { useNavigation, type NavItem } from '@vas-dj-saas/core/navigation';
import { Icon } from '@vas-dj-saas/ui';
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

  const isItemActive = (item: NavItem): boolean => {
    if (!item.href) return false;
    // Match exact path or any sub-path (for tab-based pages)
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = isItemActive(item);

    // Skip items without href (shouldn't happen with new flat structure)
    if (!item.href) {
      console.warn(`Navigation item "${item.label}" is missing href`);
      return null;
    }

    // All items are now direct links (no expandable sections)
    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'flex items-center px-3 py-2 rounded-md transition-colors text-sm font-medium',
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          isCollapsed ? 'justify-center' : 'space-x-3'
        )}
        title={isCollapsed ? item.label : item.description}
      >
        <Icon name={item.icon} size="md" className="flex-shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
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
          <Icon
            name="ChevronsLeft"
            size="md"
            className={cn(
              'transition-transform',
              isCollapsed ? 'rotate-180' : ''
            )}
          />
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
              <Icon name="LogOut" size="md" />
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
            <Icon name="LogOut" size="md" />
          </button>
        )}
      </div>
    </aside>
  );
}
