import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { VendorApplicationModel,UserModel } from '@/lib/db/models';
import { submitVendorApplicationSchema } from '@/lib/validation/schemas';
import { formatZodError,isZodError } from '@/lib/validation/helpers';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { queueVendorApplicationSubmitted } from '@/lib/email/queue';
import { logVendorApplicationSubmitted } from '@/lib/audit/logger';

// POST /api/vendor-application/submit - Customer submits application to become vendor
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // 401
        }
        const session = authResult;

        if (session.role !== 'customer') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Only customer accounts can submit vendor applications',
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = submitVendorApplicationSchema.parse(body);

        const hasPending = await VendorApplicationModel.hasPendingApplication(session.userId);
        if (hasPending) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'You already have a pending vendor application',
                },
                { status: 400 }
            );
        }

        const application = await VendorApplicationModel.create({
            userId: session.userId,
            businessName: validated.businessName,
            description: validated.description,
            phone: validated.phone,
            address: validated.address,
            status: 'pending',
            submittedAt: new Date(),
        });

        const user = await UserModel.findById(session.userId);

        await queueVendorApplicationSubmitted({
            email: user!.email,
            name: user!.name,
            businessName: validated.businessName,
            applicationId: application._id.toString(),
        });

        await logVendorApplicationSubmitted(
            session.userId,
            application._id.toString(),
            validated.businessName
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Vendor application submitted successfully',
                application: {
                    id: application._id.toString(),
                    businessName: application.businessName,
                    status: application.status,
                    submittedAt: application.submittedAt,
                },
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Vendor application submission error:', error);

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