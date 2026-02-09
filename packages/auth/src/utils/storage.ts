// Platform-agnostic storage utilities for authentication

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Web storage implementation using localStorage
 */
class WebStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set item in localStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove item from localStorage:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

/**
 * React Native storage implementation using SecureStore
 */
class ReactNativeStorageAdapter implements StorageAdapter {
  private SecureStore: any = null;

  constructor() {
    try {
      // Try to import SecureStore (this will fail on web, which is expected)
      this.SecureStore = require('expo-secure-store');
    } catch (error) {
      // SecureStore not available, will fall back to memory storage
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.SecureStore) return null;
    
    try {
      return await this.SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('Failed to get item from SecureStore:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.SecureStore) return;
    
    try {
      await this.SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('Failed to set item in SecureStore:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.SecureStore) return;
    
    try {
      await this.SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('Failed to remove item from SecureStore:', error);
    }
  }

  async clear(): Promise<void> {
    // SecureStore doesn't have a clear method, so we'd need to track keys
    console.warn('Clear not implemented for SecureStore');
  }
}

/**
 * Memory storage implementation (fallback)
 */
class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

/**
 * Get the appropriate storage adapter for the current platform
 */
function createStorageAdapter(): StorageAdapter {
  // Check if we're in a web environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return new WebStorageAdapter();
  }
  
  // Check if we're in React Native/Expo environment
  if (typeof require !== 'undefined') {
    try {
      // Try to import SecureStore to check if we're in Expo
      require('expo-secure-store');
      return new ReactNativeStorageAdapter();
    } catch (error) {
      // SecureStore not available, continue to fallback
    }
  }
  
  // Fallback to memory storage
  console.warn('No persistent storage available, using memory storage');
  return new MemoryStorageAdapter();
}

// Create the storage instance
export const storage = createStorageAdapter();

/**
 * Create storage for Zustand persist middleware
 */
export function createStorage() {
  const adapter = createStorageAdapter();
  
  return {
    getItem: (name: string) => adapter.getItem(name),
    setItem: (name: string, value: string) => adapter.setItem(name, value),
    removeItem: (name: string) => adapter.removeItem(name),
  };
}

/**
 * Authentication-specific storage keys
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'vas_dj_access_token',
  REFRESH_TOKEN: 'vas_dj_refresh_token',
  USER_DATA: 'vas_dj_user_data',
  ORGANIZATION_DATA: 'vas_dj_organization_data',
  REMEMBER_EMAIL: 'vas_dj_remember_email',
} as const;

/**
 * Helper functions for authentication storage
 */
export const authStorage = {
  async getAccessToken(): Promise<string | null> {
    return storage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    return storage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return storage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    return storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const [accessToken, refreshToken] = await Promise.all([
      storage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
      storage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
    ]);

    return { accessToken, refreshToken };
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      storage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      storage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
      storage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },

  async getUserData(): Promise<string | null> {
    return storage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
  },

  async setUserData(userData: string): Promise<void> {
    return storage.setItem(AUTH_STORAGE_KEYS.USER_DATA, userData);
  },

  async clearUserData(): Promise<void> {
    return storage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
  },

  async getOrganizationData(): Promise<string | null> {
    return storage.getItem(AUTH_STORAGE_KEYS.ORGANIZATION_DATA);
  },

  async setOrganizationData(orgData: string): Promise<void> {
    return storage.setItem(AUTH_STORAGE_KEYS.ORGANIZATION_DATA, orgData);
  },

  async clearOrganizationData(): Promise<void> {
    return storage.removeItem(AUTH_STORAGE_KEYS.ORGANIZATION_DATA);
  },

  async getRememberedEmail(): Promise<string | null> {
    return storage.getItem(AUTH_STORAGE_KEYS.REMEMBER_EMAIL);
  },

  async setRememberedEmail(email: string): Promise<void> {
    return storage.setItem(AUTH_STORAGE_KEYS.REMEMBER_EMAIL, email);
  },

  async clearRememberedEmail(): Promise<void> {
    return storage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_EMAIL);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      storage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
      storage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
      storage.removeItem(AUTH_STORAGE_KEYS.USER_DATA),
      storage.removeItem(AUTH_STORAGE_KEYS.ORGANIZATION_DATA),
      // Don't clear remembered email as user might want to keep it
    ]);
  },
};