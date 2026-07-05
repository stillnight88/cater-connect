import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { toUserPublic } from '@/types/user';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // 401
        }
        const session = authResult;

        const user = await UserModel.findById(session.userId);
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: toUserPublic(user),
        })
    } catch (error) {
        console.error('Get current user error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}

