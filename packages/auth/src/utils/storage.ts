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
 * React Native storage implementation (placeholder)
 * This will be implemented when AsyncStorage is available
 */
class ReactNativeStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    // TODO: Implement with AsyncStorage
    console.warn('ReactNativeStorageAdapter not implemented yet');
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.warn('ReactNativeStorageAdapter not implemented yet');
  }

  async removeItem(key: string): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.warn('ReactNativeStorageAdapter not implemented yet');
  }

  async clear(): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.warn('ReactNativeStorageAdapter not implemented yet');
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
  
  // Check if we're in React Native (AsyncStorage would be imported here)
  // if (typeof require !== 'undefined') {
  //   try {
  //     const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  //     return new ReactNativeStorageAdapter();
  //   } catch (error) {
  //     // AsyncStorage not available
  //   }
  // }
  
  // Fallback to memory storage
  console.warn('No persistent storage available, using memory storage');
  return new MemoryStorageAdapter();
}

// Create the storage instance
export const storage = createStorageAdapter();

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