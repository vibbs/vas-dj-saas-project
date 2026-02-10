'use client';

import React from 'react';
import { Card, Icon, Skeleton } from '@vas-dj-saas/ui';
import type { DashboardStat } from '@vas-dj-saas/api-client';

// Mapping of icon names to Lucide icon names
const iconMap: Record<string, string> = {
  Users: 'Users',
  FolderOpen: 'FolderOpen',
  Mail: 'Mail',
  Activity: 'Activity',
  BarChart: 'BarChart3',
  TrendingUp: 'TrendingUp',
  Zap: 'Zap',
  Clock: 'Clock',
};

export interface StatCardProps {
  stat: DashboardStat;
  isLoading?: boolean;
}

/**
 * StatCard Component
 * Displays a metric with value, label, trend indicator, and icon
 */
export function StatCard({ stat, isLoading = false }: StatCardProps) {
  if (isLoading) {
    return (
      <Card variant="default" className="relative overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton width={80} height={14} variant="text" />
              <Skeleton width={60} height={32} variant="text" />
              <Skeleton width={100} height={12} variant="text" />
            </div>
            <Skeleton width={40} height={40} variant="rounded" />
          </div>
        </div>
      </Card>
    );
  }

  const { label, formattedValue, trend, icon } = stat;
  const iconName = icon ? iconMap[icon] || 'BarChart3' : 'BarChart3';

  // Trend colors and icons
  const trendConfig = {
    up: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: 'TrendingUp',
    },
    down: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      icon: 'TrendingDown',
    },
    neutral: {
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800/50',
      icon: 'Minus',
    },
  };

  const trendStyle = trend ? trendConfig[trend.direction as keyof typeof trendConfig] : null;

  return (
    <Card
      variant="default"
      className="relative overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Label */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {label}
            </p>

            {/* Value */}
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formattedValue}
            </p>

            {/* Trend */}
            {trend && trendStyle && (
              <div className="mt-2 flex items-center space-x-1.5">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${trendStyle.bgColor} ${trendStyle.color}`}
                >
                  <Icon
                    name={trendStyle.icon as any}
                    size="xs"
                    className="mr-0.5"
                    aria-hidden
                  />
                  {trend.percentage > 0 ? '+' : ''}
                  {trend.percentage}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {trend.period}
                </span>
              </div>
            )}
          </div>

          {/* Icon */}
          <div className="flex-shrink-0 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Icon
              name={iconName as any}
              size="lg"
              className="text-blue-600 dark:text-blue-400"
              aria-hidden
            />
          </div>
        </div>
      </div>

      {/* Subtle gradient accent at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-blue-500/20" />
    </Card>
  );
}

/**
 * StatCardGrid Component
 * Grid layout for multiple stat cards
 */
export interface StatCardGridProps {
  stats: DashboardStat[];
  isLoading?: boolean;
}

export function StatCardGrid({ stats, isLoading = false }: StatCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCard key={i} stat={{} as DashboardStat} isLoading />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}

export default StatCard;
