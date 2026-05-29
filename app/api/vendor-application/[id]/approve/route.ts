import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { VendorApplicationModel, VendorProfileModel, UserModel } from '@/lib/db/models';
import { requireAdmin } from '@/lib/middleware/role-guard';
import { queueVendorApplicationApproved } from '@/lib/email/queue';
import { logVendorApplicationApproved, logRoleChanged } from '@/lib/audit/logger';

// POST /api/vendor-application/[id]/approve - Admin-only: Upgrades user role and creates vendor profile
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

        const profileExists = await VendorProfileModel.existsForUser(application.userId.toString());
        if (profileExists) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Vendor profile already exists',
                },
                { status: 400 }
            );
        }

        await application.approve(session.userId);
        const previousRole = user.role;
        user.role = 'vendor';
        await user.save();

        await VendorProfileModel.create({
            userId: application.userId,
            businessName: application.businessName,
            description: application.description,
            phone: application.phone,
            address: application.address,
            isActive: true,
        });

        await queueVendorApplicationApproved({
            email: user.email,
            name: user.name,
            businessName: application.businessName,
        });

        await logVendorApplicationApproved(
            session.userId,
            application._id.toString(),
            user._id.toString(),
            application.businessName
        );

        await logRoleChanged(
            session.userId,
            user._id.toString(),
            previousRole,
            'vendor'
        );

        return NextResponse.json({
            success: true,
            message: 'Vendor application approved successfully',
            application: {
                id: application._id.toString(),
                status: application.status,
                reviewedAt: application.reviewedAt,
                reviewedBy: application.reviewedBy?.toString(),
            },
        });
    } catch (error) {
        console.error('Vendor application approval error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}