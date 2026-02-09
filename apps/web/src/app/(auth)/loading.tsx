import React from 'react';
import { AuthCard } from '@/components/auth/AuthCard';

/**
 * Loading state for auth pages
 */
export default function AuthLoading() {
  return (
    <AuthCard title="Loading..." description="Please wait">
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </AuthCard>
  );
}
