'use client';

import React from 'react';
import { MainSidebar } from '@/components/navigation/MainSidebar';
import { useAuthGuard } from '@/hooks/useAuthGuard';

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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
