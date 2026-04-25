import { NextRequest, NextResponse } from 'next/server';
import {
    authenticateRequest,
    attachSessionToRequest,
} from '@/lib/middleware/auth-middleware';

// no authentication required
const PUBLIC_ROUTES = [
    // Auth routes
    '/api/auth/signup',
    '/api/auth/verify-email',
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/mfa/request',
    '/api/auth/mfa/verify',

    // Public vendor routes
    '/api/vendors',
    '/api/vendors/search',

    // Health check
    '/api/health',
];

// authentication required
const PROTECTED_ROUTES = [
    // User routes
    '/api/user',

    // Vendor routes (vendor-only)
    '/api/vendor',

    // Admin routes (admin-only)
    '/api/admin',

    // Vendor application
    '/api/vendor-application',
];

const ADMIN_ROUTES = [
    '/api/admin',
];

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => {
        if (pathname === route) return true;

        // Wildcard match 
        if (route.endsWith('/*')) {
            const baseRoute = pathname.slice(0, -2);
            return pathname.startsWith(baseRoute);
        }

        return false;
    });
};

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some((route) => {
        if (pathname === route) return true;

        return pathname.startsWith(route + '/') || pathname === route;
    });
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] ${request.method} ${pathname}`);
    }

    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    if (isProtectedRoute(pathname)) {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            // Return 401 Unauthorized for API routes
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unauthorized',
                        message: auth.error || 'Authentication required',
                    },
                    { status: 401 }
                );
            }

            // Redirect to login for page routes
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const requestWithSession = attachSessionToRequest(request, auth.session!);
        return NextResponse.next({ request: requestWithSession });
    }

    // Optional authentication for all other routes
    const auth = await authenticateRequest(request);
    if (auth.authenticated) {
        const requestWithSession = attachSessionToRequest(request, auth.session!);
        return NextResponse.next({ request: requestWithSession });
    }

    return NextResponse.next();
};

// Skip middleware for static files, Next.js internals, and public assets
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};