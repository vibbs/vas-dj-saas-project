'use client';

import React from 'react';
import { useAuthAccount } from '@vas-dj-saas/auth';

/**
 * Home Page (Protected)
 * Simple welcome page for authenticated users
 */
export default function HomePage() {
  const account = useAuthAccount();

  if (!account) {
    return null; // Layout handles auth guard
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, {account.firstName || account.fullName}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You're successfully logged in to your account
          </p>
        </div>

        {/* User Info */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">
                Name:
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {account.fullName || `${account.firstName} ${account.lastName}`}
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">
                Email:
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {account.email}
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">
                Status:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {account.isEmailVerified ? '✓ Email Verified' : '⚠ Email Not Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Update Profile
            </button>
            <button className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 transition-colors font-medium text-sm">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
