import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthLayout, Button, Text, Card, Icon, Link } from '@vas-dj-saas/ui';
import { useAuth, useEmailVerification } from '@vas-dj-saas/auth';
import { useTheme } from '@vas-dj-saas/ui';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { theme } = useTheme();
  
  const { user, isAuthenticated } = useAuth();
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

  // Handle token verification from URL
  useEffect(() => {
    if (token && !verificationSuccess && !isVerifying) {
      handleTokenVerification(token);
    }
  }, [token, verificationSuccess, isVerifying]);

  const handleTokenVerification = async (verificationToken: string) => {
    try {
      const success = await verifyEmail(verificationToken);
      if (success) {
        setVerificationSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      }
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  };

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
    router.push('/auth/login' as any);
  };

  const styles = React.useMemo(() => StyleSheet.create({
    card: {
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    iconContainer: {
      marginBottom: theme.spacing.xl,
    },
    welcomeText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.success,
      marginBottom: theme.spacing.md,
    },
    description: {
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: 24,
    },
    emailText: {
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
      width: '100%',
      gap: theme.spacing.sm,
    },
    messageText: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    errorText: {
      color: theme.colors.destructive,
    },
    successText: {
      color: theme.colors.success,
    },
    disclaimerText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
    },
  }), [theme]);

  // Show verification success state
  if (verificationSuccess) {
    return (
      <AuthLayout
        title="Email Verified!"
        subtitle="Your email has been successfully verified"
        maxWidth="sm"
      >
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <Icon name="CheckCircle" size={64} color={theme.colors.success} />
          </View>
          
          <Text style={styles.welcomeText}>
            Welcome to VAS-DJ!
          </Text>
          
          <Text style={[styles.description]}>
            Your account is now active. Redirecting to dashboard...
          </Text>
          
          <Button
            variant="primary"
            onPress={() => router.replace('/(tabs)')}
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
      <Card style={styles.card}>
        <View style={styles.iconContainer}>
          <Icon name="Mail" size={64} color={theme.colors.primary} />
        </View>
        
        {user?.email && (
          <Text style={[styles.messageText]}>
            We've sent a verification link to:
          </Text>
        )}
        
        {user?.email && (
          <Text style={styles.emailText}>
            {user.email}
          </Text>
        )}
        
        <Text style={styles.description}>
          Click the link in your email to verify your account. 
          If you don't see the email, check your spam folder.
        </Text>

        {verificationError && (
          <Text style={[styles.messageText, styles.errorText]}>
            {verificationError}
          </Text>
        )}

        {resendError && (
          <Text style={[styles.messageText, styles.errorText]}>
            {resendError}
          </Text>
        )}

        {resendSuccess && (
          <Text style={[styles.messageText, styles.successText]}>
            Verification email sent successfully! Check your inbox.
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            loading={isResending}
            disabled={isResending || resendSuccess}
            onPress={handleResendVerification}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          
          <Button
            variant="outline"
            onPress={handleBackToLogin}
          >
            Back to Login
          </Button>
        </View>
        
        <Text style={styles.disclaimerText}>
          Verification link expires in 24 hours for security reasons.
        </Text>
      </Card>
    </AuthLayout>
  );
}