import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout, Button, Input, Text, Link } from '@vas-dj-saas/ui';
import { useTheme } from '@vas-dj-saas/ui';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
    return null;
  };

  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement forgot password API call
      // await forgotPassword(email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const styles = React.useMemo(() => StyleSheet.create({
    form: {
      gap: theme.spacing.lg,
    },
    error: {
      color: theme.colors.destructive,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
    },
    success: {
      color: theme.colors.success,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
      lineHeight: 20,
    },
    backLink: {
      textAlign: 'center',
      color: theme.colors.mutedForeground,
      fontSize: theme.typography.fontSize.sm,
    },
  }), [theme]);

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link"
        maxWidth="sm"
      >
        <View style={styles.form}>
          <Text style={styles.success}>
            If an account with that email exists, we've sent you a password reset link. 
            Check your inbox and follow the instructions to reset your password.
          </Text>
          
          <Button
            variant="primary"
            size="lg"
            onPress={handleBackToLogin}
            style={{ width: '100%' }}
          >
            Back to Login
          </Button>
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a reset link"
      maxWidth="sm"
    >
      <View style={styles.form}>
        <Input
          keyboardType="email-address"
          label="Email"
          value={email}
          onChangeText={setEmail}
          disabled={isLoading}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          placeholder="Enter your email address"
        />

        {error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        <Button
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <View style={styles.backLink}>
          <Text style={styles.backLink}>
            Remember your password?{' '}
            <Link onPress={handleBackToLogin}>
              Back to login
            </Link>
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}