import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { verifyEmailSchema } from '@/lib/validation/schemas';
import { formatZodError,isZodError } from '@/lib/validation/helpers';
import { verifyOTP } from '@/lib/auth/otp';
import { logEmailVerified } from '@/lib/audit/logger';

// POST /api/auth/verify-email - Verifies OTP code and activates user account
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json()
        const validated = verifyEmailSchema.parse(body);

        const user = await UserModel.findOne({ email: validated.email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email already verified',
                },
                { status: 400 }
            );
        }

        const otpResult = await verifyOTP(
            user._id.toString(),
            'email_verification',
            validated.code
        );

        if (!otpResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: otpResult.error,
                    remainingAttempts: otpResult.remainingAttempts,
                },
                { status: 400 }
            );
        }

        user.emailVerified = true;
        await user.save();

        await logEmailVerified(user._id.toString(), user.email);

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully. You can now log in.',
        });
    } catch (error: unknown) {
        console.error('Email verification error:', error);

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