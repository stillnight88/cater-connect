import { NextResponse } from 'next/server';
import { VendorProfileModel } from '@/lib/db/models';
import { connectDB } from '@/lib/db/client';

// GET /api/vendors — Public: list all active vendors
export async function GET() {
    try {
        await connectDB();

        const vendors = await VendorProfileModel.find({ isActive: true })
            .lean()
            .select('_id businessName description phone address');

        const mapped = vendors.map((v) => ({
            id: v._id.toString(),
            businessName: v.businessName,
            description: v.description,
            phone: v.phone,
            address: v.address,
        }));

        return NextResponse.json({ success: true, vendors: mapped });
    } catch (error) {
        console.error('GET /api/vendors error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};