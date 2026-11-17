import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { MenuItemModel } from '@/lib/db/models';
import { requireVendor } from '@/lib/middleware/role-guard';
import { toMenuItemPublic, type MenuItem } from '@/types/menu';
import { logMenuItemUnpublished } from '@/lib/audit/logger';

// PATCH /api/menu/[id]/unpublish — Vendor: unpublish a published menu item
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const authResult = await requireVendor(request);
        if (authResult instanceof NextResponse) return authResult;
        const session = authResult;

        const { id } = await params;

        const { profile: vendorProfile, error } = await resolveVendorProfile(session.userId);
        if (error) return error;

        const item = await MenuItemModel.findOneAndUpdate(
            {
                _id: id,
                vendorId: vendorProfile._id,
                status: 'published',
                isDeleted: false,
            },
            { $set: { status: 'draft' } },
            { new: true },
        ).lean<MenuItem>();

        if (!item) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Menu item not found or already unpublished',
                },
                { status: 404 },
            );
        }

        await logMenuItemUnpublished(
            session.userId,
            id,
            {
                name: item.name,
                vendorId: vendorProfile._id.toString(),
            },
            request,
        );

        return NextResponse.json({
            success: true,
            item: toMenuItemPublic(item),
        });
    } catch (error) {
        console.error('PATCH /api/menu/[id]/unpublish error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};
