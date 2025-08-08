import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { AuthLayout } from '@vas-dj-saas/ui';
import { LoginForm } from '@vas-dj-saas/auth';
import { LoginCredentials } from '@vas-dj-saas/types';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any credentials
      if (credentials.email && credentials.password) {
        router.replace('/(tabs)');
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
    router.push('/auth/forgot-password');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      maxWidth="sm"
    >
      <LoginForm
        onSubmit={handleLogin}
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