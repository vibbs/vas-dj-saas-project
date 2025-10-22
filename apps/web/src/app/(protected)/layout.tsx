'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MainSidebar } from '@/components/navigation/MainSidebar';
import { FloatingBreadcrumb } from '@/components/navigation/FloatingBreadcrumb';
import { AppBar } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { getPageMetadata } from '@/utils/navigation-helpers';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Bell } from 'lucide-react';

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

  // Prevent hydration mismatch by only rendering dynamic content after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get page metadata from navigation config
  const pageMetadata = React.useMemo(() => {
    return getPageMetadata(pathname, navigationConfig);
  }, [pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not loading and no account, useAuthGuard will redirect
  if (!account) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Unified Sidebar Navigation */}
      <MainSidebar />

      {/* Main Content with AppBar */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* AppBar - Sticky Header */}
        {isMounted && (
          <AppBar
            title={pageMetadata?.title || 'My Application'}
            subtitle={pageMetadata?.description}
            position="sticky"
            actions={[
              {
                id: 'notifications',
                icon: <Bell size={20} />,
                label: 'Notifications',
                badge: 3,
              },
            ]}
            onActionClick={(action) => {
              if (action.id === 'notifications') {
                // Handle notifications click
                console.log('Notifications clicked');
              }
            }}
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
