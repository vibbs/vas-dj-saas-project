'use client';

/**
 * Global Error Boundary
 * Catches errors in the root layout itself.
 * Must provide its own <html> and <body> tags since the root layout is broken.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#FAFAFA',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1A1A1A' }}>
              Application Error
            </h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
              A critical error occurred. Please try refreshing the page.
            </p>
            {error.digest && (
              <p style={{ marginBottom: '1rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#9CA3AF' }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
