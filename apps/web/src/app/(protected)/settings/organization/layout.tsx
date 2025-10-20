'use client';

import React from 'react';
import { useRoleGuard } from '@/hooks/useRoleGuard';

/**
 * Organization Settings Layout
 * Requires org admin access for all child pages
 */
export default function OrganizationSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasAccess } = useRoleGuard('orgAdmin', '/settings/profile');

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
