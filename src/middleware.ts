import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isApiSeedRoute = pathname.startsWith('/api/seed');
  const isApiTenantsRoute = pathname.startsWith('/api/tenants');
  // Allow all API routes for the LMS demo (client-side auth via Zustand store)
  const isApiRoute = pathname.startsWith('/api/');
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo');

  // Allow public routes, auth API, seed API, tenants API, and static assets
  if (isPublicRoute || isApiAuthRoute || isApiSeedRoute || isApiTenantsRoute || isPublicAsset || isApiRoute) {
    return NextResponse.next();
  }

  // Protect all other routes - redirect to login if not authenticated
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-Based Access Control (RBAC) server-side protections
  const user = req.auth.user as any;
  const role = user?.role;

  // Protect platform super-admin routes
  if (pathname.startsWith('/super-admin')) {
    if (role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Protect tenant admin routes
  if (pathname.startsWith('/admin')) {
    if (
      role !== 'super_admin' &&
      role !== 'tenant_admin' &&
      role !== 'instructor' &&
      role !== 'content_creator'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.svg (favicon/logo files)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon\\.ico|logo\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
