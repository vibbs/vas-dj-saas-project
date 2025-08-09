'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@vas-dj-saas/ui';
import { LoginForm } from '@vas-dj-saas/auth';
import { useAuthActions, useAuthStatus, useAuthError } from '@vas-dj-saas/auth';
import { RouteGuard } from '../../../components/RouteGuard';

function LoginContent() {
  const router = useRouter();
  const { login, clearError } = useAuthActions();
  const status = useAuthStatus();
  const authError = useAuthError();
  
  const isLoading = status === 'authenticating';

  const handleSubmit = async (credentials: { email: string; password: string }) => {
    clearError();
    
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the auth store
      console.error('Login error:', error);
    }
  };

  const handleSignUpClick = () => {
    router.push('/auth/register');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      maxWidth="sm"
    >
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={authError || ''}
        onSignUpClick={handleSignUpClick}
        onForgotPassword={handleForgotPassword}
        showRememberMe={true}
        showForgotPassword={true}
      />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <RouteGuard requireAuth={false}>
      <LoginContent />
    </RouteGuard>
  );
}