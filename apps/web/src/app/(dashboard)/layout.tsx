'use client';

import React from 'react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { useAuthGuard } from '@/hooks/useAuthGuard';

/**
 * Dashboard Layout
 * Protected layout for authenticated pages
 */
export default function DashboardLayout({
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <DashboardNav account={account} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
