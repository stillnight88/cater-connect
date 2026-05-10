import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { loginSchema } from '@/lib/validation/schemas';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { verifyPassword, needsRehash, hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { createOTP } from '@/lib/auth/otp';
import { queueMFAOTP } from '@/lib/email/queue';
import { logLogin, logLoginFailed, logMFARequested } from '@/lib/audit/logger';

// POST /api/auth/login - Regular users: Returns access + refresh tokens, Admin users: Triggers MFA flow
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const validated = loginSchema.parse(body);

        const user = await UserModel.findByEmailWithPassword(validated.email);
        if (!user) {
            await logLoginFailed(
                validated.email,
                'User not found',
                request
            );

            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password',
                },
                { status: 401 }
            );
        }

        const isValidPassword = await verifyPassword(user.password, validated.password);
        if (!isValidPassword) {
            await logLoginFailed(
                validated.email,
                'Invalid password',
                request
            );

            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password',
                },
                { status: 401 }
            );
        }

        if (await needsRehash(user.password)) {
            user.password = await hashPassword(validated.password);
            await user.save();
        }

        if (!user.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email not verified',
                    message: 'Please verify your email before logging in',
                },
                { status: 403 }
            );
        }

        if (user.mfaEnabled) {
            const { code } = await createOTP(user._id.toString(), 'mfa_login');

            await queueMFAOTP({
                email: user.email,
                name: user.name,
                otp: code
            });

            await logMFARequested(user._id.toString(), user.email, request);

            return NextResponse.json({
                success: true,
                mfaRequired: true,
                message: 'MFA code sent to your email',
                email: user.email, // Frontend needs this for MFA verification
            });
        }

        // Regular users (customer, vendor) - create session directly
        const { accessToken } = await createSession(
            user._id.toString(),
            user.email,
            user.role
        );

        await logLogin(user._id.toString(), user.email, 'password', request);

        return NextResponse.json(
            {
                success: true,
                accessToken,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    emailVerified: user.emailVerified,
                }
            }
        );
    } catch (error: unknown) {
        console.error('Login error:', error);

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