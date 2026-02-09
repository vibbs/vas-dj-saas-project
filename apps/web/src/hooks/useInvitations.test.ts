import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useInvitations } from './useInvitations';
import {
  mockInvites,
  mockInvite,
  createMockPaginatedResponse,
  createMockResponse,
} from '@/test/mocks';

// Use vi.hoisted to ensure mock objects are available when vi.mock is hoisted
const { mockInvitesService } = vi.hoisted(() => ({
  mockInvitesService: {
    list: vi.fn(),
    create: vi.fn(),
    retrieve: vi.fn(),
    resend: vi.fn(),
    delete: vi.fn(),
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
  InvitesService: mockInvitesService,
}));

describe('useInvitations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch invitations on mount', async () => {
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse(mockInvites)
    );

    const { result } = renderHook(() => useInvitations());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockInvitesService.list).toHaveBeenCalledWith('org-123');
    expect(result.current.invitations).toEqual(mockInvites);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty invitations list', async () => {
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse([])
    );

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.invitations).toEqual([]);
  });

  it('should handle API errors', async () => {
    mockInvitesService.list.mockRejectedValue({
      data: { detail: 'Permission denied' },
    });

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Permission denied');
    expect(result.current.invitations).toEqual([]);
  });

  it('should create a new invite', async () => {
    const newInvite = { ...mockInvite, id: 'invite-new', email: 'new@example.com' };
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse(mockInvites)
    );
    mockInvitesService.create.mockResolvedValue(
      createMockResponse(newInvite, 201)
    );

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Create invite
    let success: boolean;
    await act(async () => {
      success = await result.current.createInvite({
        email: 'new@example.com',
        role: 'member',
        message: 'Welcome!',
      });
    });

    expect(success!).toBe(true);
    expect(mockInvitesService.create).toHaveBeenCalledWith('org-123', {
      email: 'new@example.com',
      role: 'member',
      message: 'Welcome!',
    });
  });

  it('should handle create invite failure', async () => {
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse(mockInvites)
    );
    mockInvitesService.create.mockRejectedValue({
      data: { detail: 'User already invited' },
    });

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.createInvite({
        email: 'existing@example.com',
        role: 'member',
      });
    });

    expect(success!).toBe(false);
    expect(result.current.error).toBe('User already invited');
  });

  it('should resend an invite', async () => {
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse(mockInvites)
    );
    mockInvitesService.resend.mockResolvedValue(
      createMockResponse(mockInvite)
    );

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Resend invite
    let success: boolean;
    await act(async () => {
      success = await result.current.resendInvite('invite-1');
    });

    expect(success!).toBe(true);
    expect(mockInvitesService.resend).toHaveBeenCalledWith(
      'org-123',
      'invite-1',
      expect.objectContaining({
        email: mockInvite.email,
        organization: mockInvite.organization,
        invitedBy: mockInvite.invitedBy,
      })
    );
  });

  it('should return false when resending non-existent invite', async () => {
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse(mockInvites)
    );

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.resendInvite('non-existent-id');
    });

    expect(success!).toBe(false);
    expect(mockInvitesService.resend).not.toHaveBeenCalled();
  });

  it('should revoke an invite', async () => {
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse(mockInvites)
    );
    mockInvitesService.delete.mockResolvedValue(
      createMockResponse(null, 204)
    );

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.invitations).toHaveLength(1);

    // Revoke invite
    let success: boolean;
    await act(async () => {
      success = await result.current.revokeInvite('invite-1');
    });

    expect(success!).toBe(true);
    expect(mockInvitesService.delete).toHaveBeenCalledWith('org-123', 'invite-1');

    // Local state should be updated
    expect(result.current.invitations).toHaveLength(0);
  });

  it('should handle revoke failure', async () => {
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse(mockInvites)
    );
    mockInvitesService.delete.mockRejectedValue({
      data: { detail: 'Cannot revoke accepted invite' },
    });

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success: boolean;
    await act(async () => {
      success = await result.current.revokeInvite('invite-1');
    });

    expect(success!).toBe(false);
    expect(result.current.error).toBe('Cannot revoke accepted invite');
    // Invitations list should remain unchanged
    expect(result.current.invitations).toHaveLength(1);
  });

  it('should allow refreshing invitations', async () => {
    mockInvitesService.list.mockResolvedValue(
      createMockPaginatedResponse(mockInvites)
    );

    const { result } = renderHook(() => useInvitations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockInvitesService.list).toHaveBeenCalledTimes(1);

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockInvitesService.list).toHaveBeenCalledTimes(2);
  });
});
