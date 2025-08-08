'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@vas-dj-saas/ui';
import { RegisterForm } from '@vas-dj-saas/auth';
import type { RegisterCredentials } from '@vas-dj-saas/types';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError('');

    // Simulate API call for now
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept registration
      if (credentials.email && credentials.password && credentials.firstName && credentials.lastName) {
        router.push('/dashboard');
      } else {
        setError('Please fill in required fields');
      }
    } catch {
      setError('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your free 14-day trial today"
      maxWidth="md"
    >
      <RegisterForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        onLoginClick={handleLoginClick}
      />
    </AuthLayout>
  );
}