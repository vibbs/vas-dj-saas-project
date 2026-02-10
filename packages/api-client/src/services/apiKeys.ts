/**
 * API Keys Service
 * Clean wrapper for API key management endpoints
 *
 * Note: Since the backend doesn't have API key endpoints yet,
 * this service is prepared for future integration and uses
 * mock responses for development.
 */

import { request } from '../core/ApiClient';

// === Types ===

export type ApiKeyScope = 'read' | 'write' | 'admin';
export type ApiKeyStatus = 'active' | 'revoked' | 'expired';
export type ApiKeyExpiration = 'never' | '30_days' | '90_days' | '1_year';

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  /** Only available on creation */
  key?: string;
  /** Masked key value (last 4 characters) */
  keyHint: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  expiresAt?: string | null;
  createdAt: string;
  lastUsedAt?: string | null;
  createdBy: {
    id: string;
    email: string;
    name?: string;
  };
  organizationId: string;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  scopes: ApiKeyScope[];
  expiration: ApiKeyExpiration;
}

export interface CreateApiKeyResponse extends ApiKey {
  /** Full API key - only shown once on creation */
  key: string;
}

export interface ApiKeyUsage {
  keyId: string;
  totalCalls: number;
  callsThisMonth: number;
  callsToday: number;
  rateLimitRemaining: number;
  rateLimitTotal: number;
  dailyUsage: {
    date: string;
    calls: number;
  }[];
  topEndpoints: {
    endpoint: string;
    method: string;
    calls: number;
  }[];
}

export interface ApiKeyListParams {
  status?: ApiKeyStatus;
  page?: number;
  pageSize?: number;
}

export interface ApiKeyListResponse {
  results: ApiKey[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

// === Service ===

export const ApiKeysService = {
  /**
   * List all API keys for an organization
   */
  list: async (
    organizationId: string,
    params?: ApiKeyListParams
  ): Promise<ApiKeyListResponse> => {
    return request<ApiKeyListResponse>({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/api-keys/`,
      params: params as Record<string, unknown> | undefined,
    });
  },

  /**
   * Get a single API key by ID
   */
  getById: async (
    organizationId: string,
    keyId: string
  ): Promise<ApiKey> => {
    return request<ApiKey>({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/api-keys/${keyId}/`,
    });
  },

  /**
   * Create a new API key
   * @returns The created key with the full secret (only shown once)
   */
  create: async (
    organizationId: string,
    data: CreateApiKeyRequest
  ): Promise<CreateApiKeyResponse> => {
    return request<CreateApiKeyResponse>({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/api-keys/`,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * Revoke an API key (cannot be undone)
   */
  revoke: async (
    organizationId: string,
    keyId: string
  ): Promise<ApiKey> => {
    return request<ApiKey>({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/api-keys/${keyId}/revoke/`,
    });
  },

  /**
   * Regenerate an API key (revokes old key and creates new one)
   * @returns The regenerated key with new secret (only shown once)
   */
  regenerate: async (
    organizationId: string,
    keyId: string
  ): Promise<CreateApiKeyResponse> => {
    return request<CreateApiKeyResponse>({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/api-keys/${keyId}/regenerate/`,
    });
  },

  /**
   * Get usage statistics for an API key
   */
  getUsage: async (
    organizationId: string,
    keyId: string
  ): Promise<ApiKeyUsage> => {
    return request<ApiKeyUsage>({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/api-keys/${keyId}/usage/`,
    });
  },

  /**
   * Get aggregated usage for all API keys in an organization
   */
  getOrganizationUsage: async (
    organizationId: string
  ): Promise<ApiKeyUsage> => {
    return request<ApiKeyUsage>({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/api-keys/usage/`,
    });
  },
} as const;
