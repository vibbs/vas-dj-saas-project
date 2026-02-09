import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme, Button, Input, Text, Link, Divider, Heading } from '@vas-dj-saas/ui';
import { RegisterFormProps, RegisterFormState } from './types';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onLoginClick,
  style,
}) => {
  const { theme } = useTheme();
  const [formState, setFormState] = useState<RegisterFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organizationName: '',
    preferredSubdomain: '',
    password: '',
    passwordConfirm: '',
    errors: {},
    touched: {
      firstName: false,
      lastName: false,
      email: false,
      phone: false,
      organizationName: false,
      preferredSubdomain: false,
      password: false,
      passwordConfirm: false,
    },
  });

  const validateField = (name: keyof RegisterFormState, value: any) => {
    switch (name) {
      case 'firstName':
        if (!value?.trim()) return 'First name is required';
        return null;
      case 'lastName':
        if (!value?.trim()) return 'Last name is required';
        return null;
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return null;
      case 'phone':
        // Phone is optional, but if provided should be valid
        if (value && !/^\+?[\d\s-().]+$/.test(value)) return 'Please enter a valid phone number';
        return null;
      case 'organizationName':
        // Optional field
        return null;
      case 'preferredSubdomain':
        // Optional field, but if provided should be valid subdomain format
        if (value && !/^[a-zA-Z0-9-]+$/.test(value)) return 'Subdomain can only contain letters, numbers, and hyphens';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      case 'passwordConfirm':
        if (!value) return 'Please confirm your password';
        if (value !== formState.password) return 'Passwords do not match';
        return null;
      default:
        return null;
    }
  };

  const handleFieldChange = (name: keyof RegisterFormState, value: any) => {
    setFormState(prev => {
      const newState = {
        ...prev,
        [name]: value,
        touched: { ...prev.touched, [name]: true },
        errors: {
          ...prev.errors,
          [name]: validateField(name, value) ? [validateField(name, value)!] : [],
        },
      };

      // Re-validate password confirmation when password changes
      if (name === 'password' && prev.passwordConfirm) {
        const confirmError = validateField('passwordConfirm', prev.passwordConfirm);
        newState.errors = {
          ...newState.errors,
          passwordConfirm: confirmError ? [confirmError] : [],
        };
      }

      return newState;
    });
  };

  const handleSubmit = async () => {
    // Validate all required fields
    const requiredFields: (keyof RegisterFormState)[] = ['firstName', 'lastName', 'email', 'password', 'passwordConfirm'];
    const optionalFields: (keyof RegisterFormState)[] = ['phone', 'organizationName', 'preferredSubdomain'];
    const allFields = [...requiredFields, ...optionalFields];
    
    const errors: any = {};
    let hasErrors = false;

    allFields.forEach(field => {
      const error = validateField(field, formState[field]);
      if (error) {
        errors[field] = [error];
        hasErrors = true;
      } else {
        errors[field] = [];
      }
    });
    
    setFormState(prev => ({
      ...prev,
      errors,
      touched: allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {} as any),
    }));
    
    // If no errors, submit
    if (!hasErrors) {
      await onSubmit({
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        phone: formState.phone || undefined,
        organizationName: formState.organizationName || undefined,
        preferredSubdomain: formState.preferredSubdomain || undefined,
        password: formState.password,
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
    section: {
      gap: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    fieldRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    fieldHalf: {
      flex: 1,
    },
    error: {
      color: theme.colors.destructive,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
    },
    loginLinkContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    loginLinkText: {
      textAlign: 'center',
      color: theme.colors.mutedForeground,
      fontSize: theme.typography.fontSize.sm,
    },
    helperText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedForeground,
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <ScrollView contentContainerStyle={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Personal Information Section */}
      <View>
        <Heading level={3} style={{ marginBottom: theme.spacing.md, color: theme.colors.foreground }}>
          Personal Information
        </Heading>
        
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Input
              label="First Name"
              value={formState.firstName}
              onChangeText={(text) => handleFieldChange('firstName', text)}
              errorText={formState.touched.firstName ? formState.errors.firstName?.[0] : undefined}
              disabled={isLoading}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="given-name"
            />
          </View>
          
          <View style={styles.fieldHalf}>
            <Input
              label="Last Name"
              value={formState.lastName}
              onChangeText={(text) => handleFieldChange('lastName', text)}
              errorText={formState.touched.lastName ? formState.errors.lastName?.[0] : undefined}
              disabled={isLoading}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="family-name"
            />
          </View>
        </View>
        
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
          keyboardType="phone-pad"
          label="Phone (Optional)"
          value={formState.phone}
          onChangeText={(text) => handleFieldChange('phone', text)}
          errorText={formState.touched.phone ? formState.errors.phone?.[0] : undefined}
          disabled={isLoading}
          autoComplete="tel"
        />
      </View>

      <Divider />

      {/* Organization Section */}
      <View style={styles.section}>
        <Heading level={3} style={{ marginBottom: theme.spacing.md, color: theme.colors.foreground }}>
          Organization
        </Heading>
        
        <View>
          <Input
            label="Organization Name (Optional)"
            value={formState.organizationName}
            onChangeText={(text) => handleFieldChange('organizationName', text)}
            errorText={formState.touched.organizationName ? formState.errors.organizationName?.[0] : undefined}
            disabled={isLoading}
            autoCapitalize="words"
            autoComplete="organization"
          />
          <Text style={styles.helperText}>
            Leave empty to use your personal name
          </Text>
        </View>
        
        <View>
          <Input
            label="Preferred Subdomain (Optional)"
            value={formState.preferredSubdomain}
            onChangeText={(text) => handleFieldChange('preferredSubdomain', text)}
            errorText={formState.touched.preferredSubdomain ? formState.errors.preferredSubdomain?.[0] : undefined}
            disabled={isLoading}
            placeholder="your-subdomain"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.helperText}>
            Your organization will be accessible at [subdomain].vas-dj.com
          </Text>
        </View>
      </View>

      <Divider />

      {/* Security Section */}
      <View style={styles.section}>
        <Heading level={3} style={{ marginBottom: theme.spacing.md, color: theme.colors.foreground }}>
          Security
        </Heading>
        
        <Input
          secureTextEntry
          label="Password"
          value={formState.password}
          onChangeText={(text) => handleFieldChange('password', text)}
          errorText={formState.touched.password ? formState.errors.password?.[0] : undefined}
          disabled={isLoading}
          autoCapitalize="none"
          autoComplete="new-password"
        />
        
        <Input
          secureTextEntry
          label="Confirm Password"
          value={formState.passwordConfirm}
          onChangeText={(text) => handleFieldChange('passwordConfirm', text)}
          errorText={formState.touched.passwordConfirm ? formState.errors.passwordConfirm?.[0] : undefined}
          disabled={isLoading}
          autoCapitalize="none"
          autoComplete="new-password"
        />
      </View>

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
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>

      {onLoginClick && (
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Link onPress={onLoginClick}>
              Sign in
            </Link>
          </Text>
        </View>
      )}
    </ScrollView>
  );
};