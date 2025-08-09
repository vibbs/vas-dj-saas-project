'use client';

import { useAuth } from '@vas-dj-saas/auth';
import { ReactNode, useEffect } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const hydrate = useAuth((state) => state.hydrate);

  useEffect(() => {
    // Hydrate auth state on app startup
    void hydrate();
  }, [hydrate]);

  return <>{children}</>;
}