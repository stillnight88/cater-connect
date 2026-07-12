// app/api/vendor-application/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/role-guard';
import { connectDB } from '@/lib/db/client';
import { VendorApplicationModel } from '@/lib/db/models';
import { toVendorApplicationAdminPublic, type VendorApplicationPopulated } from '@/types/vendor';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();
        const { id } = await params;
        const application = await VendorApplicationModel.findById(id)
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name email')
            .lean();

        if (!application) {
            return NextResponse.json({ success: false, error: 'Vendor application not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            application: toVendorApplicationAdminPublic(
                application as unknown as VendorApplicationPopulated,
            ),
        });

    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch vendor application Id' },
            { status: 500 },
        );
    }
};