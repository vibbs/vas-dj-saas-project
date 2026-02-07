/**
 * Organization Context Hook
 * Provides the current organization context for API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { OrganizationsService, type Organization } from '@vas-dj-saas/api-client';
import { useAuthStatus } from '@vas-dj-saas/auth';

interface UseOrganizationResult {
  organization: Organization | null;
  organizationId: string | null;
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
}

const STORAGE_KEY = 'current-organization-id';

export function useOrganization(): UseOrganizationResult {
  const authStatus = useAuthStatus();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await OrganizationsService.list();

      if (response.status === 200 && response.data) {
        // Handle paginated response - results array contains organizations
        const data = response.data as { results?: Organization[] } | Organization[];
        const orgList = Array.isArray(data) ? data : (data.results || []);

        setOrganizations(orgList);

        // Restore previously selected organization from storage
        const storedOrgId = localStorage.getItem(STORAGE_KEY);
        const storedOrg = storedOrgId ? orgList.find(o => o.id === storedOrgId) : null;

        // Use stored org, or fall back to first organization
        const selectedOrg = storedOrg || orgList[0] || null;
        setCurrentOrg(selectedOrg);

        // Persist the selection
        if (selectedOrg) {
          localStorage.setItem(STORAGE_KEY, selectedOrg.id);
        }
      } else {
        setError('Failed to fetch organizations');
      }
    } catch (err: any) {
      console.error('Failed to fetch organizations:', err);
      setError(err?.data?.detail || err?.message || 'Failed to fetch organizations');
    } finally {
      setIsLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const setCurrentOrganization = useCallback((org: Organization) => {
    setCurrentOrg(org);
    localStorage.setItem(STORAGE_KEY, org.id);
  }, []);

  return {
    organization: currentOrg,
    organizationId: currentOrg?.id || null,
    organizations,
    isLoading,
    error,
    refresh: fetchOrganizations,
    setCurrentOrganization,
  };
}

/**
 * Convenience hook to get just the organization ID
 * Throws if used before organization is loaded
 */
export function useOrganizationId(): string {
  const { organizationId, isLoading, error } = useOrganization();

  if (isLoading) {
    throw new Error('Organization not loaded yet');
  }

  if (error || !organizationId) {
    throw new Error(error || 'No organization available');
  }

  return organizationId;
}
