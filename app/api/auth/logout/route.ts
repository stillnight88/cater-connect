import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { logout } from '@/lib/auth/session';
import { logoutSchema } from '@/lib/validation/schemas';
import { invalidateUserOTPs } from '@/lib/auth/otp';
import { logLogout } from '@/lib/audit/logger';
import { optionalAuth } from '@/lib/middleware/auth-middleware';

// POST /api/auth/logout - Revokes refresh token and clears cookie
export async function POST(request: NextRequest) {
    let refreshTokenFromBody: string | undefined;
    try {
        await connectDB();
        const session = await optionalAuth(request);

        // use body token as fallback when cookie is absent
        const body = await request.json();
        const validated = logoutSchema.parse(body);
        refreshTokenFromBody = validated.refreshToken;

        const cookieStore = request.cookies;

        const cookieToken = cookieStore.get('refresh_token')?.value;
        const tokenToRevoke = cookieToken ?? refreshTokenFromBody;  
        await logout(tokenToRevoke);

        if (session) {
            await invalidateUserOTPs(session.userId);   //For Security
            await logLogout(session.userId, request);
        }

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    }
};