import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { mfaVerifySchema } from '@/lib/validation/schemas';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { verifyOTP } from '@/lib/auth/otp';
import { createSession } from '@/lib/auth/session';
import { logMFAVerified, logMFAFailed, logLogin } from '@/lib/audit/logger';

// POST /api/auth/mfa/verify - Verify MFA OTP code, Completes admin login process
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = mfaVerifySchema.parse(body);

    const user = await UserModel.findOne({ email: validated.email });

    if (!user) {
      await logMFAFailed('unknown', 'User not found', request);

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification code',
        },
        { status: 401 }
      );
    }

    if (!user.mfaEnabled) {
      await logMFAFailed(
        user._id.toString(),
        'Not an admin user',
        request
      );

      return NextResponse.json(
        {
          success: false,
          error: 'MFA not enabled for this account',
        },
        { status: 403 }
      );
    }

    const otpResult = await verifyOTP(
      user._id.toString(),
      'mfa_login',
      validated.code
    );

    if (!otpResult.success) {
      await logMFAFailed(
        user._id.toString(),
        otpResult.error || 'Invalid OTP',
        request
      );

      return NextResponse.json(
        {
          success: false,
          error: otpResult.error,
          remainingAttempts: otpResult.remainingAttempts,
        },
        { status: 401 }
      );
    }

    const { accessToken } = await createSession(
      user._id.toString(),
      user.email,
      user.role
    );

    await logMFAVerified(user._id.toString(), request);

    await logLogin(user._id.toString(), user.email, 'mfa', request);

    return NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: unknown) {
    console.error('MFA verification error:', error);

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