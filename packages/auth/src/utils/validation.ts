import { ValidationErrors, RegistrationData, LoginCredentials } from '@vas-dj-saas/types';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

/**
 * Email validation
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

/**
 * Password validation
 */
export interface PasswordStrength {
  score: number; // 0-4 (weak to strong)
  feedback: string[];
  isValid: boolean;
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return {
      score: 0,
      feedback: ['Password is required'],
      isValid: false,
    };
  }
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password should contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Password should contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  // Number check
  if (!/\d/.test(password)) {
    feedback.push('Password should contain at least one number');
  } else {
    score += 1;
  }
  
  // Special character check (optional for basic validation)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  }
  
  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    feedback.push('Password should not contain common patterns');
    score = Math.max(0, score - 1);
  }
  
  return {
    score: Math.min(4, score),
    feedback,
    isValid: feedback.length === 0 && password.length >= 8,
  };
}

/**
 * Password confirmation validation
 */
export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  if (!confirmation) {
    return 'Password confirmation is required';
  }
  
  if (password !== confirmation) {
    return 'Passwords do not match';
  }
  
  return null;
}

/**
 * Name validation
 */
export function validateName(name: string, fieldName: string): string | null {
  if (!name || name.trim().length === 0) {
    return `${fieldName} is required`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  if (name.trim().length > 50) {
    return `${fieldName} must not exceed 50 characters`;
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return null;
}

/**
 * Subdomain validation
 */
export function validateSubdomain(subdomain: string): string | null {
  if (!subdomain) {
    return null; // Optional field
  }
  
  if (subdomain.length < 3) {
    return 'Subdomain must be at least 3 characters long';
  }
  
  if (subdomain.length > 50) {
    return 'Subdomain must not exceed 50 characters';
  }
  
  // Check format: lowercase letters, numbers, hyphens only
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain)) {
    return 'Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen';
  }
  
  // Check for reserved words
  const reservedWords = [
    'www', 'api', 'admin', 'app', 'mail', 'email', 'support', 'help',
    'blog', 'news', 'forum', 'chat', 'login', 'signup', 'register',
    'dashboard', 'account', 'profile', 'settings', 'billing', 'payment',
    'about', 'contact', 'privacy', 'terms', 'legal', 'security',
  ];
  
  if (reservedWords.includes(subdomain.toLowerCase())) {
    return 'This subdomain is reserved and cannot be used';
  }
  
  return null;
}

/**
 * Phone number validation (basic)
 */
export function validatePhone(phone: string): string | null {
  if (!phone) {
    return null; // Optional field
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  
  if (digitsOnly.length > 15) {
    return 'Phone number cannot exceed 15 digits';
  }
  
  return null;
}

/**
 * Login form validation
 */
export function validateLoginForm(credentials: LoginCredentials): ValidationResult {
  const errors: ValidationErrors = {};
  
  const emailError = validateEmail(credentials.email);
  if (emailError) {
    errors.email = [emailError];
  }
  
  if (!credentials.password) {
    errors.password = ['Password is required'];
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Registration form validation
 */
export function validateRegistrationForm(data: RegistrationData): ValidationResult {
  const errors: ValidationErrors = {};
  
  // Email validation
  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = [emailError];
  }
  
  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.feedback;
  }
  
  // Password confirmation validation
  const confirmError = validatePasswordConfirmation(data.password, data.passwordConfirm);
  if (confirmError) {
    errors.passwordConfirm = [confirmError];
  }
  
  // Name validations
  const firstNameError = validateName(data.firstName, 'First name');
  if (firstNameError) {
    errors.firstName = [firstNameError];
  }
  
  const lastNameError = validateName(data.lastName, 'Last name');
  if (lastNameError) {
    errors.lastName = [lastNameError];
  }
  
  // Optional fields
  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) {
      errors.phone = [phoneError];
    }
  }
  
  if (data.preferredSubdomain) {
    const subdomainError = validateSubdomain(data.preferredSubdomain);
    if (subdomainError) {
      errors.preferredSubdomain = [subdomainError];
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Real-time field validation for forms
 */
export function validateField(fieldName: keyof RegistrationData, value: string, allData?: Partial<RegistrationData>): string | null {
  switch (fieldName) {
    case 'email':
      return validateEmail(value);
    case 'password':
      const passwordValidation = validatePassword(value);
      return passwordValidation.isValid ? null : passwordValidation.feedback[0];
    case 'passwordConfirm':
      return allData?.password ? validatePasswordConfirmation(allData.password, value) : null;
    case 'firstName':
      return validateName(value, 'First name');
    case 'lastName':
      return validateName(value, 'Last name');
    case 'phone':
      return validatePhone(value);
    case 'preferredSubdomain':
      return validateSubdomain(value);
    default:
      return null;
  }
}

/**
 * Generate subdomain suggestions based on name
 */
export function generateSubdomainSuggestions(firstName: string, lastName: string, organizationName?: string): string[] {
  const suggestions: string[] = [];
  const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (firstName && lastName) {
    const first = sanitize(firstName);
    const last = sanitize(lastName);
    
    suggestions.push(
      `${first}-${last}`,
      `${first}${last}`,
      `${last}-${first}`,
      `${first}-${last}-co`,
      `${first}${last}co`,
    );
  }
  
  if (organizationName) {
    const org = sanitize(organizationName);
    suggestions.push(org, `${org}-co`, `${org}-inc`);
  }
  
  if (firstName) {
    const first = sanitize(firstName);
    suggestions.push(`${first}-co`, `${first}-inc`, `${first}-org`);
  }
  
  // Remove duplicates and filter out invalid ones
  return [...new Set(suggestions)].filter(s => s.length >= 3 && validateSubdomain(s) === null);
}