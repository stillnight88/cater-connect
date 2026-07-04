import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/tokens.edge';
import { Session } from '@/types/auth';

export interface AuthResult {
    authenticated: boolean;
    session?: Session;
    error?: string;
}

export function extractAccessToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    return extractTokenFromHeader(authHeader);
};

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
    const token = extractAccessToken(request);
    if (!token) {
        return {
            authenticated: false,
            error: 'No access token provided',
        };
    }

    try {
        const payload = await verifyAccessToken(token);

        const session: Session = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role
        };

        return {
            authenticated: true,
            session
        };
    } catch (error) {
        return {
            authenticated: false,
            error: error instanceof Error ? error.message : 'Invalid token',
        };
    }
};

export async function requireAuth(request: NextRequest): Promise<Session | NextResponse> {
    const auth = await authenticateRequest(request);

    if (!auth.authenticated) {
        return NextResponse.json(
            {
                success: false,
                error: 'Unauthorized',
                message: auth.error || 'Authentication required',
            },
            { status: 401 }
        );
    };

    return auth.session!;
};

export async function optionalAuth(request: NextRequest): Promise<Session | null> {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
        return null;
    }

    return auth.session!;
};

export function attachSessionToRequest(request: NextRequest, session: Session): NextRequest {
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set('x-user-session', JSON.stringify(session));
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-user-email', session.email);
    requestHeaders.set('x-user-role', session.role);

    return new NextRequest(request, {
        headers: requestHeaders
    });
};

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
    const auth = await authenticateRequest(request);
    return auth.authenticated;
};

