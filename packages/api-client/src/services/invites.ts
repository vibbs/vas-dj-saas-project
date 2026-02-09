/**
 * InvitesService
 * High-level service for organization invite management
 */

import {
  v1OrganizationsInvitesList,
  v1OrganizationsInvitesCreate,
  v1OrganizationsInvitesRetrieve,
  v1OrganizationsInvitesResendCreate,
  v1OrganizationsInvitesDestroy,
  v1OrganizationsInvitesAcceptCreate,
  v1OrganizationsInvitesAcceptInviteCreate,
  type v1OrganizationsInvitesListResponse,
  type v1OrganizationsInvitesCreateResponse,
  type v1OrganizationsInvitesRetrieveResponse,
  type v1OrganizationsInvitesResendCreateResponse,
  type v1OrganizationsInvitesDestroyResponse,
  type v1OrganizationsInvitesAcceptCreateResponse,
  type v1OrganizationsInvitesAcceptInviteCreateResponse,
} from '../generated/invites/invites';
import type { CreateInviteRequest, AcceptInviteRequest, InviteRequest, V1OrganizationsInvitesListParams } from '../generated/api.schemas';

export const InvitesService = {
  /**
   * List all invites for an organization
   */
  list: (
    organizationPk: string,
    params?: V1OrganizationsInvitesListParams
  ): Promise<v1OrganizationsInvitesListResponse> => {
    return v1OrganizationsInvitesList(organizationPk, params);
  },

  /**
   * Create a new invite
   */
  create: (
    organizationPk: string,
    data: CreateInviteRequest
  ): Promise<v1OrganizationsInvitesCreateResponse> => {
    return v1OrganizationsInvitesCreate(organizationPk, data);
  },

  /**
   * Retrieve a specific invite
   */
  retrieve: (
    organizationPk: string,
    id: string
  ): Promise<v1OrganizationsInvitesRetrieveResponse> => {
    return v1OrganizationsInvitesRetrieve(organizationPk, id);
  },

  /**
   * Resend an invite email
   */
  resend: (
    organizationPk: string,
    id: string,
    data: InviteRequest
  ): Promise<v1OrganizationsInvitesResendCreateResponse> => {
    return v1OrganizationsInvitesResendCreate(organizationPk, id, data);
  },

  /**
   * Delete/cancel an invite
   */
  delete: (
    organizationPk: string,
    id: string
  ): Promise<v1OrganizationsInvitesDestroyResponse> => {
    return v1OrganizationsInvitesDestroy(organizationPk, id);
  },

  /**
   * Accept an invite using a token (unauthenticated)
   * This endpoint doesn't require organizationPk
   */
  accept: (data: AcceptInviteRequest): Promise<v1OrganizationsInvitesAcceptCreateResponse> => {
    return v1OrganizationsInvitesAcceptCreate(data);
  },

  /**
   * Accept an invite using a token (authenticated)
   * Requires organizationPk for authenticated users
   */
  acceptAuthenticated: (
    organizationPk: string,
    data: AcceptInviteRequest
  ): Promise<v1OrganizationsInvitesAcceptInviteCreateResponse> => {
    return v1OrganizationsInvitesAcceptInviteCreate(organizationPk, data);
  },
} as const;
