import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout, Button, Input, Text, Link } from '@vas-dj-saas/ui';
import { validateRegistrationForm, generateSubdomainSuggestions } from '@vas-dj-saas/auth';
import { RegistrationData, ValidationErrors } from '@vas-dj-saas/types';
import { useTheme } from '@vas-dj-saas/ui';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phone: '',
    organizationName: '',
    preferredSubdomain: '',
  });
  
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [subdomainSuggestions, setSubdomainSuggestions] = useState<string[]>([]);

  // Remove auth redirect for now

  // Generate subdomain suggestions when name changes
  React.useEffect(() => {
    if (formData.firstName && formData.lastName) {
      const suggestions = generateSubdomainSuggestions(
        formData.firstName,
        formData.lastName,
        formData.organizationName
      );
      setSubdomainSuggestions(suggestions.slice(0, 3));
    }
  }, [formData.firstName, formData.lastName, formData.organizationName]);

  const handleFieldChange = (name: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubdomainSuggestionClick = (suggestion: string) => {
    handleFieldChange('preferredSubdomain', suggestion);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    // Validate form
    try {
      const validation = validateRegistrationForm(formData);
      setFormErrors(validation.errors);
      
      if (!validation.isValid) {
        setIsLoading(false);
        return;
      }
    } catch (validationError) {
      // Simple validation fallback
      const errors: ValidationErrors = {};
      if (!formData.email) errors.email = ['Email is required'];
      if (!formData.password) errors.password = ['Password is required'];
      if (!formData.firstName) errors.firstName = ['First name is required'];
      if (!formData.lastName) errors.lastName = ['Last name is required'];
      
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        setIsLoading(false);
        return;
      }
    }
    
    // Mark all fields as touched
    const allFieldsTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouchedFields(allFieldsTouched);
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any valid form
      router.push('/auth/verify-email');
    } catch {
      setError('Registration failed');
    }
    
    setIsLoading(false);
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  const styles = StyleSheet.create({
    form: {
      gap: 24,
    },
    section: {
      gap: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 8,
    },
    nameRow: {
      flexDirection: 'row',
      gap: 16,
    },
    nameInput: {
      flex: 1,
    },
    suggestions: {
      gap: 8,
    },
    suggestionsText: {
      fontSize: 14,
      color: '#6b7280',
    },
    suggestionsRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    error: {
      color: '#ef4444',
      fontSize: 14,
      textAlign: 'center',
    },
    loginLink: {
      textAlign: 'center',
      color: '#6b7280',
      fontSize: 14,
    },
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your free 14-day trial today"
      maxWidth="md"
    >
      <View style={styles.form}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>
          
          <View style={styles.nameRow}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => handleFieldChange('firstName', text)}
              errorText={touchedFields.firstName ? formErrors.firstName?.[0] : undefined}
              disabled={isLoading}
              autoCapitalize="words"
              style={styles.nameInput}
            />
            
            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => handleFieldChange('lastName', text)}
              errorText={touchedFields.lastName ? formErrors.lastName?.[0] : undefined}
              disabled={isLoading}
              autoCapitalize="words"
              style={styles.nameInput}
            />
          </View>
          
          <Input
            keyboardType="email-address"
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleFieldChange('email', text)}
            errorText={touchedFields.email ? formErrors.email?.[0] : undefined}
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />
          
          <Input
            keyboardType="phone-pad"
            label="Phone (Optional)"
            value={formData.phone}
            onChangeText={(text) => handleFieldChange('phone', text)}
            errorText={touchedFields.phone ? formErrors.phone?.[0] : undefined}
            editable={!isLoading}
            autoComplete="tel"
          />
        </View>

        {/* Organization Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Organization
          </Text>
          
          <Input
            label="Organization Name (Optional)"
            value={formData.organizationName}
            onChangeText={(text) => handleFieldChange('organizationName', text)}
            helpText="Leave empty to use your personal name"
            editable={!isLoading}
            autoCapitalize="words"
          />
          
          <Input
            label="Preferred Subdomain (Optional)"
            value={formData.preferredSubdomain}
            onChangeText={(text) => handleFieldChange('preferredSubdomain', text)}
            errorText={touchedFields.preferredSubdomain ? formErrors.preferredSubdomain?.[0] : undefined}
            helpText="Your organization will be accessible at [subdomain].vas-dj.com"
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {subdomainSuggestions.length > 0 && !formData.preferredSubdomain && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsText}>
                Suggested subdomains:
              </Text>
              <View style={styles.suggestionsRow}>
                {subdomainSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onPress={() => handleSubdomainSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Security
          </Text>
          
          <Input
            secureTextEntry
            label="Password"
            value={formData.password}
            onChangeText={(text) => handleFieldChange('password', text)}
            errorText={touchedFields.password ? formErrors.password?.[0] : undefined}
            editable={!isLoading}
            autoCapitalize="none"
            autoComplete="new-password"
          />
          
          <Input
            secureTextEntry
            label="Confirm Password"
            value={formData.passwordConfirm}
            onChangeText={(text) => handleFieldChange('passwordConfirm', text)}
            errorText={touchedFields.passwordConfirm ? formErrors.passwordConfirm?.[0] : undefined}
            editable={!isLoading}
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

        <View style={styles.loginLink}>
          <Text style={styles.loginLink}>
            Already have an account?{' '}
            <Link onPress={handleLoginClick}>
              Sign in
            </Link>
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}