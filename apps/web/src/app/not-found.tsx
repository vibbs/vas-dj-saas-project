import Link from 'next/link';

export default function NotFound() {
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
        <p
          className="text-6xl font-bold mb-2"
          style={{ color: 'var(--color-primary)' }}
        >
          404
        </p>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--color-foreground)' }}
        >
          Page not found
        </h2>
        <p
          className="mb-6 text-sm"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/home"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline"
            style={{
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
