/**
 * MembersService
 * High-level service for organization member management
 */

import {
  v1OrganizationsMembersList,
  v1OrganizationsMembersRetrieve,
  v1OrganizationsMembersPartialUpdate,
  v1OrganizationsMembersDestroy,
  type v1OrganizationsMembersListResponse,
  type v1OrganizationsMembersRetrieveResponse,
  type v1OrganizationsMembersPartialUpdateResponse,
  type v1OrganizationsMembersDestroyResponse,
} from '../generated/memberships/memberships';
import type {
  PatchedMembershipUpdateRequest,
  V1OrganizationsMembersListParams,
} from '../generated/api.schemas';

export const MembersService = {
  /**
   * List all members of an organization
   */
  list: (
    organizationPk: string,
    params?: V1OrganizationsMembersListParams
  ): Promise<v1OrganizationsMembersListResponse> => {
    return v1OrganizationsMembersList(organizationPk, params);
  },

  /**
   * Retrieve a specific member
   */
  retrieve: (
    organizationPk: string,
    id: string
  ): Promise<v1OrganizationsMembersRetrieveResponse> => {
    return v1OrganizationsMembersRetrieve(organizationPk, id);
  },

  /**
   * Update member role or status
   */
  update: (
    organizationPk: string,
    id: string,
    data: PatchedMembershipUpdateRequest
  ): Promise<v1OrganizationsMembersPartialUpdateResponse> => {
    return v1OrganizationsMembersPartialUpdate(organizationPk, id, data);
  },

  /**
   * Remove a member from the organization
   */
  remove: (
    organizationPk: string,
    id: string
  ): Promise<v1OrganizationsMembersDestroyResponse> => {
    return v1OrganizationsMembersDestroy(organizationPk, id);
  },
} as const;
