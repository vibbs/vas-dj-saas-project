/**
 * Organizations Service
 * Clean wrapper over generated organizations endpoints
 */

import {
  v1OrganizationsList,
  v1OrganizationsCreate,
  v1OrganizationsRetrieve,
  v1OrganizationsUpdate,
  v1OrganizationsPartialUpdate,
  v1OrganizationsDestroy,
} from '../generated/organizations/organizations';

import type {
  OrganizationRequest,
  PatchedOrganizationRequest,
  V1OrganizationsListParams,
} from '../generated/api.schemas';

export const OrganizationsService = {
  /**
   * List all organizations (paginated)
   */
  list: (params?: V1OrganizationsListParams) => v1OrganizationsList(params),

  /**
   * Create a new organization
   */
  create: (data: OrganizationRequest) => v1OrganizationsCreate(data),

  /**
   * Get organization by ID
   */
  getById: (id: string) => v1OrganizationsRetrieve(id),

  /**
   * Update organization (full update)
   */
  update: (id: string, data: OrganizationRequest) =>
    v1OrganizationsUpdate(id, data),

  /**
   * Partially update organization
   */
  patch: (id: string, data: PatchedOrganizationRequest) =>
    v1OrganizationsPartialUpdate(id, data),

  /**
   * Delete organization
   */
  delete: (id: string) => v1OrganizationsDestroy(id),
} as const;
