import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { MenuItemModel } from '@/lib/db/models';
import { requireVendor } from '@/lib/middleware/role-guard';
import { createMenuItemSchema } from '@/lib/validation/schemas';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { toMenuItemPublic, type MenuItem } from '@/types/menu';
import { logMenuItemCreated } from '@/lib/audit/logger';

// GET /api/menu — Vendor: own full menu list including drafts
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireVendor(request);
        if (authResult instanceof NextResponse) return authResult;
        const session = authResult;

        const { profile: vendorProfile, error } = await resolveVendorProfile(session.userId);
        if (error) return error;

        const items = await MenuItemModel.find({
            vendorId: vendorProfile._id,
            isDeleted: false,
        })
            .lean<MenuItem[]>()
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            items: items.map(toMenuItemPublic)
        })
    } catch (error) {
        console.error('GET /api/menu error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};

// POST /api/menu — Vendor: create a new menu item (starts as draft)
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireVendor(request);
        if (authResult instanceof NextResponse) return authResult;
        const session = authResult;

        const { profile: vendorProfile, error } = await resolveVendorProfile(session.userId);
        if (error) return error;

        const body = await request.json();
        const validated = createMenuItemSchema.parse(body);

        const item = await MenuItemModel.create({
            vendorId: vendorProfile._id,
            name: validated.name,
            description: validated.description,
            price: validated.price,
            category: validated.category,
            status: 'draft',
            isDeleted: false,
        });

        await logMenuItemCreated(
            session.userId,
            item._id.toString(),
            {
                name: item.name,
                vendorId: vendorProfile._id.toString(),
            },
            request,
        );

        return NextResponse.json(
            { success: true, item: toMenuItemPublic(item.toObject() as MenuItem) },
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/menu error:', error);

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