'use client';

import { useState } from 'react';
import { RouteGuard } from '../../../components/RouteGuard';
import { useUsers, useUpdateUser } from '../../../hooks/useUsers';
import { InviteUserForm } from '../../../components/InviteUserForm';
import {
  Button,
  Card,
  Table,
  Modal,
  Badge,
  Spinner,
  EmptyState,
  useModalActions,
  useLayoutStore,
  useToastActions,
} from '@vas-dj-saas/ui';

function UsersContent() {
  const { data: users, isLoading, error, refetch } = useUsers();
  const updateUserMutation = useUpdateUser();
  const { openModal, closeModal } = useModalActions();
  const { toggleSidebar } = useLayoutStore();
  const { info } = useToastActions();

  const handleInviteUser = () => {
    const modalId = openModal({
      component: (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Invite User</h2>
          <InviteUserForm
            onSuccess={() => {
              closeModal(modalId);
            }}
            onCancel={() => closeModal(modalId)}
          />
        </div>
      ),
      options: { size: 'md' }
    });
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    await updateUserMutation.mutateAsync({ userId, updates });
  };

  const handleDemoAction = () => {
    info('Demo Action', 'This demonstrates the toast system!');
    toggleSidebar(); // Example of using UI state
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">Failed to load users</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No users found"
          description="Get started by inviting your first team member."
          action={
            <Button onClick={handleInviteUser}>
              Invite User
            </Button>
          }
        />
      </Card>
    );
  }

  const tableColumns = [
    {
      key: 'name',
      title: 'Name',
      render: (user: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          <div>
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (user: any) => (
        <Badge variant={user.role === 'ADMIN' ? 'success' : 'default'}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (user: any) => (
        <Badge variant={user.isActive ? 'success' : 'destructive'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (user: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
            disabled={updateUserMutation.isPending}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your team members and their permissions.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleDemoAction}>
            Demo Action
          </Button>
          <Button onClick={handleInviteUser}>
            Invite User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <Table
          data={users}
          columns={tableColumns}
          loading={isLoading}
        />
      </Card>

      {/* Demo Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{users?.length || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{users?.filter(u => u.isActive).length || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold">{users?.filter(u => u.role === 'ADMIN').length || 0}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <UsersContent />
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}