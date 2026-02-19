'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MainSidebar } from '@/components/navigation/MainSidebar';
import { FloatingBreadcrumb } from '@/components/navigation/FloatingBreadcrumb';
import { NotificationCenter } from '@/components/notifications';
import { AppBar } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { getPageMetadata } from '@/utils/navigation-helpers';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Menu } from 'lucide-react';

/**
 * Protected Layout
 * Layout for all authenticated pages with unified sidebar navigation
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, account } = useAuthGuard();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Prevent hydration mismatch by only rendering dynamic content after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get page metadata from navigation config
  const pageMetadata = React.useMemo(() => {
    return getPageMetadata(pathname, navigationConfig);
  }, [pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  // If not loading and no account, useAuthGuard will redirect
  if (!account) {
    return null;
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Unified Sidebar Navigation */}
      <MainSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />

      {/* Main Content with AppBar */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* AppBar - Sticky Header */}
        {isMounted && (
          <AppBar
            title={pageMetadata?.title || 'My Application'}
            subtitle={isMobile ? undefined : pageMetadata?.description}
            position="sticky"
            leading={
              isMobile ? (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-md transition-colors md:hidden"
                  style={{
                    color: 'var(--color-foreground)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-muted)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
              ) : undefined
            }
            trailing={<NotificationCenter />}
          />
        )}

        {/* Content Area with Breadcrumbs */}
        <div className="flex-1 container mx-auto px-4 py-4 max-w-7xl">
          {isMounted && <FloatingBreadcrumb />}
          {children}
        </div>
      </main>
    </div>
  );
}
