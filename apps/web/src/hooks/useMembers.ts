/**
 * Members Management Hook
 * Provides members data and mutation functions for organization member management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MembersService,
  type OrganizationMembership,
  type OrganizationMembershipRole,
  type OrganizationMembershipStatus,
} from '@vas-dj-saas/api-client';
import { useOrganization } from './useOrganization';

interface UseMembersResult {
  members: OrganizationMembership[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateRole: (memberId: string, role: OrganizationMembershipRole) => Promise<boolean>;
  updateStatus: (memberId: string, status: OrganizationMembershipStatus) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
}

export function useMembers(): UseMembersResult {
  const { organizationId } = useOrganization();
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await MembersService.list(organizationId);

      // Check for successful response
      if (response.status >= 200 && response.status < 300 && response.data) {
        // Handle paginated response
        const data = response.data as { results?: OrganizationMembership[] } | OrganizationMembership[];
        const memberList = Array.isArray(data) ? data : (data.results || []);
        setMembers(memberList);
      } else {
        setError('Failed to fetch members');
      }
    } catch (err: any) {
      console.error('Failed to fetch members:', err);
      setError(err?.data?.detail || err?.message || 'Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateRole = useCallback(async (memberId: string, role: OrganizationMembershipRole): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      const response = await MembersService.update(organizationId, memberId, { role });

      // Check for successful response
      if (response.status >= 200 && response.status < 300) {
        // Update local state
        setMembers(prev => prev.map(m =>
          m.id === memberId ? { ...m, role } : m
        ));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to update member role:', err);
      setError(err?.data?.detail || err?.message || 'Failed to update role');
      return false;
    }
  }, [organizationId]);

  const updateStatus = useCallback(async (memberId: string, status: OrganizationMembershipStatus): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      const response = await MembersService.update(organizationId, memberId, { status });

      // Check for successful response
      if (response.status >= 200 && response.status < 300) {
        // Update local state
        setMembers(prev => prev.map(m =>
          m.id === memberId ? { ...m, status } : m
        ));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to update member status:', err);
      setError(err?.data?.detail || err?.message || 'Failed to update status');
      return false;
    }
  }, [organizationId]);

  const removeMember = useCallback(async (memberId: string): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      const response = await MembersService.remove(organizationId, memberId);

      // Check for successful response (delete typically returns 204)
      if (response.status >= 200 && response.status < 300) {
        // Remove from local state
        setMembers(prev => prev.filter(m => m.id !== memberId));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      setError(err?.data?.detail || err?.message || 'Failed to remove member');
      return false;
    }
  }, [organizationId]);

  return {
    members,
    isLoading,
    error,
    refresh: fetchMembers,
    updateRole,
    updateStatus,
    removeMember,
  };
}
