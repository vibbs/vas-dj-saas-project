'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthUser, useAuthActions } from '@vas-dj-saas/auth';
import { RouteGuard } from '../../components/RouteGuard';

function DashboardContent() {
  const router = useRouter();
  const user = useAuthUser();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push('/auth/login');
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="px-4 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">VD</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">Welcome back, {user?.firstName || 'User'}!</h2>
                  <p className="text-gray-500">{user?.email || 'Your dashboard is ready to go.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Email Status</dt>
                      <dd className="text-lg font-medium text-gray-900">{user?.isEmailVerified ? 'Verified' : 'Not Verified'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-500">Role:</span>
                  <span className="ml-2 text-gray-900">{user?.role || 'USER'}</span>
                </div>
              </div>
            </div>

            {/* Organization Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">O</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Organization</dt>
                      <dd className="text-lg font-medium text-gray-900">{user?.organization?.name || 'No Organization'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-500">Subdomain:</span>
                  <span className="ml-2 text-gray-900">{user?.organization?.subdomain || 'N/A'}.vas-dj.com</span>
                </div>
              </div>
            </div>

            {/* Trial Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Account Status</dt>
                      <dd className="text-lg font-medium text-gray-900">{user?.organization?.onTrial ? 'Trial' : 'Active'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button className="font-medium text-blue-600 hover:text-blue-500">
                    Upgrade Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Account Settings
                </button>
                <button className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Verify Email
                </button>
                <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Organization
                </button>
                <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-3 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Navigation */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
                <p className="mt-1 text-sm text-blue-700">
                  This is a demo dashboard. Your authentication endpoints are now working! 
                  <button onClick={handleBackToLogin} className="ml-1 underline hover:no-underline">
                    Back to Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardContent />
    </RouteGuard>
  );
}