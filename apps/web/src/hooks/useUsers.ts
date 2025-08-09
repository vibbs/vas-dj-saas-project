import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganizationUsers, inviteUser } from '@vas-dj-saas/api-client';
import { useAuthUser } from '@vas-dj-saas/auth';
import { useToastActions } from '@vas-dj-saas/ui';

// Example data fetching with TanStack Query
export function useUsers() {
  const user = useAuthUser();
  const orgId = user?.organizationId;

  return useQuery({
    queryKey: ['users', orgId],
    queryFn: () => getOrganizationUsers(orgId!),
    enabled: !!orgId, // Only run query if we have an orgId
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  const user = useAuthUser();
  const { success, error: showError } = useToastActions();
  const orgId = user?.organizationId;

  return useMutation({
    mutationFn: (payload: { email: string; role: string }) => {
      if (!orgId) throw new Error('No organization ID');
      return inviteUser(orgId, payload);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['users', orgId] });
      success('User invited', `Successfully invited ${variables.email}`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to invite user';
      showError('Invitation failed', message);
    },
  });
}

// Example of optimistic updates
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const user = useAuthUser();
  const { success, error: showError } = useToastActions();
  const orgId = user?.organizationId;

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      // This would be your actual API call
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      return response.json();
    },
    onMutate: async ({ userId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users', orgId] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users', orgId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['users', orgId], (old: any[]) =>
        old?.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );

      // Return a context with the previous and new todo
      return { previousUsers };
    },
    onError: (error, variables, context) => {
      // Revert the optimistic update
      if (context?.previousUsers) {
        queryClient.setQueryData(['users', orgId], context.previousUsers);
      }
      
      const message = (error as any)?.response?.data?.message || error?.message || 'Failed to update user';
      showError('Update failed', message);
    },
    onSuccess: () => {
      success('User updated', 'User information updated successfully');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['users', orgId] });
    },
  });
}