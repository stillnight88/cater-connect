import { cookies } from 'next/headers';
import { RefreshTokenModel } from '@/lib/db/models';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from './tokens';
import { UserRole } from '@/types/user';

// Cookie Configuration
export const COOKIE_CONFIG = {
    REFRESH_TOKEN_NAME: 'refresh_token',
    REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
    COOKIE_OPTIONS: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
    },
} as const;

export async function createSession(
    userId: string,
    email: string,
    role: UserRole
): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
}> {
    const accessToken = generateAccessToken(userId, email, role);
    const { token: refreshToken, tokenId: refreshTokenId } = generateRefreshToken(userId);

    const expiresAt = new Date(Date.now() + COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE * 1000);

    await RefreshTokenModel.create({
        userId,
        tokenId: refreshTokenId,
        token: refreshToken,
        expiresAt,
        isRevoked: false,
    });

    const cookieStore = await cookies();
    cookieStore.set(
        COOKIE_CONFIG.REFRESH_TOKEN_NAME,
        refreshToken,
        {
            ...COOKIE_CONFIG.COOKIE_OPTIONS,
            maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
        }
    );

    return {
        accessToken,
        refreshToken,
        refreshTokenId,
    };
};

// Refresh token rotation prevents replay attacks
export async function refreshSession(currentRefreshToken: string): Promise<
    | {
        success: true;
        accessToken: string;
        refreshToken: string;
        userId: string;
        email: string;
        role: UserRole;
    }
    | { success: false; error: string }
> {
    try {
        const payload = verifyRefreshToken(currentRefreshToken);

        const tokenDoc = await RefreshTokenModel.findActiveToken(payload.tokenId);
        if (tokenDoc) {
            return {
                success: false,
                error: 'Refresh token invalid or revoked',
            };
        }

        const { UserModel } = await import('@/lib/db/models');
        const user = await UserModel.findById(payload.userId);

        if (!user) {
            return {
                success: false,
                error: 'User not found',
            };
        }
        if (!user.emailVerified) {
            return {
                success: false,
                error: 'Email not verified',
            };
        }

        await RefreshTokenModel.revokeToken(payload.tokenId);

        const { accessToken, refreshToken } = await createSession(
            user._id.toString(),
            user.email,
            user.role
        );

        return {
            success: true,
            accessToken,
            refreshToken,
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Token verification failed',
        };
    }
};

export async function logout(refreshToken?: string): Promise<void> {
    try {
        if (!refreshToken) {
            const cookieStore = await cookies();
            refreshToken = cookieStore.get(COOKIE_CONFIG.REFRESH_TOKEN_NAME)?.value;
        }

        if (refreshToken) {
            const payload = verifyRefreshToken(refreshToken);
            await RefreshTokenModel.revokeToken(payload.tokenId);
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN_NAME);
    }
};

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await RefreshTokenModel.revokeAllUserTokens(userId);
};

export async function getActiveSessionsCount(userId: string): Promise<number> {
  return await RefreshTokenModel.countActiveTokens(userId);
};

