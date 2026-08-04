import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { VendorProfileModel, MenuItemModel } from '@/lib/db/models';
import { toMenuItemPublic } from '@/types/menu';
import type { MenuItem } from '@/types/menu';

// GET /api/vendors/[id]/menu — Public: published menu items for a vendor
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        const vendor = await VendorProfileModel.findOne({
            _id: id,
            isActive: true,
        }).lean();

        if (!vendor) {
            return NextResponse.json(
                { success: false, error: 'Vendor not found' },
                { status: 404 },
            );
        }

        const items = await MenuItemModel.find({
            vendorId: id,
            status: 'published',
            isDeleted: false,
        })
            .lean<MenuItem[]>()
            .sort({ category: 1, createdAt: 1 });

        return NextResponse.json({
            success: true,
            items: items.map(toMenuItemPublic),
        });
    } catch (error) {
        console.error('GET /api/vendors/[id]/menu error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};