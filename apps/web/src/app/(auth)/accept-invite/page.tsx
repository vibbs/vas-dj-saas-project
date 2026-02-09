'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { InvitesService } from '@vas-dj-saas/api-client';
import { useAuthStatus, useAuthAccount } from '@vas-dj-saas/auth';

/**
 * Accept Invite Page
 * Allows users to accept organization invitations
 */
export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const account = useAuthAccount();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<any>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link. No token provided.');
      return;
    }

    // TODO: Fetch invite information from API
    // For now, we'll show a placeholder
    setInviteInfo({
      organizationName: 'Example Organization',
      inviterName: 'John Doe',
      role: 'member',
    });
  }, [token]);

  const handleAccept = async () => {
    if (!token) {
      setError('Invalid invite token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call accept invite API (unauthenticated endpoint)
      const response = await InvitesService.accept({ token });

      if (response.status === 200) {
        // Check if user is authenticated
        if (authStatus === 'authenticated' && account) {
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          // Redirect to login with success message
          router.push('/login?inviteAccepted=true');
        }
      } else {
        throw new Error('Failed to accept invite');
      }
    } catch (err: any) {
      console.error('Accept invite error:', err);

      const errorMessage =
        err?.data?.detail ||
        err?.message ||
        'Failed to accept invite. Please try again.';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    // Redirect to home or login
    router.push('/');
  };

  if (!token) {
    return (
      <AuthCard title="Invalid Invite">
        <div className="text-center py-8">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            This invite link is invalid or has expired.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Organization Invite"
      description="You've been invited to join an organization"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {inviteInfo ? (
        <div className="space-y-6">
          {/* Invite Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organization</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {inviteInfo.organizationName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Invited by</p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {inviteInfo.inviterName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
              <p className="text-base text-gray-900 dark:text-gray-100 capitalize">
                {inviteInfo.role}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Accepting...' : 'Accept Invite'}
            </button>
            <button
              onClick={handleDecline}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Decline
            </button>
          </div>

          {/* Login Prompt for Unauthenticated Users */}
          {authStatus === 'unauthenticated' && (
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                After accepting, you'll be prompted to sign in or create an account.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </AuthCard>
  );
}
