import { vi } from 'vitest';
import type { Organization, OrganizationMembership, Invite } from '@vas-dj-saas/api-client';

// Mock data
export const mockOrganization: Organization = {
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-org',
  description: 'A test organization',
  logo: null,
  subDomain: 'test',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  memberCount: 5,
  subscriptionStatus: 'active',
};

export const mockOrganizations: Organization[] = [mockOrganization];

export const mockMember: OrganizationMembership = {
  id: 'member-1',
  organization: 'org-123',
  organizationName: 'Test Organization',
  user: 'user-1',
  userEmail: 'john@example.com',
  userName: 'John Doe',
  role: 'member',
  status: 'active',
  joinedAt: '2024-01-15T00:00:00Z',
  invitedBy: 'user-0',
  invitedByEmail: 'admin@example.com',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

export const mockMembers: OrganizationMembership[] = [
  mockMember,
  {
    ...mockMember,
    id: 'member-2',
    user: 'user-2',
    userEmail: 'jane@example.com',
    userName: 'Jane Smith',
    role: 'admin',
  },
];

export const mockInvite: Invite = {
  id: 'invite-1',
  organization: 'org-123',
  organizationName: 'Test Organization',
  email: 'newuser@example.com',
  role: 'member',
  status: 'pending',
  invitedBy: 'user-0',
  invitedByEmail: 'admin@example.com',
  invitedByName: 'Admin User',
  message: 'Welcome to the team!',
  expiresAt: '2024-02-01T00:00:00Z',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  acceptUrl: 'https://app.example.com/invite/accept?token=abc123',
  isValid: true,
  isExpired: false,
  acceptedAt: null,
  acceptedBy: null,
};

export const mockInvites: Invite[] = [mockInvite];

// Mock API responses
export const createMockResponse = <T>(data: T, status = 200) => ({
  status,
  data,
  headers: {},
});

export const createMockPaginatedResponse = <T>(results: T[], status = 200) => ({
  status,
  data: {
    count: results.length,
    next: null,
    previous: null,
    results,
  },
  headers: {},
});

// Mock services
export const createMockOrganizationsService = () => ({
  list: vi.fn().mockResolvedValue(createMockPaginatedResponse(mockOrganizations)),
  getById: vi.fn().mockResolvedValue(createMockResponse(mockOrganization)),
  create: vi.fn().mockResolvedValue(createMockResponse(mockOrganization, 201)),
  update: vi.fn().mockResolvedValue(createMockResponse(mockOrganization)),
  patch: vi.fn().mockResolvedValue(createMockResponse(mockOrganization)),
  delete: vi.fn().mockResolvedValue(createMockResponse(null, 204)),
});

export const createMockMembersService = () => ({
  list: vi.fn().mockResolvedValue(createMockPaginatedResponse(mockMembers)),
  retrieve: vi.fn().mockResolvedValue(createMockResponse(mockMember)),
  update: vi.fn().mockResolvedValue(createMockResponse(mockMember)),
  remove: vi.fn().mockResolvedValue(createMockResponse(null, 204)),
});

export const createMockInvitesService = () => ({
  list: vi.fn().mockResolvedValue(createMockPaginatedResponse(mockInvites)),
  create: vi.fn().mockResolvedValue(createMockResponse(mockInvite, 201)),
  retrieve: vi.fn().mockResolvedValue(createMockResponse(mockInvite)),
  resend: vi.fn().mockResolvedValue(createMockResponse(mockInvite)),
  delete: vi.fn().mockResolvedValue(createMockResponse(null, 204)),
});
