import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection and authentication
 * Runs before every request to check authentication status
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected and public routes
  const isAuthRoute = pathname.startsWith('/login') ||
                      pathname.startsWith('/register-organization') ||
                      pathname.startsWith('/accept-invite');

  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Note: Token checking is handled client-side by the auth guard hooks
  // This middleware primarily handles redirects for obvious cases

  // If accessing auth pages while logged in, redirect to dashboard
  // (This will be fine-tuned by the client-side guard)

  // If accessing dashboard without auth, redirect to login
  // (This will be fine-tuned by the client-side guard)

  // For now, let the client-side guards handle all auth logic
  // Middleware can be enhanced later with server-side token validation

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
