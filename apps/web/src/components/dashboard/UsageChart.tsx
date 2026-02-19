'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Card, Icon, Skeleton } from '@vas-dj-saas/ui';
import type { UsageMetrics, UsageDataPoint } from '@vas-dj-saas/api-client';

/**
 * Helper to read CSS variable values from computed styles
 * Returns the actual color value for use in SVG/Canvas contexts
 */
function useCSSVariable(variableName: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const computedValue = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
      if (computedValue) {
        setValue(computedValue);
      }
    }
  }, [variableName]);

  return value;
}

/**
 * Hook to get theme-aware chart colors
 */
function useChartColors() {
  const info = useCSSVariable('--color-info', '#3B82F6');
  const primary = useCSSVariable('--color-primary', '#8B5CF6');
  const success = useCSSVariable('--color-success', '#10B981');

  return { info, primary, success };
}

/**
 * Simple SVG Bar Chart Component
 * CSS-only chart without heavy dependencies
 */
interface SimpleBarChartProps {
  data: UsageDataPoint[];
  height?: number;
  barColor?: string;
  showLabels?: boolean;
}

function SimpleBarChart({
  data,
  height = 120,
  barColor,
  showLabels = true,
}: SimpleBarChartProps) {
  const chartColors = useChartColors();
  const resolvedColor = barColor || chartColors.info;

  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.value), 1),
    [data]
  );

  // Take last 14 data points for cleaner display
  const displayData = data.slice(-14);

  const barWidth = 100 / displayData.length;
  const barPadding = barWidth * 0.15;

  return (
    <div className="w-full">
      {/* Chart area */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={height - ratio * (height - 20)}
            x2="100"
            y2={height - ratio * (height - 20)}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Bars */}
        {displayData.map((point, index) => {
          const barHeight = (point.value / maxValue) * (height - 20);
          const x = index * barWidth + barPadding;
          const y = height - barHeight;

          return (
            <g key={point.date}>
              <rect
                x={x}
                y={y}
                width={barWidth - barPadding * 2}
                height={barHeight}
                fill={resolvedColor}
                rx="1"
                className="transition-all duration-300 hover:opacity-80"
              >
                <title>
                  {point.date}: {point.value.toLocaleString()}
                </title>
              </rect>
            </g>
          );
        })}
      </svg>

      {/* X-axis labels */}
      {showLabels && (
        <div className="flex justify-between mt-2 px-1">
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {displayData[0]?.date
              ? new Date(displayData[0].date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : ''}
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {displayData[displayData.length - 1]?.date
              ? new Date(displayData[displayData.length - 1].date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : ''}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Sparkline Component
 * Mini inline chart for compact displays
 */
interface SparklineProps {
  data: UsageDataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

function Sparkline({
  data,
  width = 80,
  height = 24,
  color,
}: SparklineProps) {
  const chartColors = useChartColors();
  const resolvedColor = color || chartColors.info;

  const points = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const displayData = data.slice(-10);

    return displayData
      .map((point, index) => {
        const x = (index / (displayData.length - 1)) * width;
        const y = height - (point.value / maxValue) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={resolvedColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/**
 * UsageChart Loading Skeleton
 */
function UsageChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton width="100%" height={120} variant="rounded" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton width={80} height={12} variant="text" />
            <Skeleton width={60} height={20} variant="text" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * UsageChart Empty State
 */
function UsageChartEmpty() {
  return (
    <div className="py-12 text-center">
      <Icon
        name="BarChart3"
        size="lg"
        className="mx-auto text-[var(--color-muted-foreground)] mb-3"
        aria-hidden
      />
      <p className="text-sm font-medium text-[var(--color-foreground)]">
        Usage data coming soon
      </p>
      <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
        Check back later for usage analytics
      </p>
    </div>
  );
}

export interface UsageChartProps {
  data: UsageMetrics | null;
  isLoading?: boolean;
  metric?: 'apiCalls' | 'storage' | 'activeUsers';
}

/**
 * UsageChart Component
 * Simple bar chart showing usage over time with summary metrics
 */
export function UsageChart({
  data,
  isLoading = false,
  metric = 'apiCalls',
}: UsageChartProps) {
  const chartColors = useChartColors();

  const metricConfig = {
    apiCalls: {
      label: 'API Calls',
      summaryLabel: 'Total Calls',
      color: chartColors.info,
      formatValue: (v: number) => v.toLocaleString(),
    },
    storage: {
      label: 'Storage Usage',
      summaryLabel: 'Current Storage',
      color: chartColors.primary,
      formatValue: (v: number) => `${v.toFixed(1)} GB`,
    },
    activeUsers: {
      label: 'Active Users',
      summaryLabel: 'Avg. Daily Users',
      color: chartColors.success,
      formatValue: (v: number) => v.toString(),
    },
  };

  const config = metricConfig[metric];
  const chartData = data?.[metric] || [];
  const hasData = chartData.length > 0;

  // Calculate summary values
  const summaryValues = useMemo(() => {
    if (!data) return null;

    return {
      apiCalls: {
        value: data.summary.totalApiCalls,
        formatted: data.summary.totalApiCalls.toLocaleString(),
      },
      storage: {
        value: data.summary.totalStorage,
        formatted: `${data.summary.totalStorage.toFixed(1)} GB`,
      },
      activeUsers: {
        value: data.summary.averageActiveUsers,
        formatted: data.summary.averageActiveUsers.toString(),
      },
    };
  }, [data]);

  return (
    <Card variant="default" className="h-full">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">
            Usage Analytics
          </h3>
          {data?.period && (
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Last 30 days
            </span>
          )}
        </div>

        {isLoading ? (
          <UsageChartSkeleton />
        ) : !hasData ? (
          <UsageChartEmpty />
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            <SimpleBarChart
              data={chartData}
              height={120}
              barColor={config.color}
            />

            {/* Summary stats */}
            {summaryValues && (
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[var(--color-border)]">
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Total Calls
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold text-[var(--color-foreground)]">
                      {summaryValues.apiCalls.formatted}
                    </span>
                    {data?.apiCalls && (
                      <Sparkline
                        data={data.apiCalls}
                        color={chartColors.info}
                        width={40}
                        height={16}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Storage
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold text-[var(--color-foreground)]">
                      {summaryValues.storage.formatted}
                    </span>
                    {data?.storage && (
                      <Sparkline
                        data={data.storage}
                        color={chartColors.primary}
                        width={40}
                        height={16}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Avg. Users
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold text-[var(--color-foreground)]">
                      {summaryValues.activeUsers.formatted}
                    </span>
                    {data?.activeUsers && (
                      <Sparkline
                        data={data.activeUsers}
                        color={chartColors.success}
                        width={40}
                        height={16}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default UsageChart;
