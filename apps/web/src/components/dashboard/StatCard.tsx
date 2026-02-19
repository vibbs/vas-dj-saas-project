'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
      <Card
        variant="default"
        className="relative overflow-hidden"
        style={{
          borderLeft: '4px solid var(--color-primary)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
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

  // Trend direction configurations
  const getTrendStyles = (direction: string) => {
    switch (direction) {
      case 'up':
        return {
          color: 'var(--color-success)',
          bgColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
          icon: 'TrendingUp',
        };
      case 'down':
        return {
          color: 'var(--color-destructive)',
          bgColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)',
          icon: 'TrendingDown',
        };
      default:
        return {
          color: 'var(--color-muted-foreground)',
          bgColor: 'color-mix(in srgb, var(--color-muted-foreground) 10%, transparent)',
          icon: 'Minus',
        };
    }
  };

  const trendStyle = trend ? getTrendStyles(trend.direction) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card
        variant="default"
        className="relative overflow-hidden transition-shadow duration-200"
        style={{
          borderLeft: '4px solid var(--color-primary)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <motion.div
          className="p-5"
          whileHover={{
            boxShadow: 'var(--shadow-lg)',
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start justify-between">
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Label */}
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {label}
              </p>

              {/* Value */}
              <p
                className="mt-2 text-3xl font-bold"
                style={{ color: 'var(--color-foreground)' }}
              >
                {formattedValue}
              </p>

              {/* Trend */}
              {trend && trendStyle && (
                <div className="mt-2 flex items-center space-x-1.5">
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                    style={{
                      color: trendStyle.color,
                      backgroundColor: trendStyle.bgColor,
                    }}
                  >
                    <Icon
                      name={trendStyle.icon as any}
                      size="xs"
                      className="mr-0.5"
                      style={{ color: trendStyle.color }}
                      aria-hidden
                    />
                    {trend.percentage > 0 ? '+' : ''}
                    {trend.percentage}%
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {trend.period}
                  </span>
                </div>
              )}
            </div>

            {/* Icon */}
            <div
              className="flex-shrink-0 p-2.5 rounded-lg"
              style={{ backgroundColor: 'var(--color-primary-muted)' }}
            >
              <Icon
                name={iconName as any}
                size="lg"
                style={{ color: 'var(--color-primary)' }}
                aria-hidden
              />
            </div>
          </div>
        </motion.div>

        {/* Subtle gradient accent at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: 'var(--gradient-primary)' }}
        />
      </Card>
    </motion.div>
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
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </motion.div>
  );
}

export default StatCard;
