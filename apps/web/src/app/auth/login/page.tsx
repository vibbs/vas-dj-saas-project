'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@vas-dj-saas/ui';
import { LoginForm } from '@vas-dj-saas/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');

    // Simulate API call for now
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any credentials
      if (credentials.email && credentials.password) {
        router.push('/dashboard');
      } else {
        setError('Please enter email and password');
      }
    } catch {
      setError('Login failed');
    } finally {
      setIsLoading(false);
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
        error={error}
        onSignUpClick={handleSignUpClick}
        onForgotPassword={handleForgotPassword}
        showRememberMe={true}
        showForgotPassword={true}
      />
    </AuthLayout>
  );
}