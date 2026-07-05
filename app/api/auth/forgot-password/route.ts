import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { forgotPasswordSchema } from '@/lib/validation/schemas';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { createOTP, canRequestOTP } from '@/lib/auth/otp';
import { queuePasswordReset } from '@/lib/email/queue';
import { logPasswordResetRequested } from '@/lib/audit/logger';

// POST /api/auth/forgot-password - Request password reset, Sends OTP code to user's email
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const validated = forgotPasswordSchema.parse(body);

        const user = await UserModel.findOne({ email: validated.email });
        if (!user) {
            await logPasswordResetRequested(validated.email, request);

            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset code.',
            });
        }

        if (!user.emailVerified) {
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset code.',
            });
        }

        const canRequest = await canRequestOTP(user._id.toString(), 'password_reset');

        if (!canRequest.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Please wait before requesting another password reset code',
                    waitSeconds: canRequest.waitSeconds,
                },
                { status: 429 }
            );
        }

        const { code } = await createOTP(
            user._id.toString(),
            'password_reset'
        );

        await queuePasswordReset({
            email: user.email,
            name: user.name,
            otp: code,
        });

        await logPasswordResetRequested(user.email, request);

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset code.',
        });

    } catch (error: unknown) {
        console.error('Forgot password error:', error);

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