'use client';

import React from 'react';
import { Card, Heading, Text, Progress, Spinner } from '@vas-dj-saas/ui';
// Import types - these will work after api-client package is rebuilt
// For now, we define local types that match the service types
interface ApiKeyUsage {
  keyId: string;
  totalCalls: number;
  callsThisMonth: number;
  callsToday: number;
  rateLimitRemaining: number;
  rateLimitTotal: number;
  dailyUsage: { date: string; calls: number }[];
  topEndpoints: { endpoint: string; method: string; calls: number }[];
}

interface ApiKeyUsageStatsProps {
  usage: ApiKeyUsage | null;
  isLoading?: boolean;
  title?: string;
  showChart?: boolean;
}

export function ApiKeyUsageStats({
  usage,
  isLoading = false,
  title = 'API Usage Overview',
  showChart = true,
}: ApiKeyUsageStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Text color="muted">No usage data available</Text>
        </div>
      </Card>
    );
  }

  const rateLimitPercentage = Math.round(
    ((usage.rateLimitTotal - usage.rateLimitRemaining) / usage.rateLimitTotal) * 100
  );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Calculate max calls for chart scaling
  const maxDailyCall = Math.max(...usage.dailyUsage.map(d => d.calls), 1);

  return (
    <Card>
      <div style={{ padding: '20px' }}>
        <Heading level={4} style={{ margin: 0, marginBottom: '20px' }}>
          {title}
        </Heading>

        {/* Stat cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-muted, #f4f4f5)',
              borderRadius: '8px',
            }}
          >
            <Text color="muted" size="sm" style={{ margin: 0, marginBottom: '4px' }}>
              Total Calls
            </Text>
            <Text style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {formatNumber(usage.totalCalls)}
            </Text>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-muted, #f4f4f5)',
              borderRadius: '8px',
            }}
          >
            <Text color="muted" size="sm" style={{ margin: 0, marginBottom: '4px' }}>
              This Month
            </Text>
            <Text style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {formatNumber(usage.callsThisMonth)}
            </Text>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-muted, #f4f4f5)',
              borderRadius: '8px',
            }}
          >
            <Text color="muted" size="sm" style={{ margin: 0, marginBottom: '4px' }}>
              Today
            </Text>
            <Text style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {formatNumber(usage.callsToday)}
            </Text>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-muted, #f4f4f5)',
              borderRadius: '8px',
            }}
          >
            <Text color="muted" size="sm" style={{ margin: 0, marginBottom: '4px' }}>
              Rate Limit
            </Text>
            <Text style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
              {formatNumber(usage.rateLimitRemaining)}
            </Text>
            <Text color="muted" size="xs" style={{ margin: 0 }}>
              of {formatNumber(usage.rateLimitTotal)} remaining
            </Text>
          </div>
        </div>

        {/* Rate limit progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text size="sm" style={{ margin: 0, fontWeight: 500 }}>
              Rate Limit Usage
            </Text>
            <Text size="sm" color="muted" style={{ margin: 0 }}>
              {rateLimitPercentage}%
            </Text>
          </div>
          <Progress
            value={rateLimitPercentage}
            color={rateLimitPercentage > 80 ? 'warning' : 'primary'}
          />
        </div>

        {/* Simple bar chart for daily usage */}
        {showChart && usage.dailyUsage.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <Text size="sm" style={{ margin: 0, marginBottom: '12px', fontWeight: 500 }}>
              Daily API Calls (Last 30 Days)
            </Text>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                height: '80px',
                gap: '2px',
                padding: '8px',
                backgroundColor: 'var(--color-muted, #f4f4f5)',
                borderRadius: '8px',
              }}
            >
              {usage.dailyUsage.map((day, index) => {
                const height = Math.max((day.calls / maxDailyCall) * 100, 2);
                return (
                  <div
                    key={day.date}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      backgroundColor: 'var(--color-primary, #0070f3)',
                      borderRadius: '2px',
                      minWidth: '4px',
                      opacity: index === usage.dailyUsage.length - 1 ? 1 : 0.7,
                    }}
                    title={`${day.date}: ${day.calls.toLocaleString()} calls`}
                  />
                );
              })}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
              }}
            >
              <Text size="xs" color="muted" style={{ margin: 0 }}>
                {usage.dailyUsage[0]?.date}
              </Text>
              <Text size="xs" color="muted" style={{ margin: 0 }}>
                {usage.dailyUsage[usage.dailyUsage.length - 1]?.date}
              </Text>
            </div>
          </div>
        )}

        {/* Top endpoints */}
        {usage.topEndpoints.length > 0 && (
          <div>
            <Text size="sm" style={{ margin: 0, marginBottom: '12px', fontWeight: 500 }}>
              Top Endpoints
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {usage.topEndpoints.slice(0, 5).map((endpoint, index) => (
                <div
                  key={`${endpoint.method}-${endpoint.endpoint}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-muted, #f4f4f5)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        backgroundColor:
                          endpoint.method === 'GET'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : endpoint.method === 'POST'
                            ? 'rgba(59, 130, 246, 0.2)'
                            : endpoint.method === 'PUT'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color:
                          endpoint.method === 'GET'
                            ? '#16a34a'
                            : endpoint.method === 'POST'
                            ? '#2563eb'
                            : endpoint.method === 'PUT'
                            ? '#d97706'
                            : '#dc2626',
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <code style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                      {endpoint.endpoint}
                    </code>
                  </div>
                  <Text size="sm" style={{ margin: 0, fontWeight: 500 }}>
                    {formatNumber(endpoint.calls)}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
