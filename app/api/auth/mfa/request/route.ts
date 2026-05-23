import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { mfaRequestSchema } from '@/lib/validation/schemas';
import { formatZodError,isZodError } from '@/lib/validation/helpers';
import { createOTP, canRequestOTP } from '@/lib/auth/otp';
import { queueMFAOTP } from '@/lib/email/queue';
import { logMFARequested } from '@/lib/audit/logger';

// POST /api/auth/mfa/request - Request new MFA OTP code, Used when admin needs to resend MFA code
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const validated = mfaRequestSchema.parse(body);

        const user = await UserModel.findOne({ email: validated.email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request',
                },
                { status: 404 }
            );
        }

        if (!user.mfaEnabled) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'MFA not enabled for this account',
                },
                { status: 403 }
            );
        }

        if (!user.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email not verified',
                },
                { status: 403 }
            );
        }

        const canRequest = await canRequestOTP(
            user._id.toString(),
            'mfa_login'
        );
        if (!canRequest.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Please wait before requesting a new code',
                    waitSeconds: canRequest.waitSeconds,
                },
                { status: 429 }
            );
        }

        const { code } = await createOTP(user._id.toString(), 'mfa_login');

        await queueMFAOTP({
            email: user.email,
            name: user.name,
            otp: code,
        });

        await logMFARequested(user._id.toString(), user.email, request);

        return NextResponse.json({
            success: true,
            message: 'MFA code sent to your email',
        });
    } catch (error: unknown) {
        console.error('MFA request error:', error);

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
