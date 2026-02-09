import React from 'react';

/**
 * Loading state for dashboard pages
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome Card Skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 animate-pulse"></div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 animate-pulse"
          ></div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"></div>
    </div>
  );
}
