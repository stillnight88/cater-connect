// app/api/vendor-application/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/role-guard';
import { VendorApplicationModel } from '@/lib/db/models';
import { connectDB } from '@/lib/db/client';
import { toVendorApplicationAdminPublic, type VendorApplicationStatus, type VendorApplicationPopulated } from '@/types/vendor';

const VALID_STATUSES: readonly VendorApplicationStatus[] = ['pending', 'approved', 'rejected'];

export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
        return authResult;
    }
    try {
        await connectDB();

        const statusParam = request.nextUrl.searchParams.get('status');
        if (statusParam && !VALID_STATUSES.includes(statusParam as VendorApplicationStatus)) {
            return NextResponse.json(
                { success: false, error: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}` },
                { status: 400 },
            )
        }

        const filter = statusParam ? { status: statusParam } : {};
        const applications = await VendorApplicationModel.find(filter)
            .populate('userId', 'name email')
            .sort({ submittedAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            applications: (applications as unknown as VendorApplicationPopulated[]).map(
                toVendorApplicationAdminPublic,
            ),
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch vendor applications' },
            { status: 500 },
        );
    }
}