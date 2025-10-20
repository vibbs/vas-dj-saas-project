/**
 * Environment Configuration
 * Type-safe access to environment variables
 */

/**
 * Get environment variable with type safety
 * Only logs errors in development, doesn't throw
 */
function getEnvVar(key: string, fallback: string = ''): string {
  // In browser, use the value directly from process.env if available
  if (typeof window !== 'undefined') {
    return (process.env[key] as string) || fallback;
  }

  // In server/build time
  const value = process.env[key];

  if (!value && !fallback && process.env.NODE_ENV === 'development') {
    console.warn(`⚠️  Environment variable ${key} is not set. Using fallback.`);
  }

  return value || fallback;
}

/**
 * Application environment configuration
 */
export const env = {
  /**
   * API base URL for backend requests
   */
  apiBaseUrl: getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8000/api/v1'),

  /**
   * Application name
   */
  appName: getEnvVar('NEXT_PUBLIC_APP_NAME', 'VAS-DJ SaaS'),

  /**
   * Application URL
   */
  appUrl: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),

  /**
   * Feature flags
   */
  features: {
    registration: getEnvVar('NEXT_PUBLIC_ENABLE_REGISTRATION', 'true') !== 'false',
    socialAuth: getEnvVar('NEXT_PUBLIC_ENABLE_SOCIAL_AUTH', 'false') === 'true',
  },

  /**
   * Environment checks
   */
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * Validate environment configuration on app start
 * Only runs on server-side during build
 */
export function validateEnv(): void {
  // Only validate on server-side
  if (typeof window !== 'undefined') {
    return;
  }

  const required = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && env.isDevelopment) {
    console.warn(
      `\n⚠️  Missing environment variables:\n${missing.map(k => `   - ${k}`).join('\n')}\n` +
      `   These will use default values. Copy .env.local.example to .env.local for production.\n`
    );
  }
}
