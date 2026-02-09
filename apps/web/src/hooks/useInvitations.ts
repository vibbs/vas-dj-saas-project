/**
 * Invitations Management Hook
 * Provides invitations data and mutation functions for organization invite management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  InvitesService,
  type Invite,
  type CreateInviteRequest,
} from '@vas-dj-saas/api-client';
import { useOrganization } from './useOrganization';

interface UseInvitationsResult {
  invitations: Invite[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createInvite: (data: CreateInviteRequest) => Promise<boolean>;
  resendInvite: (inviteId: string) => Promise<boolean>;
  revokeInvite: (inviteId: string) => Promise<boolean>;
}

export function useInvitations(): UseInvitationsResult {
  const { organizationId } = useOrganization();
  const [invitations, setInvitations] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await InvitesService.list(organizationId);

      // Check for successful response
      if (response.status >= 200 && response.status < 300 && response.data) {
        // Handle paginated response
        const data = response.data as { results?: Invite[] } | Invite[];
        const inviteList = Array.isArray(data) ? data : (data.results || []);
        setInvitations(inviteList);
      } else {
        setError('Failed to fetch invitations');
      }
    } catch (err: any) {
      console.error('Failed to fetch invitations:', err);
      setError(err?.data?.detail || err?.message || 'Failed to fetch invitations');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const createInvite = useCallback(async (data: CreateInviteRequest): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      const response = await InvitesService.create(organizationId, data);

      // Check for successful response (create typically returns 201)
      if (response.status >= 200 && response.status < 300) {
        // Refresh the list to get the new invite
        await fetchInvitations();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to create invite:', err);
      setError(err?.data?.detail || err?.message || 'Failed to create invite');
      return false;
    }
  }, [organizationId, fetchInvitations]);

  const resendInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      // Get the current invite to pass its data to the resend endpoint
      const invite = invitations.find(i => i.id === inviteId);
      if (!invite) return false;

      // Calculate new expiry date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const response = await InvitesService.resend(organizationId, inviteId, {
        organization: invite.organization,
        email: invite.email,
        role: invite.role,
        invitedBy: invite.invitedBy,
        expiresAt: expiresAt.toISOString(),
        message: invite.message,
      });

      // Check for successful response (resend typically returns 200 or 201)
      if (response.status >= 200 && response.status < 300) {
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to resend invite:', err);
      setError(err?.data?.detail || err?.message || 'Failed to resend invite');
      return false;
    }
  }, [organizationId, invitations]);

  const revokeInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      const response = await InvitesService.delete(organizationId, inviteId);

      // Check for successful response (delete typically returns 204)
      if (response.status >= 200 && response.status < 300) {
        // Remove from local state
        setInvitations(prev => prev.filter(i => i.id !== inviteId));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to revoke invite:', err);
      setError(err?.data?.detail || err?.message || 'Failed to revoke invite');
      return false;
    }
  }, [organizationId]);

  return {
    invitations,
    isLoading,
    error,
    refresh: fetchInvitations,
    createInvite,
    resendInvite,
    revokeInvite,
  };
}
