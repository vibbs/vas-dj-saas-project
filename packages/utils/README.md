# @vas-dj-saas/utils - Shared Utility Functions

A comprehensive collection of utility functions shared across the VAS-DJ SaaS monorepo, providing consistent helper functions for common operations across web, mobile, and server environments.

## 🚀 Quick Start

```bash
# Install the package
pnpm add @vas-dj-saas/utils

# No runtime dependencies required
```

### Basic Usage
```typescript
import { 
  formatDate, 
  isValidEmail, 
  capitalize, 
  groupBy 
} from '@vas-dj-saas/utils';

// Format dates consistently
const formattedDate = formatDate(new Date());
// "December 8, 2024"

// Validate email addresses
const isValid = isValidEmail('user@example.com'); // true

// Capitalize strings
const capitalized = capitalize('hello world'); // "Hello world"

// Group arrays by key
const usersByRole = groupBy(users, user => user.role);
```

## 📦 Available Utilities

### Date & Time Utilities

#### Date Formatting
```typescript
import { formatDate, formatDateTime } from '@vas-dj-saas/utils';

// Format date only
const dateStr = formatDate('2024-12-08T10:30:00Z');
// "December 8, 2024"

const dateObj = formatDate(new Date());
// "December 8, 2024"

// Format date and time
const dateTimeStr = formatDateTime('2024-12-08T10:30:00Z');
// "Dec 8, 2024, 10:30 AM"

const dateTimeObj = formatDateTime(new Date());
// "Dec 8, 2024, 10:30 AM"
```

#### Relative Date Utilities
```typescript
// Calculate relative time differences
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInMs = now.getTime() - then.getTime();
  
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

// Usage
const timeAgo = getRelativeTime('2024-12-07T10:30:00Z');
// "1 day ago"
```

#### Date Range Utilities
```typescript
// Check if date is within range
export const isDateInRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

// Get date range
export const getDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return { start, end };
};
```

### String Utilities

#### Text Formatting
```typescript
import { capitalize, truncate } from '@vas-dj-saas/utils';

// Capitalize first letter
const capitalized = capitalize('hello world');
// "Hello world"

// Truncate long text
const truncated = truncate('This is a very long text that needs truncation', 20);
// "This is a very long..."

// Additional string utilities
export const camelCase = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
};

export const kebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
};

export const snakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
};
```

#### Text Analysis
```typescript
// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

// Generate slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Extract mentions from text
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};
```

### Validation Utilities

#### Email and Password Validation
```typescript
import { isValidEmail, isValidPassword } from '@vas-dj-saas/utils';

// Email validation
const emailValid = isValidEmail('user@example.com'); // true
const emailInvalid = isValidEmail('invalid-email'); // false

// Password validation (8+ chars, 1 upper, 1 lower, 1 number)
const passwordValid = isValidPassword('Password123'); // true
const passwordInvalid = isValidPassword('weak'); // false
```

#### Additional Validation
```typescript
// Phone number validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const num = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};
```

### Object Utilities

#### Object Manipulation
```typescript
import { omit, pick } from '@vas-dj-saas/utils';

const user = {
  id: '123',
  email: 'user@example.com',
  password: 'secret',
  firstName: 'John',
  lastName: 'Doe',
};

// Remove specific properties
const publicUser = omit(user, ['password']);
// { id: '123', email: 'user@example.com', firstName: 'John', lastName: 'Doe' }

// Select specific properties
const nameOnly = pick(user, ['firstName', 'lastName']);
// { firstName: 'John', lastName: 'Doe' }
```

#### Advanced Object Operations
```typescript
// Deep merge objects
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Get nested property safely
export const get = (obj: any, path: string, defaultValue?: any): any => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) return defaultValue;
  }
  
  return result;
};

// Set nested property
export const set = (obj: any, path: string, value: any): void => {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
};
```

### Array Utilities

#### Array Grouping and Sorting
```typescript
import { groupBy } from '@vas-dj-saas/utils';

const users = [
  { name: 'John', role: 'admin', age: 30 },
  { name: 'Jane', role: 'user', age: 25 },
  { name: 'Bob', role: 'admin', age: 35 },
];

// Group by property
const usersByRole = groupBy(users, user => user.role);
// { admin: [{ name: 'John', ... }, { name: 'Bob', ... }], user: [{ name: 'Jane', ... }] }

// Sort by multiple criteria
export const sortBy = <T>(
  array: T[],
  ...criteria: Array<(item: T) => any>
): T[] => {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      const aVal = criterion(a);
      const bVal = criterion(b);
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
};

const sortedUsers = sortBy(users, user => user.role, user => user.age);
```

#### Array Manipulation
```typescript
// Remove duplicates
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

// Remove duplicates by key
export const uniqueBy = <T>(array: T[], keyFn: (item: T) => any): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Chunk array into smaller arrays
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Flatten nested arrays
export const flatten = <T>(array: (T | T[])[]): T[] => {
  return array.reduce<T[]>((acc, item) => {
    return acc.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
};
```

### Storage Utilities

#### Cross-Platform Storage
```typescript
import { storage } from '@vas-dj-saas/utils';

// Works on both web and React Native (when configured)
storage.set('user_preference', 'dark_theme');
const preference = storage.get('user_preference'); // 'dark_theme'
storage.remove('user_preference');
storage.clear(); // Clear all storage
```

#### Advanced Storage Utilities
```typescript
// JSON storage helpers
export const jsonStorage = {
  get: <T>(key: string): T | null => {
    try {
      const item = storage.get(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  },
  
  remove: (key: string): void => {
    storage.remove(key);
  },
};

// Storage with expiration
export const expiringStorage = {
  set: (key: string, value: any, expirationMs: number): void => {
    const item = {
      value,
      expiration: Date.now() + expirationMs,
    };
    jsonStorage.set(key, item);
  },
  
  get: (key: string): any => {
    const item = jsonStorage.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiration) {
      storage.remove(key);
      return null;
    }
    
    return item.value;
  },
};
```

### Platform Detection Utilities

#### Environment Detection
```typescript
// Platform detection
export const platform = {
  isWeb: typeof window !== 'undefined',
  isReactNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',
  isNode: typeof process !== 'undefined' && process.versions?.node,
  isMobile: typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isIOS: typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: typeof window !== 'undefined' && /Android/.test(navigator.userAgent),
};

// Browser detection
export const browser = {
  isChrome: typeof window !== 'undefined' && /Chrome/.test(navigator.userAgent),
  isFirefox: typeof window !== 'undefined' && /Firefox/.test(navigator.userAgent),
  isSafari: typeof window !== 'undefined' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
  isEdge: typeof window !== 'undefined' && /Edge/.test(navigator.userAgent),
};

// Feature detection
export const features = {
  hasLocalStorage: (() => {
    try {
      const test = 'localStorage-test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  })(),
  
  hasGeolocation: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  hasCamera: typeof navigator !== 'undefined' && 'mediaDevices' in navigator,
  hasNotifications: typeof window !== 'undefined' && 'Notification' in window,
};
```

### Performance Utilities

#### Debounce and Throttle
```typescript
// Debounce function execution
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function execution
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
```

### Async Utilities

#### Promise Utilities
```typescript
// Sleep/delay utility
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry with exponential backoff
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number;
    delay?: number;
    factor?: number;
    maxDelay?: number;
  } = {}
): Promise<T> => {
  const { attempts = 3, delay = 1000, factor = 2, maxDelay = 30000 } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === attempts) break;
      
      const waitTime = Math.min(delay * Math.pow(factor, attempt - 1), maxDelay);
      await sleep(waitTime);
    }
  }
  
  throw lastError!;
};

// Timeout wrapper
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
    }),
  ]);
};
```

## 🔧 Platform-Specific Usage

### Web Browser
```typescript
import { platform, features, browser } from '@vas-dj-saas/utils';

if (platform.isWeb) {
  // Web-specific logic
  if (features.hasLocalStorage) {
    storage.set('theme', 'dark');
  }
  
  if (browser.isChrome) {
    // Chrome-specific optimizations
  }
}
```

### React Native
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '@vas-dj-saas/utils';

// Configure storage for React Native
if (platform.isReactNative) {
  // Override storage implementation
  Object.assign(storage, {
    get: async (key: string) => await AsyncStorage.getItem(key),
    set: async (key: string, value: string) => await AsyncStorage.setItem(key, value),
    remove: async (key: string) => await AsyncStorage.removeItem(key),
    clear: async () => await AsyncStorage.clear(),
  });
}
```

### Node.js/Server
```typescript
import { platform } from '@vas-dj-saas/utils';

if (platform.isNode) {
  // Server-specific utilities
  const processEnvUtils = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTesting: process.env.NODE_ENV === 'test',
    
    getEnvVar: (key: string, defaultValue?: string): string => {
      return process.env[key] || defaultValue || '';
    },
  };
}
```

## 🧪 Testing Utilities

### Mock Helpers
```typescript
// Generate mock data
export const generateMockId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateMockEmail = (domain = 'example.com'): string => {
  const username = Math.random().toString(36).substr(2, 8);
  return `${username}@${domain}`;
};

export const generateMockName = (): { firstName: string; lastName: string } => {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
  const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Davis', 'Wilson'];
  
  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
  };
};
```

## 📚 Related Documentation

- **[TypeScript Types](../types/README.md)** - Shared type definitions used by utilities
- **[Authentication](../auth/README.md)** - Auth utilities and validation
- **[API Client](../api-client/README.md)** - API utilities and helpers
- **[UI Components](../ui/README.md)** - UI-related utility functions
- **[Web App](../../apps/web/README.md)** - Web-specific utility usage
- **[Mobile App](../../apps/mobile/README.md)** - Mobile-specific utility usage

## 🤝 Contributing

### Adding New Utilities
1. **Organize by Category**: Group related functions together
2. **Type Safety**: Provide comprehensive TypeScript types
3. **Cross-Platform**: Ensure utilities work across all platforms
4. **Documentation**: Include JSDoc comments and usage examples
5. **Testing**: Write unit tests for all utility functions

### Development Guidelines
1. **Pure Functions**: Prefer pure functions without side effects
2. **Performance**: Consider performance implications of utilities
3. **Browser Support**: Ensure compatibility with target browsers
4. **Error Handling**: Handle edge cases gracefully
5. **Consistency**: Follow established patterns and naming conventions

### Testing Utilities
```typescript
import { formatDate, isValidEmail, groupBy } from '@vas-dj-saas/utils';

describe('Date utilities', () => {
  test('formatDate formats dates correctly', () => {
    const date = new Date('2024-12-08T10:30:00Z');
    expect(formatDate(date)).toBe('December 8, 2024');
  });
});

describe('Validation utilities', () => {
  test('isValidEmail validates email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});

describe('Array utilities', () => {
  test('groupBy groups items by key function', () => {
    const items = [
      { name: 'A', type: 'X' },
      { name: 'B', type: 'Y' },
      { name: 'C', type: 'X' },
    ];
    
    const grouped = groupBy(items, item => item.type);
    expect(grouped.X).toHaveLength(2);
    expect(grouped.Y).toHaveLength(1);
  });
});
```