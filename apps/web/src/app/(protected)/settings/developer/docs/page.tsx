'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  SecondarySidebar,
  Card,
  Heading,
  Text,
  Button,
  Icon,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';

// API endpoint documentation data
const API_ENDPOINTS = [
  {
    category: 'Authentication',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/auth/register/',
        description: 'Register a new user and create an organization',
        auth: false,
      },
      {
        method: 'POST',
        path: '/api/v1/auth/login/',
        description: 'Authenticate and receive JWT tokens',
        auth: false,
      },
      {
        method: 'POST',
        path: '/api/v1/auth/refresh/',
        description: 'Refresh access token using refresh token',
        auth: false,
      },
      {
        method: 'POST',
        path: '/api/v1/auth/logout/',
        description: 'Logout and invalidate refresh token',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/v1/auth/verify/',
        description: 'Verify current JWT token is valid',
        auth: true,
      },
    ],
  },
  {
    category: 'Users',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/accounts/users/',
        description: 'List all users (admin only)',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/v1/accounts/users/me/',
        description: 'Get current authenticated user',
        auth: true,
      },
      {
        method: 'PATCH',
        path: '/api/v1/accounts/users/me/',
        description: 'Update current user profile',
        auth: true,
      },
    ],
  },
  {
    category: 'Organizations',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/organizations/',
        description: 'List organizations the user belongs to',
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/v1/organizations/',
        description: 'Create a new organization',
        auth: true,
      },
      {
        method: 'GET',
        path: '/api/v1/organizations/{id}/',
        description: 'Get organization details',
        auth: true,
      },
      {
        method: 'PATCH',
        path: '/api/v1/organizations/{id}/',
        description: 'Update organization settings',
        auth: true,
      },
    ],
  },
  {
    category: 'Members',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/organizations/{org_id}/members/',
        description: 'List organization members',
        auth: true,
      },
      {
        method: 'PATCH',
        path: '/api/v1/organizations/{org_id}/members/{id}/',
        description: 'Update member role or status',
        auth: true,
      },
      {
        method: 'DELETE',
        path: '/api/v1/organizations/{org_id}/members/{id}/',
        description: 'Remove member from organization',
        auth: true,
      },
    ],
  },
  {
    category: 'Invitations',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/organizations/{org_id}/invites/',
        description: 'List pending invitations',
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/v1/organizations/{org_id}/invites/',
        description: 'Send invitation to join organization',
        auth: true,
      },
      {
        method: 'DELETE',
        path: '/api/v1/organizations/{org_id}/invites/{id}/',
        description: 'Cancel pending invitation',
        auth: true,
      },
    ],
  },
];

const CODE_EXAMPLES = {
  authentication: `// Authentication with API Key
const response = await fetch('https://api.example.com/api/v1/users/me/', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'X-Org-Id': 'your-organization-id'
  }
});

const user = await response.json();`,

  listMembers: `// List organization members
const response = await fetch(
  'https://api.example.com/api/v1/organizations/{org_id}/members/',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const { results, count, next } = await response.json();`,

  createInvite: `// Send an invitation
const response = await fetch(
  'https://api.example.com/api/v1/organizations/{org_id}/invites/',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'newuser@example.com',
      role: 'member'
    })
  }
);

const invitation = await response.json();`,

  errorHandling: `// Error handling
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    // Error format: { detail: string, code?: string }
    throw new Error(error.detail);
  }

  return await response.json();
} catch (error) {
  console.error('API Error:', error.message);
}`,
};

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET: { bg: 'rgba(34, 197, 94, 0.2)', text: '#16a34a' },
  POST: { bg: 'rgba(59, 130, 246, 0.2)', text: '#2563eb' },
  PUT: { bg: 'rgba(245, 158, 11, 0.2)', text: '#d97706' },
  PATCH: { bg: 'rgba(168, 85, 247, 0.2)', text: '#9333ea' },
  DELETE: { bg: 'rgba(239, 68, 68, 0.2)', text: '#dc2626' },
};

/**
 * API Documentation Page
 *
 * Provides:
 * - Quick links to Swagger/ReDoc
 * - Endpoint reference
 * - Authentication guide
 * - Code examples
 *
 * URL: /settings/developer/docs
 */
export default function ApiDocsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('endpoints');

  // Get developer settings config
  const devConfig = React.useMemo(() => {
    return navigationConfig.sections
      .find(s => s.id === 'settings')
      ?.items.find(i => i.id === 'settings-developer');
  }, []);

  const handleNavigate = React.useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const openExternalDocs = (type: 'swagger' | 'redoc') => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = type === 'swagger' ? `${baseUrl}/api/docs/` : `${baseUrl}/api/redoc/`;
    window.open(url, '_blank');
  };

  if (!devConfig?.secondarySidebar) {
    return (
      <div className="flex-1 p-6">
        <p className="text-red-500">
          Error: Secondary sidebar configuration not found.
        </p>
      </div>
    );
  }

  const secondarySidebarConfig = convertToSecondarySidebarConfig(devConfig.secondarySidebar);

  return (
    <div className="flex flex-1">
      {/* Secondary Sidebar */}
      <SecondarySidebar
        config={secondarySidebarConfig}
        activePath={pathname}
        onNavigate={handleNavigate}
        mode="sidebar"
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Heading level={3}>API Documentation</Heading>
              <Text color="muted" size="sm">
                Interactive API reference and code examples for integrating with our platform
              </Text>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => openExternalDocs('swagger')}
              >
                <Icon name="ExternalLink" size={16} />
                <span style={{ marginLeft: '6px' }}>Swagger UI</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => openExternalDocs('redoc')}
              >
                <Icon name="ExternalLink" size={16} />
                <span style={{ marginLeft: '6px' }}>ReDoc</span>
              </Button>
            </div>
          </div>

          {/* Base URL Card */}
          <Card>
            <div style={{ padding: '16px' }}>
              <Text size="sm" color="muted" style={{ margin: 0, marginBottom: '8px' }}>
                Base URL
              </Text>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'var(--color-muted, #f4f4f5)',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                }}
              >
                <code style={{ flex: 1 }}>
                  {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                    );
                  }}
                >
                  <Icon name="Copy" size={16} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="examples">Code Examples</TabsTrigger>
            </TabsList>

            {/* Endpoints Tab */}
            <TabsContent value="endpoints">
              <div className="space-y-6 mt-4">
                {API_ENDPOINTS.map(category => (
                  <Card key={category.category}>
                    <div style={{ padding: '20px' }}>
                      <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                        {category.category}
                      </Heading>
                      <div className="space-y-2">
                        {category.endpoints.map(endpoint => (
                          <div
                            key={`${endpoint.method}-${endpoint.path}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px',
                              backgroundColor: 'var(--color-muted, #f4f4f5)',
                              borderRadius: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  borderRadius: '4px',
                                  minWidth: '60px',
                                  textAlign: 'center',
                                  backgroundColor: METHOD_COLORS[endpoint.method]?.bg,
                                  color: METHOD_COLORS[endpoint.method]?.text,
                                }}
                              >
                                {endpoint.method}
                              </span>
                              <code style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                                {endpoint.path}
                              </code>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Text color="muted" size="sm" style={{ margin: 0 }}>
                                {endpoint.description}
                              </Text>
                              {endpoint.auth && (
                                <Badge variant="secondary" size="sm">
                                  Auth
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Authentication Tab */}
            <TabsContent value="authentication">
              <div className="space-y-6 mt-4">
                <Card>
                  <div style={{ padding: '20px' }}>
                    <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                      API Key Authentication
                    </Heading>
                    <Text style={{ margin: 0, marginBottom: '16px' }}>
                      Include your API key in the Authorization header of all requests:
                    </Text>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--color-muted, #f4f4f5)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                      }}
                    >
                      <code>Authorization: Bearer YOUR_API_KEY</code>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: '20px' }}>
                    <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                      Multi-Tenant Requests
                    </Heading>
                    <Text style={{ margin: 0, marginBottom: '16px' }}>
                      For organization-scoped endpoints, include the organization ID header:
                    </Text>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--color-muted, #f4f4f5)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                      }}
                    >
                      <code>X-Org-Id: your-organization-id</code>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: '20px' }}>
                    <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                      Rate Limits
                    </Heading>
                    <Text style={{ margin: 0, marginBottom: '12px' }}>
                      API requests are rate limited based on your subscription plan:
                    </Text>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>
                        <Text size="sm" style={{ margin: 0 }}>
                          <strong>Free:</strong> 1,000 requests/day
                        </Text>
                      </li>
                      <li>
                        <Text size="sm" style={{ margin: 0 }}>
                          <strong>Pro:</strong> 10,000 requests/day
                        </Text>
                      </li>
                      <li>
                        <Text size="sm" style={{ margin: 0 }}>
                          <strong>Enterprise:</strong> Unlimited
                        </Text>
                      </li>
                    </ul>
                    <Text color="muted" size="sm" style={{ margin: 0, marginTop: '12px' }}>
                      Rate limit status is returned in response headers: X-RateLimit-Remaining,
                      X-RateLimit-Reset
                    </Text>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: '20px' }}>
                    <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                      Error Responses
                    </Heading>
                    <Text style={{ margin: 0, marginBottom: '16px' }}>
                      All error responses follow a consistent format:
                    </Text>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--color-muted, #f4f4f5)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        whiteSpace: 'pre',
                      }}
                    >
                      {`{
  "detail": "Error message description",
  "code": "ERROR_CODE" // optional
}`}
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <Text size="sm" style={{ margin: 0, marginBottom: '8px', fontWeight: 500 }}>
                        Common HTTP Status Codes:
                      </Text>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>
                          <Text size="sm" style={{ margin: 0 }}>
                            <code>401</code> - Unauthorized (invalid or missing API key)
                          </Text>
                        </li>
                        <li>
                          <Text size="sm" style={{ margin: 0 }}>
                            <code>403</code> - Forbidden (insufficient permissions)
                          </Text>
                        </li>
                        <li>
                          <Text size="sm" style={{ margin: 0 }}>
                            <code>404</code> - Resource not found
                          </Text>
                        </li>
                        <li>
                          <Text size="sm" style={{ margin: 0 }}>
                            <code>429</code> - Rate limit exceeded
                          </Text>
                        </li>
                        <li>
                          <Text size="sm" style={{ margin: 0 }}>
                            <code>500</code> - Internal server error
                          </Text>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Code Examples Tab */}
            <TabsContent value="examples">
              <div className="space-y-6 mt-4">
                <Card>
                  <div style={{ padding: '20px' }}>
                    <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                      Making Authenticated Requests
                    </Heading>
                    <pre
                      style={{
                        padding: '16px',
                        backgroundColor: '#1e1e1e',
                        borderRadius: '8px',
                        color: '#d4d4d4',
                        fontSize: '13px',
                        overflow: 'auto',
                        margin: 0,
                      }}
                    >
                      <code>{CODE_EXAMPLES.authentication}</code>
                    </pre>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: '20px' }}>
                    <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                      Listing Organization Members
                    </Heading>
                    <pre
                      style={{
                        padding: '16px',
                        backgroundColor: '#1e1e1e',
                        borderRadius: '8px',
                        color: '#d4d4d4',
                        fontSize: '13px',
                        overflow: 'auto',
                        margin: 0,
                      }}
                    >
                      <code>{CODE_EXAMPLES.listMembers}</code>
                    </pre>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: '20px' }}>
                    <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                      Sending an Invitation
                    </Heading>
                    <pre
                      style={{
                        padding: '16px',
                        backgroundColor: '#1e1e1e',
                        borderRadius: '8px',
                        color: '#d4d4d4',
                        fontSize: '13px',
                        overflow: 'auto',
                        margin: 0,
                      }}
                    >
                      <code>{CODE_EXAMPLES.createInvite}</code>
                    </pre>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: '20px' }}>
                    <Heading level={4} style={{ margin: 0, marginBottom: '16px' }}>
                      Error Handling
                    </Heading>
                    <pre
                      style={{
                        padding: '16px',
                        backgroundColor: '#1e1e1e',
                        borderRadius: '8px',
                        color: '#d4d4d4',
                        fontSize: '13px',
                        overflow: 'auto',
                        margin: 0,
                      }}
                    >
                      <code>{CODE_EXAMPLES.errorHandling}</code>
                    </pre>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* SDKs Coming Soon */}
          <Card>
            <div
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-muted, #f4f4f5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="Package" size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heading level={4} style={{ margin: 0 }}>
                      SDKs & Libraries
                    </Heading>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <Text color="muted" size="sm" style={{ margin: 0 }}>
                    Official client libraries for JavaScript, Python, and more
                  </Text>
                </div>
              </div>
              <Button variant="outline" disabled>
                View SDKs
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
