/**
 * Users Service
 * Clean wrapper over generated accounts/users endpoints
 */

import {
  v1AccountsUsersList,
  v1AccountsUsersCreate,
  v1AccountsUsersRetrieve,
  v1AccountsUsersUpdate,
  v1AccountsUsersPartialUpdate,
  v1AccountsUsersDestroy,
  v1AccountsUsersMeRetrieve,
  v1AccountsUsersUpdateProfilePartialUpdate,
} from '../generated/accounts/accounts';

import type {
  AccountCreateRequest,
  AccountRequest,
  PatchedAccountRequest,
  V1AccountsUsersListParams,
} from '../generated/api.schemas';

export const UsersService = {
  /**
   * List all users in organization (paginated)
   */
  list: (params?: V1AccountsUsersListParams) => v1AccountsUsersList(params),

  /**
   * Create a new user
   */
  create: (data: AccountCreateRequest) => v1AccountsUsersCreate(data),

  /**
   * Get user by ID
   */
  getById: (id: string) => v1AccountsUsersRetrieve(id),

  /**
   * Update user (full update)
   */
  update: (id: string, data: AccountRequest) => v1AccountsUsersUpdate(id, data),

  /**
   * Partially update user
   */
  patch: (id: string, data: PatchedAccountRequest) =>
    v1AccountsUsersPartialUpdate(id, data),

  /**
   * Delete user
   */
  delete: (id: string) => v1AccountsUsersDestroy(id),

  /**
   * Get current authenticated user
   */
  me: () => v1AccountsUsersMeRetrieve(),

  /**
   * Update current user's profile
   */
  updateProfile: (data: PatchedAccountRequest) =>
    v1AccountsUsersUpdateProfilePartialUpdate(data),
} as const;
