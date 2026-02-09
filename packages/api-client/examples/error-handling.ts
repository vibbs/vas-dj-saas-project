/**
 * Error Handling Example
 *
 * This example demonstrates how to handle different types of API errors.
 */

import {
  AuthService,
  UsersService,
  ApiError,
  formatApiError,
  type ProblemDetails,
} from '@vas-dj-saas/api-client';

// ========================================
// 1. Basic Error Handling
// ========================================

async function basicErrorHandling() {
  try {
    const response = await AuthService.login({
      email: 'invalid@example.com',
      password: 'wrongpassword',
    });

    console.log('Login successful:', response.data);
  } catch (error) {
    // Use the formatApiError helper for simple error messages
    const message = formatApiError(error);
    console.error('Login failed:', message);
  }
}

// ========================================
// 2. Detailed Error Handling with ApiError
// ========================================

async function detailedErrorHandling() {
  try {
    const response = await UsersService.updateProfile({
      firstName: '',
      lastName: '',
    });

    console.log('Profile updated:', response.data);
  } catch (error) {
    if (error instanceof ApiError) {
      console.log('Error Code:', error.code);
      console.log('HTTP Status:', error.status);
      console.log('Message:', error.message);
      console.log('Request ID:', error.requestId);

      // Check error type
      if (error.isValidationError()) {
        console.log('Validation errors:', error.getValidationErrors());
      } else if (error.isAuthError()) {
        console.log('Authentication/Authorization error');
      } else if (error.isNotFoundError()) {
        console.log('Resource not found');
      } else if (error.isServerError()) {
        console.log('Server error - try again later');
      }

      // Get detailed problem info
      if (error.details) {
        console.log('Problem Details:', error.details);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// ========================================
// 3. Validation Error Handling
// ========================================

async function handleValidationErrors() {
  try {
    const response = await UsersService.updateProfile({
      firstName: '', // Invalid: too short
      lastName: 'A'.repeat(200), // Invalid: too long
    });

    console.log('Profile updated:', response.data);
  } catch (error) {
    if (error instanceof ApiError && error.isValidationError()) {
      const validationErrors = error.getValidationErrors();

      // Display field-specific errors
      Object.entries(validationErrors).forEach(([field, messages]) => {
        console.error(`${field}: ${messages.join(', ')}`);
      });

      // Example output:
      // firstName: This field is required
      // lastName: Ensure this field has no more than 100 characters
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// ========================================
// 4. Custom Error Handling by Status Code
// ========================================

async function handleByStatusCode() {
  try {
    const response = await OrganizationsService.retrieve({ id: 'invalid-id' });
    console.log('Organization:', response.data);
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          console.error('Bad request:', error.message);
          break;
        case 401:
          console.error('Unauthorized - please login');
          // Redirect to login page
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Organization not found');
          break;
        case 500:
        case 502:
        case 503:
          console.error('Server error - please try again later');
          break;
        default:
          console.error('Unexpected error:', error.message);
      }
    }
  }
}

// ========================================
// 5. React Hook Example (Error State)
// ========================================

function useApiError() {
  const [error, setError] = React.useState<string | null>(null);

  const handleApiCall = async (apiCall: () => Promise<any>) => {
    setError(null);

    try {
      return await apiCall();
    } catch (err) {
      if (err instanceof ApiError) {
        // User-friendly error messages
        if (err.isValidationError()) {
          const errors = err.getValidationErrors();
          const messages = Object.values(errors).flat();
          setError(messages.join('. '));
        } else if (err.isAuthError()) {
          setError('Please log in to continue');
        } else if (err.isServerError()) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }

      throw err;
    }
  };

  return { error, handleApiCall };
}

// ========================================
// 6. Retry Logic Example
// ========================================

async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof ApiError) {
        // Only retry on server errors
        if (!error.isServerError()) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}

// Usage
async function fetchWithRetry() {
  try {
    const user = await withRetry(() => UsersService.me());
    console.log('User fetched:', user);
  } catch (error) {
    console.error('Failed after retries:', formatApiError(error));
  }
}

// ========================================
// 7. Logging Errors for Monitoring
// ========================================

function logErrorToMonitoring(error: unknown) {
  if (error instanceof ApiError) {
    // Send to error tracking service (e.g., Sentry)
    console.error('[API Error]', {
      code: error.code,
      status: error.status,
      message: error.message,
      requestId: error.requestId,
      details: error.details,
      stack: error.stack,
    });
  } else if (error instanceof Error) {
    console.error('[Unexpected Error]', {
      message: error.message,
      stack: error.stack,
    });
  }
}

// Example usage
async function monitoredApiCall() {
  try {
    return await UsersService.me();
  } catch (error) {
    logErrorToMonitoring(error);
    throw error;
  }
}
