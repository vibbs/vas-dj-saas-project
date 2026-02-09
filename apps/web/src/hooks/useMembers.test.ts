import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMembers } from './useMembers';
import {
  mockMembers,
  mockMember,
  createMockPaginatedResponse,
  createMockResponse,
} from '@/test/mocks';

// Use vi.hoisted to ensure mock objects are available when vi.mock is hoisted
const { mockMembersService } = vi.hoisted(() => ({
  mockMembersService: {
    list: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock the useOrganization hook
vi.mock('./useOrganization', () => ({
  useOrganization: vi.fn(() => ({
    organizationId: 'org-123',
    organization: { id: 'org-123', name: 'Test Org' },
    isLoading: false,
    error: null,
  })),
}));

// Mock the api-client module
vi.mock('@vas-dj-saas/api-client', () => ({
  MembersService: mockMembersService,
}));

describe('useMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch members on mount', async () => {
    mockMembersService.list.mockResolvedValue(
      createMockPaginatedResponse(mockMembers)
    );

    const { result } = renderHook(() => useMembers());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockMembersService.list).toHaveBeenCalledWith('org-123');
    expect(result.current.members).toEqual(mockMembers);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty members list', async () => {
    mockMembersService.list.mockResolvedValue(
      createMockPaginatedResponse([])
    );

    const { result } = renderHook(() => useMembers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.members).toEqual([]);
  });

  it('should handle API errors', async () => {
    mockMembersService.list.mockRejectedValue({
      data: { detail: 'Permission denied' },
    });

    const { result } = renderHook(() => useMembers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Permission denied');
    expect(result.current.members).toEqual([]);
  });

  it('should update member role', async () => {
    mockMembersService.list.mockResolvedValue(
      createMockPaginatedResponse(mockMembers)
    );
    mockMembersService.update.mockResolvedValue(
      createMockResponse({ ...mockMember, role: 'admin' })
    );

    const { result } = renderHook(() => useMembers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Update role
    let success: boolean;
    await act(async () => {
      success = await result.current.updateRole('member-1', 'admin');
    });

    expect(success!).toBe(true);
    expect(mockMembersService.update).toHaveBeenCalledWith('org-123', 'member-1', { role: 'admin' });

    // Local state should be updated
    const updatedMember = result.current.members.find(m => m.id === 'member-1');
    expect(updatedMember?.role).toBe('admin');
  });

  it('should update member status', async () => {
    mockMembersService.list.mockResolvedValue(
      createMockPaginatedResponse(mockMembers)
    );
    mockMembersService.update.mockResolvedValue(
      createMockResponse({ ...mockMember, status: 'suspended' })
    );

    const { result } = renderHook(() => useMembers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Update status
    let success: boolean;
    await act(async () => {
      success = await result.current.updateStatus('member-1', 'suspended');
    });

    expect(success!).toBe(true);
    expect(mockMembersService.update).toHaveBeenCalledWith('org-123', 'member-1', { status: 'suspended' });

    // Local state should be updated
    const updatedMember = result.current.members.find(m => m.id === 'member-1');
    expect(updatedMember?.status).toBe('suspended');
  });

  it('should remove member', async () => {
    mockMembersService.list.mockResolvedValue(
      createMockPaginatedResponse(mockMembers)
    );
    mockMembersService.remove.mockResolvedValue(
      createMockResponse(null, 204)
    );

    const { result } = renderHook(() => useMembers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.members).toHaveLength(2);

    // Remove member
    let success: boolean;
    await act(async () => {
      success = await result.current.removeMember('member-1');
    });

    expect(success!).toBe(true);
    expect(mockMembersService.remove).toHaveBeenCalledWith('org-123', 'member-1');

    // Local state should be updated
    expect(result.current.members).toHaveLength(1);
    expect(result.current.members.find(m => m.id === 'member-1')).toBeUndefined();
  });

  it('should handle update failure', async () => {
    mockMembersService.list.mockResolvedValue(
      createMockPaginatedResponse(mockMembers)
    );
    mockMembersService.update.mockRejectedValue({
      data: { detail: 'Cannot change owner role' },
    });

    const { result } = renderHook(() => useMembers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.updateRole('member-1', 'owner');
    });

    expect(success!).toBe(false);
    expect(result.current.error).toBe('Cannot change owner role');
  });

  it('should allow refreshing members', async () => {
    mockMembersService.list.mockResolvedValue(
      createMockPaginatedResponse(mockMembers)
    );

    const { result } = renderHook(() => useMembers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockMembersService.list).toHaveBeenCalledTimes(1);

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockMembersService.list).toHaveBeenCalledTimes(2);
  });
});
