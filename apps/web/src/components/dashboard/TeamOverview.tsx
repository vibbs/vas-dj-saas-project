'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Avatar, Badge, Icon, Skeleton } from '@vas-dj-saas/ui';
import type { TeamOverview as TeamOverviewData, RoleBreakdown, RecentMember } from '@vas-dj-saas/api-client';

/**
 * RoleBar Component
 * Visual breakdown of roles
 */
function RoleBar({ roles }: { roles: RoleBreakdown[] }) {
  const colors: Record<string, React.CSSProperties> = {
    Admin: { backgroundColor: 'var(--color-accent)' },
    Member: { backgroundColor: 'var(--color-primary)' },
    Viewer: { backgroundColor: 'var(--color-muted-foreground)' },
  };

  const defaultColor: React.CSSProperties = { backgroundColor: 'var(--color-muted-foreground)' };

  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div
        className="h-2 w-full rounded-full overflow-hidden flex"
        style={{ backgroundColor: 'var(--color-muted)' }}
      >
        {roles.map((role) => (
          <div
            key={role.role}
            className="transition-all duration-300"
            style={{
              width: `${role.percentage}%`,
              ...(colors[role.role] || defaultColor)
            }}
            title={`${role.role}: ${role.count} (${role.percentage}%)`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {roles.map((role) => (
          <div key={role.role} className="flex items-center space-x-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={colors[role.role] || defaultColor}
            />
            <span
              className="text-xs"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {role.role}:{' '}
              <span
                className="font-medium"
                style={{ color: 'var(--color-foreground)' }}
              >
                {role.count}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * TeamOverview Loading Skeleton
 */
function TeamOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width={100} height={12} variant="text" />
          <Skeleton width={60} height={28} variant="text" />
        </div>
        <Skeleton width={80} height={24} variant="rounded" />
      </div>

      {/* Role bar */}
      <div className="space-y-2">
        <Skeleton width="100%" height={8} variant="rounded" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width={60} height={12} variant="text" />
          ))}
        </div>
      </div>

      {/* Recent members */}
      <div className="space-y-2">
        <Skeleton width={120} height={12} variant="text" />
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={32} height={32} variant="circular" />
          ))}
        </div>
      </div>
    </div>
  );
}

export interface TeamOverviewProps {
  data: TeamOverviewData | null;
  isLoading?: boolean;
  teamHref?: string;
}

/**
 * TeamOverview Component
 * Shows member count, role breakdown, recent members, and pending invites
 */
export function TeamOverview({
  data,
  isLoading = false,
  teamHref = '/settings/organization?tab=members',
}: TeamOverviewProps) {
  return (
    <Card variant="default" className="h-full">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-semibold"
            style={{ color: 'var(--color-foreground)' }}
          >
            Team Overview
          </h3>
          <Link
            href={teamHref}
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            Manage team
          </Link>
        </div>

        {isLoading ? (
          <TeamOverviewSkeleton />
        ) : !data ? (
          <div className="py-8 text-center">
            <Icon
              name="Users"
              size="lg"
              className="mx-auto mb-2"
              style={{ color: 'var(--color-muted-foreground)' }}
              aria-hidden
            />
            <p
              className="text-sm"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              No team data available
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Total members and pending invites */}
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  Total Members
                </p>
                <p
                  className="text-3xl font-bold mt-1"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {data.totalMembers}
                </p>
              </div>
              {data.pendingInvitations > 0 && (
                <Badge variant="secondary" size="sm">
                  {data.pendingInvitations} pending
                </Badge>
              )}
            </div>

            {/* Role breakdown */}
            {data.roleBreakdown.length > 0 && (
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wide mb-2"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  By Role
                </p>
                <RoleBar roles={data.roleBreakdown} />
              </div>
            )}

            {/* Recent members */}
            {data.recentMembers.length > 0 && (
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wide mb-2"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  Recently Joined
                </p>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {data.recentMembers.slice(0, 5).map((member: RecentMember) => (
                      <Avatar
                        key={member.id}
                        name={member.name}
                        src={member.avatar}
                        size="sm"
                        className="ring-2"
                        style={{ ['--tw-ring-color' as string]: 'var(--color-card)' }}
                        title={member.name}
                      />
                    ))}
                  </div>
                  {data.recentMembers.length > 5 && (
                    <span
                      className="ml-2 text-xs"
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      +{data.recentMembers.length - 5} more
                    </span>
                  )}
                </div>
                {/* Recent member names */}
                <p
                  className="mt-2 text-xs"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {data.recentMembers
                    .slice(0, 3)
                    .map((m: RecentMember) => m.name.split(' ')[0])
                    .join(', ')}
                  {data.recentMembers.length > 3 && ' and others'}
                </p>
              </div>
            )}

            {/* Invite CTA */}
            <Link
              href="/settings/organization?tab=members"
              className="flex items-center justify-center w-full py-2.5 px-4 border-2 border-dashed rounded-lg text-sm font-medium transition-colors group hover:opacity-80"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted-foreground)'
              }}
            >
              <Icon
                name="UserPlus"
                size="sm"
                className="mr-2 group-hover:scale-110 transition-transform"
                aria-hidden
              />
              Invite Team Member
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

export default TeamOverview;
