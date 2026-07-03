import { jwtVerify } from 'jose';
import { AccessTokenPayload } from '@/types/auth';

const JWT_ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET)

export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return null;
    return parts[1];
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
        const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET, {
            issuer: 'caterconnect',
            audience: 'caterconnect-api',
        });

        // Ensure refresh tokens cannot be used as access tokens
        if (payload.type !== 'access') throw new Error('Invalid token type');

        return payload as unknown as AccessTokenPayload;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('expired')) throw new Error('Access token expired');
            if (error.message.includes('invalid')) throw new Error('Invalid access token');
        }
        throw error;
    }
};