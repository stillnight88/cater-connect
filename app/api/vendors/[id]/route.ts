import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { VendorProfileModel } from '@/lib/db/models';

// GET /api/vendors/[id] — Public: single vendor profile
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await connectDB();

        const { id } = await params;

        const vendor = await VendorProfileModel.findOne({ _id: id, isActive: true })
            .lean()
            .select('_id businessName description phone address');

        if (!vendor) {
            return NextResponse.json(
                { success: false, error: 'Vendor not found' },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            vendor: {
                id: vendor._id.toString(),
                businessName: vendor.businessName,
                description: vendor.description,
                phone: vendor.phone,
                address: vendor.address,
            },
        });
    } catch (error) {
        console.error('GET /api/vendors/[id] error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};