/**
 * Basic Usage Example
 *
 * This example demonstrates the most common usage patterns for the API client.
 */

import {
  wireAuth,
  setBaseUrl,
  AuthService,
  UsersService,
  OrganizationsService,
  type Account,
} from '@vas-dj-saas/api-client';

// ========================================
// 1. Initial Configuration
// ========================================

// Set the base URL (usually done once at app startup)
setBaseUrl('https://api.example.com/api/v1');

// Wire up authentication
wireAuth({
  // Return the current access token
  getAccessToken: () => {
    return localStorage.getItem('accessToken') || undefined;
  },

  // Refresh the access token when it expires
  refreshToken: async () => {
    const response = await fetch('https://api.example.com/api/v1/auth/refresh/', {
      method: 'POST',
      credentials: 'include', // Sends httpOnly refresh token cookie
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.data.access);
  },
});

// ========================================
// 2. Authentication
// ========================================

async function login(email: string, password: string) {
  try {
    const response = await AuthService.login({ email, password });

    if (response.status === 200 && response.data.data) {
      const { access, user } = response.data.data;

      // Store the access token
      localStorage.setItem('accessToken', access);

      // Store user info
      console.log('Logged in as:', user.email);

      return user;
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

async function logout() {
  try {
    // Note: The refresh token is sent via httpOnly cookie
    await AuthService.logout({ refresh: '' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local state regardless
    localStorage.removeItem('accessToken');
  }
}

// ========================================
// 3. User Operations
// ========================================

async function getCurrentUser(): Promise<Account | null> {
  try {
    const response = await UsersService.me();

    if (response.status === 200 && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

async function updateUserProfile(updates: { firstName?: string; lastName?: string }) {
  try {
    const response = await UsersService.updateProfile(updates);

    if (response.status === 200 && response.data.data) {
      console.log('Profile updated:', response.data.data);
      return response.data.data;
    }
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
}

// ========================================
// 4. Organization Operations
// ========================================

async function listOrganizations() {
  try {
    const response = await OrganizationsService.list();

    if (response.status === 200 && response.data.data) {
      return response.data.data.results || [];
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return [];
  }
}

async function getOrganization(orgId: string) {
  try {
    const response = await OrganizationsService.retrieve({ id: orgId });

    if (response.status === 200 && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return null;
  }
}

// ========================================
// 5. Example Usage Flow
// ========================================

async function exampleFlow() {
  // Login
  const user = await login('user@example.com', 'password123');
  console.log('User:', user);

  // Get current user
  const currentUser = await getCurrentUser();
  console.log('Current user:', currentUser);

  // Update profile
  await updateUserProfile({
    firstName: 'John',
    lastName: 'Doe',
  });

  // List organizations
  const orgs = await listOrganizations();
  console.log('Organizations:', orgs);

  // Logout
  await logout();
}

// Run the example (uncomment to test)
// exampleFlow();
