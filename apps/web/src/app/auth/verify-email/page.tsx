'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout, Button, Text, Card, Icon } from '@vas-dj-saas/ui';
import { useAuth, useEmailVerification } from '@vas-dj-saas/auth';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const { user } = useAuth();
  const {
    isVerifying,
    isResending,
    verificationError,
    resendError,
    verifyEmail,
    resendVerification,
    clearErrors,
  } = useEmailVerification();
  
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleTokenVerification = useCallback(async (verificationToken: string) => {
    try {
      const success = await verifyEmail(verificationToken);
      if (success) {
        setVerificationSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  }, [verifyEmail, router]);

  // Handle token verification from URL
  useEffect(() => {
    if (token && !verificationSuccess && !isVerifying) {
      handleTokenVerification(token);
    }
  }, [token, verificationSuccess, isVerifying, handleTokenVerification]);

  const handleResendVerification = async () => {
    clearErrors();
    setResendSuccess(false);
    
    try {
      const success = await resendVerification();
      if (success) {
        setResendSuccess(true);
      }
    } catch (error) {
      console.error('Resend verification failed:', error);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  // Show verification success state
  if (verificationSuccess) {
    return (
      <AuthLayout
        title="Email Verified!"
        subtitle="Your email has been successfully verified"
        maxWidth="sm"
      >
        <Card style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Icon name="CheckCircle" size={64} style={{ color: '#10B981' }} />
          </div>
          
          <Text size="lg" style={{ marginBottom: '16px', color: '#10B981' }}>
            Welcome to VAS-DJ!
          </Text>
          
          <Text style={{ marginBottom: '24px', color: '#666' }}>
            Your account is now active. Redirecting to dashboard...
          </Text>
          
          <Button
            variant="primary"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Card>
      </AuthLayout>
    );
  }

  // Show verification pending state
  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We've sent you a verification link"
      maxWidth="sm"
    >
      <Card style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Icon name="Mail" size={64} style={{ color: '#3B82F6' }} />
        </div>
        
        {user?.email && (
          <Text style={{ marginBottom: '16px' }}>
            We&apos;ve sent a verification link to:
          </Text>
        )}
        
        {user?.email && (
          <Text weight="semibold" style={{ marginBottom: '24px', color: '#3B82F6' }}>
            {user.email}
          </Text>
        )}
        
        <Text style={{ marginBottom: '24px', color: '#666', lineHeight: '1.5' }}>
          Click the link in your email to verify your account. 
          If you don&apos;t see the email, check your spam folder.
        </Text>

        {verificationError && (
          <Text style={{ color: 'red', marginBottom: '16px' }}>
            {verificationError}
          </Text>
        )}

        {resendError && (
          <Text style={{ color: 'red', marginBottom: '16px' }}>
            {resendError}
          </Text>
        )}

        {resendSuccess && (
          <Text style={{ color: '#10B981', marginBottom: '16px' }}>
            Verification email sent successfully! Check your inbox.
          </Text>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button
            variant="primary"
            loading={isResending}
            disabled={isResending || resendSuccess}
            onClick={handleResendVerification}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleBackToLogin}
          >
            Back to Login
          </Button>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <Text size="sm" style={{ color: '#666' }}>
            Verification link expires in 24 hours for security reasons.
          </Text>
        </div>
      </Card>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}