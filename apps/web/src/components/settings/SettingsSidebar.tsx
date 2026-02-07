'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Account } from '@vas-dj-saas/api-client';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiredRole?: 'admin' | 'orgAdmin';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SettingsSidebarProps {
  account?: Account;
}

/**
 * Settings Sidebar
 * Navigation sidebar with role-based filtering
 */
export function SettingsSidebar({ account }: SettingsSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if a nav item is active (handles both path and query params)
  const isItemActive = (href: string) => {
    const [itemPath, itemQuery] = href.split('?');
    if (pathname !== itemPath) return false;
    if (!itemQuery) return true;
    const params = new URLSearchParams(itemQuery);
    const tab = params.get('tab');
    return tab ? searchParams.get('tab') === tab : true;
  };

  // Check if user has required role
  const hasAccess = (requiredRole?: 'admin' | 'orgAdmin') => {
    if (!requiredRole) return true;
    if (!account) return false;

    if (requiredRole === 'admin') {
      return account.isAdmin;
    }

    if (requiredRole === 'orgAdmin') {
      return account.isOrgAdmin || account.isOrgCreator || account.isAdmin;
    }

    return false;
  };

  const sections: NavSection[] = [
    {
      title: 'Personal',
      items: [
        { label: 'Profile', href: '/settings/personal?tab=profile', icon: '👤' },
        { label: 'Security', href: '/settings/personal?tab=security', icon: '🔒' },
        { label: 'Notifications', href: '/settings/personal?tab=notifications', icon: '🔔' },
      ],
    },
    {
      title: 'Organization',
      items: [
        { label: 'Profile', href: '/settings/organization/profile', icon: '🏢', requiredRole: 'orgAdmin' },
        { label: 'Members & Teams', href: '/settings/organization/members', icon: '👥', requiredRole: 'orgAdmin' },
        { label: 'API Keys', href: '/settings/organization/api-keys', icon: '🔑', requiredRole: 'orgAdmin' },
        { label: 'Integrations', href: '/settings/organization/integrations', icon: '🔌', requiredRole: 'orgAdmin' },
        { label: 'Billing', href: '/settings/organization/billing', icon: '💳', requiredRole: 'orgAdmin' },
        { label: 'Import / Export', href: '/settings/organization/import-export', icon: '📦', requiredRole: 'orgAdmin' },
      ],
    },
    {
      title: 'Developer',
      items: [
        { label: 'Webhooks', href: '/settings/developer/webhooks', icon: '🪝', requiredRole: 'orgAdmin' },
        { label: 'OAuth Clients', href: '/settings/developer/oauth', icon: '🔐', requiredRole: 'orgAdmin' },
        { label: 'Service Accounts', href: '/settings/developer/service-accounts', icon: '🤖', requiredRole: 'orgAdmin' },
      ],
    },
  ];

  // Filter sections based on access
  const visibleSections = sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasAccess(item.requiredRole)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside
      className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Settings
          </h2>
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
      <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-8rem)]">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = isItemActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                        isCollapsed ? 'justify-center' : 'space-x-3'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
