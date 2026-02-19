/**
 * API Keys Management Hook
 * Provides API keys data and mutation functions for organization API key management
 */

import { useState, useEffect, useCallback } from 'react';
// Import types - these will work after api-client package is rebuilt
// For now, we define local types that match the service types
type ApiKeyScope = 'read' | 'write' | 'admin';
type ApiKeyStatus = 'active' | 'revoked' | 'expired';
type ApiKeyExpiration = 'never' | '30_days' | '90_days' | '1_year';

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key?: string;
  keyHint: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  expiresAt?: string | null;
  createdAt: string;
  lastUsedAt?: string | null;
  createdBy: { id: string; email: string; name?: string };
  organizationId: string;
}

interface CreateApiKeyResponse extends ApiKey {
  key: string;
}

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

// Use real API service from api-client package
import { ApiKeysService as RealApiKeysService } from '@vas-dj-saas/api-client';
const ApiKeysService = RealApiKeysService;
import { useOrganization } from './useOrganization';
import {
  mockApiKeys,
  generateMockUsage,
  mockOrganizationUsage,
  generateMockApiKey,
  getExpirationDate,
} from '@/test/mockApiKeys';

// Flag to use mock data during development
const USE_MOCK_DATA = false; // Backend API keys app is now available

interface UseApiKeysResult {
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createApiKey: (
    name: string,
    description: string | undefined,
    scopes: ApiKeyScope[],
    expiration: ApiKeyExpiration
  ) => Promise<CreateApiKeyResponse | null>;
  revokeApiKey: (keyId: string) => Promise<boolean>;
  regenerateApiKey: (keyId: string) => Promise<CreateApiKeyResponse | null>;
  getKeyUsage: (keyId: string) => Promise<ApiKeyUsage | null>;
  organizationUsage: ApiKeyUsage | null;
  isLoadingUsage: boolean;
}

export function useApiKeys(): UseApiKeysResult {
  const { organizationId } = useOrganization();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationUsage, setOrganizationUsage] = useState<ApiKeyUsage | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setApiKeys(mockApiKeys);
        setOrganizationUsage(mockOrganizationUsage);
      } else {
        const response = await ApiKeysService.list(organizationId);

        if (response.status >= 200 && response.status < 300 && response.data) {
          setApiKeys(response.data.results || []);
        } else {
          setError('Failed to fetch API keys');
        }

        // Fetch organization-wide usage
        try {
          const usageResponse = await ApiKeysService.getOrganizationUsage(organizationId);
          if (usageResponse.status >= 200 && usageResponse.status < 300) {
            setOrganizationUsage(usageResponse.data);
          }
        } catch (err) {
          console.warn('Failed to fetch organization usage:', err);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch API keys:', err);
      setError(err?.data?.detail || err?.message || 'Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const createApiKey = useCallback(async (
    name: string,
    description: string | undefined,
    scopes: ApiKeyScope[],
    expiration: ApiKeyExpiration
  ): Promise<CreateApiKeyResponse | null> => {
    if (!organizationId) return null;

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const expiresAt = getExpirationDate(expiration);
        const newKey = generateMockApiKey(name, description, scopes, expiresAt);

        // Add to local state (without the full key for security)
        const keyForList: ApiKey = {
          ...newKey,
          key: undefined,
        };
        setApiKeys(prev => [keyForList, ...prev]);

        return newKey;
      }

      const response = await ApiKeysService.create(organizationId, {
        name,
        description,
        scopes,
        expiration,
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        // Add to local state (the list version won't have the full key)
        const keyForList: ApiKey = {
          ...response.data,
          key: undefined,
        };
        setApiKeys(prev => [keyForList, ...prev]);
        return response.data;
      }

      setError('Failed to create API key');
      return null;
    } catch (err: any) {
      console.error('Failed to create API key:', err);
      setError(err?.data?.detail || err?.message || 'Failed to create API key');
      return null;
    }
  }, [organizationId]);

  const revokeApiKey = useCallback(async (keyId: string): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setApiKeys(prev =>
          prev.map(key =>
            key.id === keyId ? { ...key, status: 'revoked' as const } : key
          )
        );
        return true;
      }

      const response = await ApiKeysService.revoke(organizationId, keyId);

      if (response.status >= 200 && response.status < 300) {
        setApiKeys(prev =>
          prev.map(key =>
            key.id === keyId ? { ...key, status: 'revoked' as const } : key
          )
        );
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Failed to revoke API key:', err);
      setError(err?.data?.detail || err?.message || 'Failed to revoke API key');
      return false;
    }
  }, [organizationId]);

  const regenerateApiKey = useCallback(async (keyId: string): Promise<CreateApiKeyResponse | null> => {
    if (!organizationId) return null;

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const existingKey = apiKeys.find(k => k.id === keyId);
        if (!existingKey) return null;

        const newKey = generateMockApiKey(
          existingKey.name,
          existingKey.description,
          existingKey.scopes,
          existingKey.expiresAt || null
        );

        // Update in local state
        setApiKeys(prev =>
          prev.map(key =>
            key.id === keyId
              ? { ...newKey, key: undefined, id: keyId }
              : key
          )
        );

        return { ...newKey, id: keyId };
      }

      const response = await ApiKeysService.regenerate(organizationId, keyId);

      if (response.status >= 200 && response.status < 300 && response.data) {
        // Update in local state (without the full key)
        setApiKeys(prev =>
          prev.map(key =>
            key.id === keyId ? { ...response.data, key: undefined } : key
          )
        );
        return response.data;
      }

      setError('Failed to regenerate API key');
      return null;
    } catch (err: any) {
      console.error('Failed to regenerate API key:', err);
      setError(err?.data?.detail || err?.message || 'Failed to regenerate API key');
      return null;
    }
  }, [organizationId, apiKeys]);

  const getKeyUsage = useCallback(async (keyId: string): Promise<ApiKeyUsage | null> => {
    if (!organizationId) return null;

    setIsLoadingUsage(true);

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsLoadingUsage(false);
        return generateMockUsage(keyId);
      }

      const response = await ApiKeysService.getUsage(organizationId, keyId);

      if (response.status >= 200 && response.status < 300) {
        setIsLoadingUsage(false);
        return response.data;
      }

      setIsLoadingUsage(false);
      return null;
    } catch (err: any) {
      console.error('Failed to fetch API key usage:', err);
      setIsLoadingUsage(false);
      return null;
    }
  }, [organizationId]);

  return {
    apiKeys,
    isLoading,
    error,
    refresh: fetchApiKeys,
    createApiKey,
    revokeApiKey,
    regenerateApiKey,
    getKeyUsage,
    organizationUsage,
    isLoadingUsage,
  };
}
