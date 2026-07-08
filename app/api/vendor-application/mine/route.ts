// app/api/vendor-application/mine/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { VendorApplicationModel } from '@/lib/db/models';
import { toVendorApplicationPublic } from '@/types/vendor';
import { connectDB } from '@/lib/db/client';

export async function GET(request: NextRequest) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId, role } = authResult;

    try {
        await connectDB();
        if (role !== 'customer') {
            return NextResponse.json(
                { success: false, error: 'This endpoint is for customer accounts only' },
                { status: 403 },)
        }

        const application = await VendorApplicationModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
        if (!application) {
            return NextResponse.json({ success: true, application: null });
        }

        return NextResponse.json({ success: true, application: toVendorApplicationPublic(application) });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch vendor applications' },
            { status: 500 },
        );
    }
}