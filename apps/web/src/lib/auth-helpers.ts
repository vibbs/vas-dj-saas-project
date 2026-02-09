/**
 * Authentication Helper Functions
 * Utility functions for auth-related operations
 */

/**
 * Check if a token is expired
 * @param token JWT token
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return true; // If we can't parse it, consider it expired
  }
}

/**
 * Extract user info from JWT token
 * @param token JWT token
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): any | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/**
 * Format error message from API response
 * @param error Error object from API
 * @returns User-friendly error message
 */
export function formatAuthError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.data?.detail) {
    return error.data.detail;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Validate email format
 * @param email Email address
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password Password string
 * @returns Validation result with score and feedback
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Add at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Add at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Add at least one number');
  } else {
    score += 1;
  }

  return {
    isValid: feedback.length === 0,
    score,
    feedback,
  };
}
