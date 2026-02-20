import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth routes (accessible only when NOT authenticated)
 */
const AUTH_ROUTES = ['/login', '/register-organization', '/forgot-password', '/reset-password'];

/**
 * Protected route prefixes (require authentication)
 */
const PROTECTED_PREFIXES = ['/home', '/settings'];

/**
 * Public routes that are always accessible
 */
const PUBLIC_ROUTES = ['/', '/accept-invite', '/verify-email'];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
}

/**
 * Middleware for server-side route protection.
 *
 * Reads the `vas_dj_auth` cookie (synced from the client-side Zustand auth store)
 * to determine if the user is authenticated. This provides a server-side guard
 * so protected pages are never served to unauthenticated users.
 *
 * The client-side auth guard (useAuthGuard) still handles the full token
 * validation and refresh flow after the page loads.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has('vas_dj_auth');

  // Authenticated users trying to access auth pages → redirect to dashboard
  if (hasAuthCookie && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Unauthenticated users trying to access protected pages → redirect to login
  if (!hasAuthCookie && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
