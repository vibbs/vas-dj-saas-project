'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Settings Root Page
 * Redirects to profile settings (default)
 */
export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/profile');
  }, [router]);

  return null;
}
