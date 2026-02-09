import React from 'react';
import type { Account } from '@vas-dj-saas/api-client';

export interface WelcomeCardProps {
  account: Account;
}

/**
 * WelcomeCard
 * Greeting card showing user info and organization
 */
export function WelcomeCard({ account }: WelcomeCardProps) {
  const greeting = getGreeting();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {greeting}, {account.firstName || account.fullName}!
          </h1>
          <p className="text-blue-100">
            Welcome to your dashboard
          </p>
          {account.role && (
            <div className="inline-flex items-center px-3 py-1 bg-blue-500/30 rounded-full text-sm">
              <span className="capitalize">{account.role.toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Account Badge */}
        <div className="flex flex-col items-end space-y-2">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {account.abbreviatedName}
            </span>
          </div>
          {account.isEmailVerified ? (
            <div className="flex items-center space-x-1 text-xs text-blue-100">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Verified</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-xs text-yellow-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Unverified</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatItem label="Role" value={account.role || 'User'} />
        <StatItem label="Status" value={account.status || 'Active'} />
        <StatItem label="Member Since" value={formatDate(account.dateJoined)} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-blue-200 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-white font-semibold mt-1 capitalize">{value.toLowerCase()}</p>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return 'Recently';
  }
}
