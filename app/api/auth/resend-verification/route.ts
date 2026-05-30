import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { resendVerificationSchema } from '@/lib/validation/schemas';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { createOTP, canRequestOTP } from '@/lib/auth/otp';
import { queueVerifyEmail } from '@/lib/email/queue';

// POST /api/auth/resend-verification - Resend email verification OTP
// Only works for unverified accounts — verified accounts are rejected
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const validated = resendVerificationSchema.parse(body);

        const user = await UserModel.findOne({ email: validated.email });

        // Return success — never reveal whether email exists
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'If an unverified account exists with this email, a new code has been sent.',
            });
        }
        if (user.emailVerified) {
            return NextResponse.json({
                success: true,
                message: 'If an unverified account exists with this email, a new code has been sent.',
            });
        }

        const canRequest = await canRequestOTP(user._id.toString(), 'email_verification');
        if (!canRequest.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Please wait before requesting a new verification code',
                    waitSeconds: canRequest.waitSeconds,
                },
                { status: 429 }
            );
        }

        const { code } = await createOTP(user._id.toString(), 'email_verification');
        await queueVerifyEmail({
            email: user.email,
            name: user.name,
            otp: code
        });

        return NextResponse.json({
            success: true,
            message: 'If an unverified account exists with this email, a new code has been sent.',
        });
    } catch (error: unknown) {
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

        console.error('Resend verification error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
};