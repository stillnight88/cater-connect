import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { UserModel } from '@/lib/db/models';
import { signupSchema } from '@/lib/validation/schemas';
import { formatZodError,isZodError } from '@/lib/validation/helpers';
import { hashPassword } from '@/lib/auth/password';
import { createOTP } from '@/lib/auth/otp';
import { queueVerifyEmail } from '@/lib/email/queue';
import { logSignup } from '@/lib/audit/logger';

// POST /api/auth/signup - Creates new user account and sends verification email
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const validated = signupSchema.parse(body);

        const existingUser = await UserModel.findOne({ email: validated.email });
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email already registered',
                },
                { status: 400 }
            );
        }

        const passwordHash = await hashPassword(validated.password);

        const user = await UserModel.create({
            name: validated.name,
            email: validated.email,
            password: passwordHash,
            role: 'customer',
            emailVerified: false,
            mfaEnabled: false
        });

        const { code } = await createOTP(user._id.toString(), 'email_verification');

        await queueVerifyEmail({
            email: user.email,
            name: user.name,
            otp: code
        });

        await logSignup(
            user._id.toString(),
            user.email,
            request
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully. Please check your email for verification code.',
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Signup error:', error);

        if (isZodError(error)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    errors: formatZodError(error)
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