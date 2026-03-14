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

/**
 * Generate Access Token - Short-lived token for API authorization
 * @param userId - User's database ID
 * @param email - User's email
 * @param role - User's role
 * @returns Signed JWT access token
 */
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

/**
 * Generate Refresh Token - Long-lived token for generating new access tokens
 * @param userId - User's database ID
 * @returns Object containing JWT and unique tokenId
 */
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

/**
 * Verify Access Token - Validates signature and expiry, Returns decoded payload if valid
 * @param token - JWT access token
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET!, {
            issuer: 'caterconnect',
            audience: 'caterconnect-api',
        }) as AccessTokenPayload;

        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Access token expired');
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Invalid access token');
        }
        throw error;
    }
};

/**
 * Verify Refresh Token - Validates signature and expiry, Returns decoded payload if valid
 * @param token - JWT refresh token
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET!, {
            issuer: 'caterconnect',
            audience: 'caterconnect-api',
        }) as RefreshTokenPayload;

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

/**
 * Decode token without verification 
 * Use only for inspecting token contents (NOT for authorization), 
 * Does not validate signature or expiry
 * @param token - JWT token
 * @returns Decoded payload or null if invalid format
 */
export function decodeTokenUnsafe(token: string): AccessTokenPayload | RefreshTokenPayload | null {
    try {
        return jwt.decode(token) as AccessTokenPayload | RefreshTokenPayload;
    } catch {
        return null;
    }
};

/**
 * Extract token from Authorization header - Supports "Bearer <token>" format
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }

    return parts[1];
};
