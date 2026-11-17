import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { MenuItemModel } from '@/lib/db/models';
import { requireVendor } from '@/lib/middleware/role-guard';
import { updateMenuItemSchema } from '@/lib/validation/schemas';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { toMenuItemPublic, type MenuItem } from '@/types/menu';
import { logMenuItemDeleted } from '@/lib/audit/logger';

// PATCH /api/menu/[id] — Vendor: update menu item fields
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

        const body = await request.json();
        const validated = updateMenuItemSchema.parse(body);

        const item = await MenuItemModel.findOneAndUpdate(
            {
                _id: id,
                vendorId: vendorProfile._id,
                isDeleted: false,
            },
            { $set: validated },
            { new: true },
        ).lean<MenuItem>();

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Menu item not found' },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            item: toMenuItemPublic(item),
        });
    } catch (error) {
        console.error('PATCH /api/menu/[id] error:', error);

        if (isZodError(error)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    errors: formatZodError(error),
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};

// DELETE /api/menu/[id] — Vendor: soft delete a menu item
export async function DELETE(
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
                isDeleted: false,
            },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            },
            { new: true },
        ).lean<MenuItem>();

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Menu item not found' },
                { status: 404 },
            );
        }

        await logMenuItemDeleted(
            session.userId,
            id,
            {
                name: item.name,
                vendorId: vendorProfile._id.toString(),
            },
            request,
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/menu/[id] error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};