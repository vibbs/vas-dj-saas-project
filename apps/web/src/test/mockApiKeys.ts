/**
 * Mock API Keys Data
 * Used for development and testing while backend endpoints are being built
 */

// Define local types that match the service types
// These will be replaced with imports from @vas-dj-saas/api-client after rebuild
type ApiKeyScope = 'read' | 'write' | 'admin';
type ApiKeyStatus = 'active' | 'revoked' | 'expired';

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key?: string;
  keyHint: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  expiresAt?: string | null;
  createdAt: string;
  lastUsedAt?: string | null;
  createdBy: { id: string; email: string; name?: string };
  organizationId: string;
}

interface CreateApiKeyResponse extends ApiKey {
  key: string;
}

interface ApiKeyUsage {
  keyId: string;
  totalCalls: number;
  callsThisMonth: number;
  callsToday: number;
  rateLimitRemaining: number;
  rateLimitTotal: number;
  dailyUsage: { date: string; calls: number }[];
  topEndpoints: { endpoint: string; method: string; calls: number }[];
}

// Helper to generate mock dates
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

// Mock API Keys
export const mockApiKeys: ApiKey[] = [
  {
    id: 'ak_1a2b3c4d5e',
    name: 'Production API Key',
    description: 'Main production API key for the backend services',
    keyHint: '...x7K9',
    scopes: ['read', 'write', 'admin'],
    status: 'active',
    expiresAt: null,
    createdAt: daysAgo(90),
    lastUsedAt: hoursAgo(2),
    createdBy: {
      id: 'user_123',
      email: 'admin@example.com',
      name: 'John Admin',
    },
    organizationId: 'org_abc123',
  },
  {
    id: 'ak_2b3c4d5e6f',
    name: 'CI/CD Pipeline',
    description: 'Used for automated deployments and testing',
    keyHint: '...m2Lp',
    scopes: ['read', 'write'],
    status: 'active',
    expiresAt: daysAgo(-60), // 60 days from now
    createdAt: daysAgo(30),
    lastUsedAt: hoursAgo(1),
    createdBy: {
      id: 'user_123',
      email: 'admin@example.com',
      name: 'John Admin',
    },
    organizationId: 'org_abc123',
  },
  {
    id: 'ak_3c4d5e6f7g',
    name: 'Mobile App',
    description: 'API key for the mobile application',
    keyHint: '...n4Qr',
    scopes: ['read'],
    status: 'active',
    expiresAt: daysAgo(-90),
    createdAt: daysAgo(60),
    lastUsedAt: daysAgo(1),
    createdBy: {
      id: 'user_456',
      email: 'dev@example.com',
      name: 'Jane Developer',
    },
    organizationId: 'org_abc123',
  },
  {
    id: 'ak_4d5e6f7g8h',
    name: 'Legacy Integration',
    description: 'Old integration key - scheduled for deprecation',
    keyHint: '...p8Ts',
    scopes: ['read', 'write'],
    status: 'revoked',
    expiresAt: null,
    createdAt: daysAgo(180),
    lastUsedAt: daysAgo(45),
    createdBy: {
      id: 'user_789',
      email: 'former@example.com',
      name: 'Bob Former',
    },
    organizationId: 'org_abc123',
  },
  {
    id: 'ak_5e6f7g8h9i',
    name: 'Analytics Service',
    description: 'Read-only key for analytics dashboard',
    keyHint: '...r2Vw',
    scopes: ['read'],
    status: 'active',
    expiresAt: daysAgo(-30),
    createdAt: daysAgo(15),
    lastUsedAt: hoursAgo(6),
    createdBy: {
      id: 'user_123',
      email: 'admin@example.com',
      name: 'John Admin',
    },
    organizationId: 'org_abc123',
  },
];

// Mock usage data generator
export const generateMockUsage = (keyId: string): ApiKeyUsage => {
  const key = mockApiKeys.find(k => k.id === keyId);
  const isActive = key?.status === 'active';

  // Generate daily usage for the past 30 days
  const dailyUsage: { date: string; calls: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dailyUsage.push({
      date: date.toISOString().split('T')[0],
      calls: isActive ? Math.floor(Math.random() * 500) + 50 : 0,
    });
  }

  const callsThisMonth = dailyUsage.reduce((sum, day) => sum + day.calls, 0);
  const callsToday = dailyUsage[dailyUsage.length - 1].calls;

  return {
    keyId,
    totalCalls: isActive ? callsThisMonth * 3 + Math.floor(Math.random() * 10000) : 15420,
    callsThisMonth,
    callsToday,
    rateLimitRemaining: isActive ? 8500 : 10000,
    rateLimitTotal: 10000,
    dailyUsage,
    topEndpoints: isActive ? [
      { endpoint: '/api/v1/users', method: 'GET', calls: Math.floor(callsThisMonth * 0.35) },
      { endpoint: '/api/v1/organizations', method: 'GET', calls: Math.floor(callsThisMonth * 0.25) },
      { endpoint: '/api/v1/auth/verify', method: 'GET', calls: Math.floor(callsThisMonth * 0.20) },
      { endpoint: '/api/v1/members', method: 'POST', calls: Math.floor(callsThisMonth * 0.12) },
      { endpoint: '/api/v1/invites', method: 'POST', calls: Math.floor(callsThisMonth * 0.08) },
    ] : [],
  };
};

// Mock organization-wide usage
export const mockOrganizationUsage: ApiKeyUsage = {
  keyId: 'org_abc123',
  totalCalls: 125430,
  callsThisMonth: 28540,
  callsToday: 1250,
  rateLimitRemaining: 42500,
  rateLimitTotal: 50000,
  dailyUsage: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      calls: Math.floor(Math.random() * 1500) + 500,
    };
  }),
  topEndpoints: [
    { endpoint: '/api/v1/users', method: 'GET', calls: 9890 },
    { endpoint: '/api/v1/organizations', method: 'GET', calls: 7120 },
    { endpoint: '/api/v1/auth/verify', method: 'GET', calls: 5680 },
    { endpoint: '/api/v1/members', method: 'POST', calls: 3420 },
    { endpoint: '/api/v1/invites', method: 'POST', calls: 2430 },
  ],
};

// Generate a new mock API key (simulates creation response)
export const generateMockApiKey = (
  name: string,
  description: string | undefined,
  scopes: ApiKeyScope[],
  expiresAt: string | null
): CreateApiKeyResponse => {
  const id = `ak_${Math.random().toString(36).substring(2, 12)}`;
  const fullKey = `vdj_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

  return {
    id,
    name,
    description,
    key: fullKey,
    keyHint: `...${fullKey.slice(-4)}`,
    scopes,
    status: 'active',
    expiresAt,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    createdBy: {
      id: 'user_123',
      email: 'admin@example.com',
      name: 'Current User',
    },
    organizationId: 'org_abc123',
  };
};

// Calculate expiration date from expiration option
export const getExpirationDate = (expiration: 'never' | '30_days' | '90_days' | '1_year'): string | null => {
  if (expiration === 'never') return null;

  const date = new Date();
  switch (expiration) {
    case '30_days':
      date.setDate(date.getDate() + 30);
      break;
    case '90_days':
      date.setDate(date.getDate() + 90);
      break;
    case '1_year':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString();
};
