import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useOrganization } from './useOrganization';
import {
  mockOrganizations,
  createMockPaginatedResponse,
} from '@/test/mocks';

// Use vi.hoisted to ensure mock objects are available when vi.mock is hoisted
const { mockOrganizationsService } = vi.hoisted(() => ({
  mockOrganizationsService: {
    list: vi.fn(),
  },
}));

// Mock the auth module
vi.mock('@vas-dj-saas/auth', () => ({
  useAuthStatus: vi.fn(() => 'authenticated'),
}));

// Mock the api-client module
vi.mock('@vas-dj-saas/api-client', () => ({
  OrganizationsService: mockOrganizationsService,
}));

describe('useOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch organizations on mount when authenticated', async () => {
    mockOrganizationsService.list.mockResolvedValue(
      createMockPaginatedResponse(mockOrganizations)
    );

    const { result } = renderHook(() => useOrganization());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockOrganizationsService.list).toHaveBeenCalledTimes(1);
    expect(result.current.organizations).toEqual(mockOrganizations);
    expect(result.current.organization).toEqual(mockOrganizations[0]);
    expect(result.current.organizationId).toBe(mockOrganizations[0].id);
  });

  it('should return null organization when no organizations exist', async () => {
    mockOrganizationsService.list.mockResolvedValue(
      createMockPaginatedResponse([])
    );

    const { result } = renderHook(() => useOrganization());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.organization).toBeNull();
    expect(result.current.organizationId).toBeNull();
    expect(result.current.organizations).toEqual([]);
  });

  it('should handle API errors', async () => {
    mockOrganizationsService.list.mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useOrganization());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.organization).toBeNull();
  });

  it('should allow setting a different current organization', async () => {
    const secondOrg = { ...mockOrganizations[0], id: 'org-456', name: 'Second Org' };
    mockOrganizationsService.list.mockResolvedValue(
      createMockPaginatedResponse([mockOrganizations[0], secondOrg])
    );

    const { result } = renderHook(() => useOrganization());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initially selects first org
    expect(result.current.organization?.id).toBe(mockOrganizations[0].id);

    // Switch to second org
    act(() => {
      result.current.setCurrentOrganization(secondOrg);
    });

    expect(result.current.organization?.id).toBe(secondOrg.id);
    expect(result.current.organizationId).toBe(secondOrg.id);
  });

  it('should persist organization selection in localStorage', async () => {
    mockOrganizationsService.list.mockResolvedValue(
      createMockPaginatedResponse(mockOrganizations)
    );

    const { result } = renderHook(() => useOrganization());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'current-organization-id',
      mockOrganizations[0].id
    );
  });

  it('should restore organization selection from localStorage', async () => {
    const secondOrg = { ...mockOrganizations[0], id: 'org-456', name: 'Second Org' };
    mockOrganizationsService.list.mockResolvedValue(
      createMockPaginatedResponse([mockOrganizations[0], secondOrg])
    );

    // Simulate stored org ID
    vi.mocked(localStorage.getItem).mockReturnValue('org-456');

    const { result } = renderHook(() => useOrganization());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should restore the second org from storage
    expect(result.current.organization?.id).toBe('org-456');
  });

  it('should allow refreshing organizations', async () => {
    mockOrganizationsService.list.mockResolvedValue(
      createMockPaginatedResponse(mockOrganizations)
    );

    const { result } = renderHook(() => useOrganization());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockOrganizationsService.list).toHaveBeenCalledTimes(1);

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockOrganizationsService.list).toHaveBeenCalledTimes(2);
  });
});
