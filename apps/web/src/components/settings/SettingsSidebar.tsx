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
        'border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Collapse Toggle */}
      <div
        className="p-4 border-b flex justify-between items-center"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {!isCollapsed && (
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--color-foreground)' }}
          >
            Settings
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md transition-colors"
          style={{ '--hover-bg': 'var(--color-secondary)' } as React.CSSProperties}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn(
              'w-5 h-5 transition-transform',
              isCollapsed ? 'rotate-180' : ''
            )}
            style={{ color: 'var(--color-muted-foreground)' }}
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
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
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
                        isCollapsed ? 'justify-center' : 'space-x-3'
                      )}
                      style={
                        isActive
                          ? {
                              backgroundColor: 'var(--color-primary-muted)',
                              color: 'var(--color-primary)',
                              borderLeft: '3px solid var(--color-primary)',
                              marginLeft: '-3px',
                              paddingLeft: 'calc(0.75rem + 3px)',
                            }
                          : {
                              color: 'var(--color-foreground)',
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
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
