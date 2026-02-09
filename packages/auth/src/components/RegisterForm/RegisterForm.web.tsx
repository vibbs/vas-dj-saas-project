import React, { useState } from 'react';
import { useTheme, Button, Input, Text, Link, Divider, Heading, Stepper, StepperStep } from '@vas-dj-saas/ui';
import { RegisterFormProps, RegisterFormState } from './types';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onLoginClick,
  className,
  style,
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
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

  const steps: StepperStep[] = [
    { label: 'Personal Info', description: 'Your details' },
    { label: 'Organization', description: 'Setup your org', optional: true },
    { label: 'Security', description: 'Set password' },
  ];

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
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
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

  const validateStep = (step: number): boolean => {
    let fieldsToValidate: (keyof RegisterFormState)[] = [];

    switch (step) {
      case 0: // Personal Info
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
        break;
      case 1: // Organization (all optional)
        fieldsToValidate = ['organizationName', 'preferredSubdomain'];
        break;
      case 2: // Security
        fieldsToValidate = ['password', 'passwordConfirm'];
        break;
    }

    const errors: any = {};
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
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
      errors: { ...prev.errors, ...errors },
      touched: fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), prev.touched as any),
    }));

    return !hasErrors;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step (should be the last step)
    if (!validateStep(currentStep)) {
      return;
    }

    // Submit the form
    await onSubmit({
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      phone: formState.phone || undefined,
      organizationName: formState.organizationName || undefined,
      preferredSubdomain: formState.preferredSubdomain || undefined,
      password: formState.password,
    });
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing.lg}px`,
    ...style,
  };

  const sectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing.md}px`,
    paddingTop: `${theme.spacing.md}px`,
  };

  const fieldRowStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: `${theme.spacing.md}px`,
  };

  const errorStyles: React.CSSProperties = {
    color: theme.colors.destructive,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  };

  const loginLinkStyles: React.CSSProperties = {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.fontSize.sm,
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    marginTop: `${theme.spacing.xs}px`,
  };

  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: `${theme.spacing.md}px`,
    marginTop: `${theme.spacing.lg}px`,
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Personal Information Step
        return (
          <div style={sectionStyles}>
            <div style={fieldRowStyles}>
              <Input
                type="text"
                label="First Name"
                value={formState.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                errorText={formState.touched.firstName ? formState.errors.firstName?.[0] : undefined}
                disabled={isLoading}
                autoComplete="given-name"
                required
              />

              <Input
                type="text"
                label="Last Name"
                value={formState.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                errorText={formState.touched.lastName ? formState.errors.lastName?.[0] : undefined}
                disabled={isLoading}
                autoComplete="family-name"
                required
              />
            </div>

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
              type="tel"
              label="Phone (Optional)"
              value={formState.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              errorText={formState.touched.phone ? formState.errors.phone?.[0] : undefined}
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>
        );

      case 1:
        // Organization Step
        return (
          <div style={sectionStyles}>
            <div>
              <Input
                type="text"
                label="Organization Name (Optional)"
                value={formState.organizationName}
                onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                errorText={formState.touched.organizationName ? formState.errors.organizationName?.[0] : undefined}
                disabled={isLoading}
                autoComplete="organization"
              />
              <Text style={helperTextStyles}>
                Leave empty to use your personal name
              </Text>
            </div>

            <div>
              <Input
                type="text"
                label="Preferred Subdomain (Optional)"
                value={formState.preferredSubdomain}
                onChange={(e) => handleFieldChange('preferredSubdomain', e.target.value)}
                errorText={formState.touched.preferredSubdomain ? formState.errors.preferredSubdomain?.[0] : undefined}
                disabled={isLoading}
                placeholder="your-subdomain"
              />
              <Text style={helperTextStyles}>
                Your organization will be accessible at [subdomain].vas-dj.com
              </Text>
            </div>
          </div>
        );

      case 2:
        // Security Step
        return (
          <div style={sectionStyles}>
            <Input
              type="password"
              label="Password"
              value={formState.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              errorText={formState.touched.password ? formState.errors.password?.[0] : undefined}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />

            <Input
              type="password"
              label="Confirm Password"
              value={formState.passwordConfirm}
              onChange={(e) => handleFieldChange('passwordConfirm', e.target.value)}
              errorText={formState.touched.passwordConfirm ? formState.errors.passwordConfirm?.[0] : undefined}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form className={className} style={containerStyles} onSubmit={handleSubmit}>
      <Stepper
        steps={steps}
        activeStep={currentStep}
        orientation="horizontal"
        showStepNumbers
        showConnectors
        size="md"
        variant="default"
      />

      {renderStepContent()}

      {error && (
        <Text style={errorStyles}>
          {error}
        </Text>
      )}

      <div style={buttonContainerStyles}>
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={isLoading}
            style={{ flex: 1 }}
          >
            Back
          </Button>
        )}

        {currentStep < steps.length - 1 ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={isLoading}
            style={{ flex: 1 }}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading}
            style={{ flex: 1 }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        )}
      </div>

      {onLoginClick && (
        <div style={loginLinkStyles}>
          Already have an account?{' '}
          <Link
            href="#"
            onClick={() => {
              onLoginClick();
            }}
          >
            Sign in
          </Link>
        </div>
      )}
    </form>
  );
};