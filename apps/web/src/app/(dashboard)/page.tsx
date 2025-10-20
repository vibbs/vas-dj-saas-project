'use client';

import React from 'react';
import { useAuthAccount } from '@vas-dj-saas/auth';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';

/**
 * Dashboard Home Page
 * Main landing page for authenticated users
 */
export default function DashboardPage() {
  const account = useAuthAccount();

  if (!account) {
    return null; // Layout handles auth guard
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard account={account} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Create Project"
          description="Start a new project"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
          onClick={() => alert('Create Project - Coming soon!')}
        />

        <QuickActionCard
          title="Invite Team Member"
          description="Add people to your organization"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          onClick={() => alert('Invite Team - Coming soon!')}
        />

        <QuickActionCard
          title="View Analytics"
          description="Check your metrics"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          onClick={() => alert('Analytics - Coming soon!')}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No recent activity to display</p>
          <p className="text-sm mt-2">Start by creating your first project</p>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
