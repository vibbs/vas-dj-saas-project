/**
 * Zod Validation Schemas for Organization Forms
 */

import { z } from 'zod';

/**
 * Invite user to organization validation schema
 */
export const InviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['owner', 'admin', 'member'], {
    message: 'Please select a valid role',
  }),
});

export type InviteUserData = z.infer<typeof InviteUserSchema>;

/**
 * Accept invite validation schema
 */
export const AcceptInviteSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
});

export type AcceptInviteData = z.infer<typeof AcceptInviteSchema>;

/**
 * Update organization validation schema
 */
export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').optional(),
  subdomain: z
    .string()
    .regex(
      /^[a-zA-Z0-9-]*$/,
      'Subdomain can only contain letters, numbers, and hyphens'
    )
    .optional(),
});

export type UpdateOrganizationData = z.infer<typeof UpdateOrganizationSchema>;
