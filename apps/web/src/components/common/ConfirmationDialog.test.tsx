import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmationDialog } from './ConfirmationDialog';

// Mock the UI components
vi.mock('@vas-dj-saas/ui', () => ({
  Dialog: ({ children, isOpen, onClose, title }: any) =>
    isOpen ? (
      <div data-testid="dialog">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="dialog-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
  Button: ({ children, onClick, disabled, loading, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-variant={variant}
      data-loading={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

describe('ConfirmationDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(true),
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<ConfirmationDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should display custom button text', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm and close on successful confirmation', async () => {
    const onConfirm = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();

    render(
      <ConfirmationDialog
        {...defaultProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should not close on failed confirmation', async () => {
    const onConfirm = vi.fn().mockResolvedValue(false);
    const onClose = vi.fn();

    render(
      <ConfirmationDialog
        {...defaultProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    // onClose should not be called when onConfirm returns false
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should use destructive variant for danger type', () => {
    render(<ConfirmationDialog {...defaultProps} variant="danger" />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveAttribute('data-variant', 'destructive');
  });

  it('should use primary variant for non-danger types', () => {
    render(<ConfirmationDialog {...defaultProps} variant="warning" />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveAttribute('data-variant', 'primary');
  });

  it('should disable buttons while confirming', async () => {
    // Create a slow-resolving promise
    let resolveConfirm: (value: boolean) => void;
    const onConfirm = vi.fn().mockImplementation(
      () => new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      })
    );

    render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    // Click confirm
    fireEvent.click(confirmButton);

    // Buttons should be disabled while confirming
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
    expect(cancelButton).toBeDisabled();

    // Resolve the promise
    resolveConfirm!(true);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should not allow closing while confirming', async () => {
    let resolveConfirm: (value: boolean) => void;
    const onConfirm = vi.fn().mockImplementation(
      () => new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      })
    );
    const onClose = vi.fn();

    render(
      <ConfirmationDialog
        {...defaultProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    // Start confirming
    fireEvent.click(screen.getByText('Confirm'));

    // Try to close via cancel button (should be disabled)
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).not.toHaveBeenCalled();

    // Resolve and cleanup
    resolveConfirm!(true);
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
