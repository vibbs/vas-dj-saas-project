'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="max-w-md w-full rounded-xl p-8 text-center"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--color-destructive-muted, #FEE2E2)' }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: 'var(--color-destructive, #EF4444)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--color-foreground)' }}
        >
          Something went wrong
        </h2>
        <p
          className="mb-6 text-sm"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          An unexpected error occurred. Please try again or contact support if the problem
          persists.
        </p>
        {error.digest && (
          <p
            className="mb-4 text-xs font-mono"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
            }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = '/home')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
