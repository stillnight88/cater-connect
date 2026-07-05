import jwt from 'jsonwebtoken';
import { AccessTokenPayload, RefreshTokenPayload } from '@/types/auth';
import { randomBytes } from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets not configured. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env');
}

// Token expiry durations
export const TOKEN_EXPIRY = {
    ACCESS_TOKEN: '15m',  // 15 minutes
    REFRESH_TOKEN: '7d',  // 7 days
} as const;

export function generateAccessToken(
    userId: string,
    email: string,
    role: 'customer' | 'vendor' | 'admin'
): string {
    const payload: AccessTokenPayload = {
        userId,
        email,
        role,
        type: 'access'
    };

    return jwt.sign(payload, JWT_ACCESS_SECRET!, {
        expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
        issuer: 'caterconnect',
        audience: 'caterconnect-api',
    });
};

export function generateRefreshToken(userId: string): { token: string, tokenId: string } {
    const tokenId = randomBytes(32).toString('hex');  // Generate unique token ID for database tracking and revocation

    const payload: RefreshTokenPayload = {
        userId,
        tokenId,
        type: 'refresh'
    };

    const token = jwt.sign(payload, JWT_REFRESH_SECRET!, {
        expiresIn: TOKEN_EXPIRY.REFRESH_TOKEN,
        issuer: 'caterconnect',
        audience: 'caterconnect-api',
    });

    return { token, tokenId };
};

export function verifyAccessToken(token: string): AccessTokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET!, {
            issuer: 'caterconnect',
            audience: 'caterconnect-api',
        }) as AccessTokenPayload;

        // Ensure refresh tokens cannot be used as access tokens
        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');   
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Access token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid access token');
        }
        throw error;
    }
};

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET!, {
            issuer: 'caterconnect',
            audience: 'caterconnect-api',
        }) as RefreshTokenPayload;

         // Ensure access tokens cannot be used as refresh tokens
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');    
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Refresh token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid refresh token');
        }
        throw error;
    }
};

// WARNING: Decodes JWT without verifying signature or expiry.
// Only use for debugging or inspecting token contents.
export function decodeTokenUnsafe(token: string): AccessTokenPayload | RefreshTokenPayload | null {
    try {
        return jwt.decode(token) as AccessTokenPayload | RefreshTokenPayload;
    } catch {
        return null;
    }
};

export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) {
        return null;
    }

    // Expect Authorization header in the format: "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }

    return parts[1];
};
