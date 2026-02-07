import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InviteMemberModal } from './InviteMemberModal';

// Mock the UI components
vi.mock('@vas-dj-saas/ui', () => ({
  Dialog: ({ children, isOpen, onClose, title, description }: any) =>
    isOpen ? (
      <div data-testid="dialog" role="dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onClose} data-testid="dialog-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
  Input: ({ label, value, onChangeText, type, placeholder, errorText, disabled, multiline }: any) => (
    <div>
      <label>{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
        data-multiline={multiline}
      />
      {errorText && <span data-testid="error">{errorText}</span>}
    </div>
  ),
  Select: ({ label, options, value, onChange, disabled }: any) => (
    <div>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        data-testid={`select-${label?.toLowerCase()}`}
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Button: ({ children, onClick, disabled, loading, type, variant }: any) => (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled || loading}
      data-variant={variant}
      data-loading={loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

describe('InviteMemberModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<InviteMemberModal {...defaultProps} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Invite Team Member')).toBeInTheDocument();
    expect(screen.getByText('Send an invitation to join your organization')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<InviteMemberModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should have email, role, and message fields', () => {
    render(<InviteMemberModal {...defaultProps} />);

    expect(screen.getByTestId('input-email-address')).toBeInTheDocument();
    expect(screen.getByTestId('select-role')).toBeInTheDocument();
    expect(screen.getByTestId('input-personal-message-(optional)')).toBeInTheDocument();
  });

  it('should have role options', () => {
    render(<InviteMemberModal {...defaultProps} />);

    const roleSelect = screen.getByTestId('select-role');
    expect(roleSelect).toHaveValue('member'); // default value

    // Check options are present
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('should update email field', () => {
    render(<InviteMemberModal {...defaultProps} />);

    const emailInput = screen.getByTestId('input-email-address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should update role field', () => {
    render(<InviteMemberModal {...defaultProps} />);

    const roleSelect = screen.getByTestId('select-role');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    expect(roleSelect).toHaveValue('admin');
  });

  it('should submit with valid email', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<InviteMemberModal {...defaultProps} onSubmit={onSubmit} />);

    // Fill in email
    const emailInput = screen.getByTestId('input-email-address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Submit form by submitting the form element directly
    const form = screen.getByTestId('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        role: 'member',
        message: undefined,
      });
    });
  });

  it('should show error for invalid email', async () => {
    render(<InviteMemberModal {...defaultProps} />);

    // Fill in invalid email
    const emailInput = screen.getByTestId('input-email-address');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // Submit form
    const form = screen.getByTestId('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    // onSubmit should not be called
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should show error for empty email', async () => {
    render(<InviteMemberModal {...defaultProps} />);

    // Submit form without filling email
    const form = screen.getByTestId('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should close modal on successful submission', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(
      <InviteMemberModal
        {...defaultProps}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    // Fill and submit
    const emailInput = screen.getByTestId('input-email-address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    const form = screen.getByTestId('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should show error when submission fails', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);

    render(<InviteMemberModal {...defaultProps} onSubmit={onSubmit} />);

    const emailInput = screen.getByTestId('input-email-address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    const form = screen.getByTestId('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Failed to send invitation. Please try again.')).toBeInTheDocument();
    });
  });

  it('should include message when provided', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<InviteMemberModal {...defaultProps} onSubmit={onSubmit} />);

    // Fill in email and message
    fireEvent.change(screen.getByTestId('input-email-address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-personal-message-(optional)'), {
      target: { value: 'Welcome to the team!' },
    });

    const form = screen.getByTestId('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        role: 'member',
        message: 'Welcome to the team!',
      });
    });
  });

  it('should reset form on close via cancel button', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<InviteMemberModal {...defaultProps} onClose={onClose} />);

    // Fill in fields
    fireEvent.change(screen.getByTestId('input-email-address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('select-role'), {
      target: { value: 'admin' },
    });

    // Close via Cancel button (this triggers handleClose which resets the form)
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();

    // Simulate parent component closing and reopening the modal
    rerender(<InviteMemberModal {...defaultProps} onClose={onClose} isOpen={false} />);
    rerender(<InviteMemberModal {...defaultProps} onClose={onClose} isOpen={true} />);

    // Fields should be reset (because handleClose was called before isOpen became false)
    expect(screen.getByTestId('input-email-address')).toHaveValue('');
    expect(screen.getByTestId('select-role')).toHaveValue('member');
  });

  it('should disable form while submitting', async () => {
    let resolveSubmit: (value: boolean) => void;
    const onSubmit = vi.fn().mockImplementation(
      () => new Promise<boolean>((resolve) => {
        resolveSubmit = resolve;
      })
    );

    render(<InviteMemberModal {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('input-email-address'), {
      target: { value: 'test@example.com' },
    });
    const form = screen.getByTestId('dialog').querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    // Resolve and cleanup
    resolveSubmit!(true);
  });
});
