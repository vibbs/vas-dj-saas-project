/**
 * useProfile Hook
 * Manages current user profile data fetching and updates
 */

import { useState, useEffect, useCallback } from 'react';
import { UsersService } from '@vas-dj-saas/api-client';
import type { Account, PatchedAccountRequest, AccountGender } from '@vas-dj-saas/api-client';
import { useAuthStatus } from '@vas-dj-saas/auth';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  dateOfBirth: string | null;
  gender: AccountGender | '';
  avatar: string | null;
}

export interface UseProfileReturn {
  profile: Account | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (data: Partial<ProfileFormData>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
  const authStatus = useAuthStatus();
  const [profile, setProfile] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await UsersService.me();

      if (response.status === 200) {
        // Cast to Account since the API returns the same shape
        setProfile(response.data as unknown as Account);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: Partial<ProfileFormData>): Promise<boolean> => {
    if (!profile) return false;

    try {
      setIsSaving(true);
      setError(null);

      // Convert form data to API request format
      const requestData: PatchedAccountRequest = {};

      if (data.firstName !== undefined) requestData.firstName = data.firstName;
      if (data.lastName !== undefined) requestData.lastName = data.lastName;
      if (data.phone !== undefined) requestData.phone = data.phone;
      if (data.bio !== undefined) requestData.bio = data.bio;
      if (data.dateOfBirth !== undefined) requestData.dateOfBirth = data.dateOfBirth || null;
      if (data.gender !== undefined && data.gender !== '') {
        requestData.gender = data.gender;
      }

      const response = await UsersService.updateProfile(requestData);

      if (response.status === 200) {
        // Cast to Account since the API returns the same shape
        setProfile(response.data as unknown as Account);
        return true;
      } else {
        const errorData = response.data as { detail?: string };
        setError(errorData?.detail || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [profile]);

  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    // For now, this is a placeholder
    // In a real implementation, you would:
    // 1. Upload the file to a storage service (S3, Cloudinary, etc.)
    // 2. Get the URL back
    // 3. Update the profile with the new avatar URL
    console.log('Avatar upload not yet implemented', file);
    setError('Avatar upload is not yet available');
    return false;
  }, []);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    refresh: fetchProfile,
    updateProfile,
    uploadAvatar,
  };
}
