'use client';

import React from 'react';
import { useRoleGuard } from '@/hooks/useRoleGuard';

/**
 * Developer Settings Layout
 * Requires org admin access for all child pages
 */
export default function DeveloperSettingsLayout({
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
