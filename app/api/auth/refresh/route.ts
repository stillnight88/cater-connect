import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { refreshTokenSchema } from '@/lib/validation/schemas';
import { isZodError, formatZodError } from '@/lib/validation/helpers'
import { refreshSession } from '@/lib/auth/session';

// POST /api/auth/refresh - Refresh access token using refresh token, Implements token rotation for security
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const cookieStore = request.cookies;
        let refreshToken = cookieStore.get('refresh_token')?.value;

        if (!refreshToken) {
            const body = await request.json();
            const validated = refreshTokenSchema.parse(body);
            refreshToken = validated.refreshToken;
        }

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Refresh token required',
                },
                { status: 401 }
            );
        }

        const result = await refreshSession(refreshToken);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            accessToken: result.accessToken,
            user: {
                id: result.userId,
                email: result.email,
                role: result.role,
            },
        });
    } catch (error: unknown) {
        console.error('Token refresh error:', error);

        if (isZodError(error)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    errors: formatZodError(error),
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
};