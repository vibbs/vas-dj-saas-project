'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InviteUserSchema, type InviteUser } from '@vas-dj-saas/types';
import { Button, Input, Select, FormField } from '@vas-dj-saas/ui';
import { useInviteUser } from '../hooks/useUsers';

interface InviteUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InviteUserForm({ onSuccess, onCancel }: InviteUserFormProps) {
  const inviteUserMutation = useInviteUser();
  
  const form = useForm<InviteUser>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: {
      email: '',
      role: 'USER',
    },
  });

  const onSubmit = async (data: InviteUser) => {
    try {
      await inviteUserMutation.mutateAsync(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const roleOptions = [
    { value: 'USER', label: 'User' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'GUEST', label: 'Guest' },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email Address"
        error={form.formState.errors.email?.message}
        required
      >
        <Input
          {...form.register('email')}
          type="email"
          placeholder="user@example.com"
          disabled={inviteUserMutation.isPending}
        />
      </FormField>

      <FormField
        label="Role"
        error={form.formState.errors.role?.message}
        required
      >
        <Select
          value={form.watch('role')}
          onValueChange={(value) => form.setValue('role', value as any)}
          options={roleOptions}
          disabled={inviteUserMutation.isPending}
        />
      </FormField>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!form.formState.isValid || inviteUserMutation.isPending}
          loading={inviteUserMutation.isPending}
        >
          Send Invitation
        </Button>
        
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={inviteUserMutation.isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}