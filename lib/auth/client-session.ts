import { AccessTokenPayload } from '@/types/auth';
import { UserRole } from '@/types/user';

export interface ClientUser {
    userId: string;
    email: string;
    role: UserRole;
    name?: string;    // Not in JWT — populated separately after login
}

// Decode JWT payload without signature verification
function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        // Base64url decode the payload
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '='
        );

        const decoded = atob(padded);
        return JSON.parse(decoded) as Record<string, unknown>
    } catch {
        return null;
    }
};

// Extract ClientUser from access token string 
export function parseAccessToken(token: string): ClientUser | null {
    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    if (
        typeof payload.userId !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.role !== 'string' ||
        payload.type !== 'access'
    ) {
        return null;
    }

    return {
        userId: payload.userId as AccessTokenPayload['userId'],
        email: payload.email as AccessTokenPayload['email'],
        role: payload.role as AccessTokenPayload['role'],
    };
}

// Check if a token is expired client-side, Used by AuthProvider before deciding whether to call /api/auth/refresh
export function isTokenExpired(token: string): boolean {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - 10 < nowInSeconds; // 10 second buffer — refresh slightly before actual expiry
}

// Extract raw expiry timestamp from token, Used by AuthProvider to schedule proactive refresh
export function getTokenExpiry(token: string): number | null {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000; // Convert to milliseconds
}