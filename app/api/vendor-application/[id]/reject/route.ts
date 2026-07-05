import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { VendorApplicationModel, UserModel } from '@/lib/db/models';
import { rejectVendorApplicationSchema } from '@/lib/validation/schemas';
import { formatZodError,isZodError } from '@/lib/validation/helpers';
import { requireAdmin } from '@/lib/middleware/role-guard';
import { queueVendorApplicationRejected } from '@/lib/email/queue';
import { logVendorApplicationRejected } from '@/lib/audit/logger';

// POST /api/vendor-application/[id]/reject - Admin-only: Provides feedback to applicant
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) {
            return authResult; // 401/403
        }
        const session = authResult;

        const { id } = await params;

        const body = await request.json();
        const validated = rejectVendorApplicationSchema.parse(body);

        const application = await VendorApplicationModel.findById(id);

        if (!application) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Application not found',
                },
                { status: 404 }
            );
        }

        if (!application.isPending()) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Application already ${application.status}`,
                },
                { status: 400 }
            );
        }

        const user = await UserModel.findById(application.userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        await application.reject(session.userId, validated.rejectionReason);

        await queueVendorApplicationRejected({
            email: user.email,
            name: user.name,
            businessName: application.businessName,
            rejectionReason: validated.rejectionReason,
        });

        await logVendorApplicationRejected(
            session.userId,
            application._id.toString(),
            user._id.toString(),
            application.businessName,
            validated.rejectionReason
        );

        return NextResponse.json({
            success: true,
            message: 'Vendor application rejected',
            application: {
                id: application._id.toString(),
                status: application.status,
                reviewedAt: application.reviewedAt,
                reviewedBy: application.reviewedBy?.toString(),
                rejectionReason: application.rejectionReason,
            },
        });

    } catch (error: unknown) {
        console.error('Vendor application rejection error:', error);

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