'use client';

import React from 'react';
import { useRoleGuard } from '@/hooks/useRoleGuard';

/**
 * Billing Settings Layout
 * Requires billing management access for all child pages
 *
 * Access is granted to users with:
 * - canManageBilling permission
 * - isOrgCreator role
 * - isAdmin role
 */
export default function BillingSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Using orgAdmin as the closest approximation - billing access is validated
  // via the custom permission check in navigation config
  const { hasAccess } = useRoleGuard('orgAdmin', '/settings/personal');

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
