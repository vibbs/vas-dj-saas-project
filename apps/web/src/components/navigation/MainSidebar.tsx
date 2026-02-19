'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthAccount, useAuthActions } from '@vas-dj-saas/auth';
import { useNavigation, type NavItem } from '@vas-dj-saas/core/navigation';
import { Icon } from '@vas-dj-saas/ui';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';

interface MainSidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: (open: boolean) => void;
}

/**
 * Main Sidebar Navigation
 * Unified sidebar for all protected pages using core navigation config
 *
 * Responsive behavior:
 * - Mobile (<768px): Hidden by default, drawer with overlay (controlled by parent)
 * - Tablet (768px-1024px): Collapsed by default
 * - Desktop (>1024px): Full width by default
 */
export function MainSidebar({ isMobileMenuOpen = false, onMobileMenuToggle }: MainSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const account = useAuthAccount();
  const { logout } = useAuthActions();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle responsive behavior on mount and resize
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        // Desktop: expand by default
        setIsCollapsed(false);
        onMobileMenuToggle?.(false);
      } else if (width >= 768) {
        // Tablet: collapse by default
        setIsCollapsed(true);
        onMobileMenuToggle?.(false);
      } else {
        // Mobile: hide by default
        onMobileMenuToggle?.(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onMobileMenuToggle]);

  // Close mobile menu on route change
  React.useEffect(() => {
    onMobileMenuToggle?.(false);
  }, [pathname, onMobileMenuToggle]);

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
          'flex items-center px-3 py-2 rounded-md text-sm font-medium',
          isCollapsed ? 'justify-center' : 'space-x-3'
        )}
        style={{
          transition: 'all 0.2s ease-in-out',
          ...(isActive
            ? {
                backgroundColor: 'var(--color-primary-muted)',
                color: 'var(--color-primary)',
                borderLeft: '3px solid var(--color-primary)',
                marginLeft: '-3px',
                paddingLeft: 'calc(0.75rem + 3px)',
              }
            : {
                color: 'var(--color-foreground)',
                borderLeft: '3px solid transparent',
                marginLeft: '-3px',
                paddingLeft: 'calc(0.75rem + 3px)',
              }),
        }}
        title={isCollapsed ? item.label : item.description}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
            e.currentTarget.style.transform = 'translateX(2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateX(0)';
          }
        }}
      >
        <Icon name={item.icon} size="md" className="flex-shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            transition: 'opacity 0.2s ease-in-out',
          }}
          onClick={() => onMobileMenuToggle?.(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'transition-all duration-300 flex flex-col h-screen sticky top-0 z-50',
          // Desktop and Tablet behavior
          'hidden md:flex',
          isCollapsed ? 'md:w-16' : 'md:w-64',
          // Mobile drawer behavior
          isMobileMenuOpen && 'flex fixed inset-y-0 left-0 w-64'
        )}
        style={{
          backgroundColor: 'var(--color-card)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {!isCollapsed && (
          <Link href="/home" className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--color-foreground)' }}
            >
              {env.appName}
            </span>
          </Link>
        )}
        {/* Desktop/Tablet toggle - hide on mobile */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:block p-2 rounded-md"
          style={{ transition: 'background-color 0.2s ease-in-out' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
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

        {/* Mobile close button */}
        <button
          onClick={() => onMobileMenuToggle?.(false)}
          className="md:hidden p-2 rounded-md"
          style={{ transition: 'background-color 0.2s ease-in-out' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Close menu"
        >
          <Icon name="X" size="md" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            {section.title && !isCollapsed && (
              <h3
                className="text-xs font-semibold uppercase tracking-wider px-3"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
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
      <div
        className="p-4 space-y-2"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {!isCollapsed && account ? (
          <>
            <div className="flex items-center space-x-3 px-3 py-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span className="text-white font-semibold text-sm">
                  {account.abbreviatedName}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {account.fullName}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {account.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm disabled:opacity-50"
              style={{
                color: 'var(--color-destructive)',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 10%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon name="LogOut" size="md" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center p-2 rounded-md disabled:opacity-50"
            style={{
              color: 'var(--color-destructive)',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 10%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Sign Out"
          >
            <Icon name="LogOut" size="md" />
          </button>
        )}
      </div>
    </aside>
    </>
  );
}
