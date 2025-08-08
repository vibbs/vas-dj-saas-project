import React, { useState } from 'react';
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
  className,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing.lg}px`,
    ...style,
  };

  const fieldGroupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing.md}px`,
  };

  const checkboxGroupStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: `${theme.spacing.sm}px`,
  };

  const errorStyles: React.CSSProperties = {
    color: theme.colors.destructive,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  };

  const signUpLinkStyles: React.CSSProperties = {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.fontSize.sm,
  };

  return (
    <form className={className} style={containerStyles} onSubmit={handleSubmit}>
      <div style={fieldGroupStyles}>
        <Input
          type="email"
          label="Email"
          value={formState.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          errorText={formState.touched.email ? formState.errors.email?.[0] : undefined}
          disabled={isLoading}
          autoComplete="email"
          required
        />
        
        <Input
          type="password"
          label="Password"
          value={formState.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          errorText={formState.touched.password ? formState.errors.password?.[0] : undefined}
          disabled={isLoading}
          autoComplete="current-password"
          required
        />
      </div>

      {(showRememberMe || showForgotPassword) && (
        <div style={checkboxGroupStyles}>
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
              href="#"
              onClick={() => {
                onForgotPassword?.();
              }}
              size="sm"
            >
              Forgot password?
            </Link>
          )}
        </div>
      )}

      {error && (
        <Text style={errorStyles}>
          {error}
        </Text>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading}
        style={{ width: '100%' }}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      {onSignUpClick && (
        <div style={signUpLinkStyles}>
          Don't have an account?{' '}
          <Link
            href="#"
            onClick={() => {
              onSignUpClick();
            }}
          >
            Sign up
          </Link>
        </div>
      )}
    </form>
  );
};