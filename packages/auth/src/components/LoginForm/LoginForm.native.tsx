import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Button, Input, Checkbox, Link, Text } from '@vas-dj-saas/ui';
import { LoginFormProps, LoginFormState } from './types';

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  initialEmail = '',
  showRememberMe = true,
  showForgotPassword = true,
  onForgotPassword,
  onSignUpClick,
  style,
}) => {
  const { theme } = useTheme();
  const [formState, setFormState] = useState<LoginFormState>({
    email: initialEmail,
    password: '',
    rememberMe: false,
    errors: {},
    touched: {
      email: false,
      password: false,
    },
  });

  const validateField = (name: keyof LoginFormState, value: any) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        return null;
      default:
        return null;
    }
  };

  const handleFieldChange = (name: keyof LoginFormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [name]: value,
      touched: { ...prev.touched, [name]: true },
      errors: {
        ...prev.errors,
        [name]: validateField(name, value) ? [validateField(name, value)!] : [],
      },
    }));
  };

  const handleSubmit = async () => {
    // Validate all fields
    const emailError = validateField('email', formState.email);
    const passwordError = validateField('password', formState.password);
    
    const errors = {
      email: emailError ? [emailError] : [],
      password: passwordError ? [passwordError] : [],
    };
    
    setFormState(prev => ({
      ...prev,
      errors,
      touched: { email: true, password: true },
    }));
    
    // If no errors, submit
    if (!emailError && !passwordError) {
      await onSubmit({
        email: formState.email,
        password: formState.password,
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
    fieldGroup: {
      gap: theme.spacing.md,
    },
    checkboxGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    error: {
      color: theme.colors.destructive,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
    },
    signUpLinkContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    signUpLinkText: {
      textAlign: 'center',
      color: theme.colors.mutedForeground,
      fontSize: theme.typography.fontSize.sm,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.fieldGroup}>
        <Input
          keyboardType="email-address"
          label="Email"
          value={formState.email}
          onChangeText={(text) => handleFieldChange('email', text)}
          errorText={formState.touched.email ? formState.errors.email?.[0] : undefined}
          disabled={isLoading}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
        
        <Input
          secureTextEntry
          label="Password"
          value={formState.password}
          onChangeText={(text) => handleFieldChange('password', text)}
          errorText={formState.touched.password ? formState.errors.password?.[0] : undefined}
          disabled={isLoading}
          autoCapitalize="none"
          autoComplete="current-password"
        />
      </View>

      {(showRememberMe || showForgotPassword) && (
        <View style={styles.checkboxGroup}>
          {showRememberMe && (
            <Checkbox
              checked={formState.rememberMe}
              onChange={(checked) => handleFieldChange('rememberMe', checked)}
              disabled={isLoading}
              label="Remember me"
            />
          )}
          
          {showForgotPassword && (
            <Link
              onPress={onForgotPassword}
              size="sm"
            >
              Forgot password?
            </Link>
          )}
        </View>
      )}

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
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      {onSignUpClick && (
        <View style={styles.signUpLinkContainer}>
          <Text style={styles.signUpLinkText}>
            Don't have an account?{' '}
            <Link onPress={onSignUpClick}>
              Sign up
            </Link>
          </Text>
        </View>
      )}
    </View>
  );
};