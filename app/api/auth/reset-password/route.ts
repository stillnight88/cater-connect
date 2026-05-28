import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { resetPasswordSchema } from '@/lib/validation/schemas';
import { formatZodError,isZodError } from '@/lib/validation/helpers';
import { verifyOTP } from '@/lib/auth/otp';
import { hashPassword } from '@/lib/auth/password';
import { revokeAllUserSessions } from '@/lib/auth/session';
import { logPasswordResetCompleted } from '@/lib/audit/logger';

// POST /api/auth/reset-password - Reset password using OTP code, Invalidates all existing sessions for security
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const validated = resetPasswordSchema.parse(body);

        const user = await UserModel.findOne({ email: validated.email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid reset code',
                },
                { status: 401 }
            );
        }

        const otpResult = await verifyOTP(
            user._id.toString(),
            'password_reset',
            validated.code
        );

        if (!otpResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: otpResult.error,
                    remainingAttempts: otpResult.remainingAttempts,
                },
                { status: 401 }
            );
        }

        const passwordHash = await hashPassword(validated.newPassword);

        user.password = passwordHash;
        await user.save();

        await revokeAllUserSessions(user._id.toString());

        await logPasswordResetCompleted(
            user._id.toString(),
            user.email,
            request
        );

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.',
        });
    } catch (error: unknown) {
        console.error('Password reset error:', error);

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
}