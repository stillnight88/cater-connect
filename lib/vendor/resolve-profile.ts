import { NextResponse } from 'next/server';
import { VendorProfileModel } from '@/lib/db/models';

export interface ResolveVendorProfileSuccess {
    profile: {
        _id: string;
        userId: string;
        businessName: string;
        description: string;
        phone: string;
        address: string;
        isActive: boolean;
    };
    error: null;
}

export interface ResolveVendorProfileFailure {
    profile: null;
    error: NextResponse;
}

export async function resolveVendorProfile(userId: string): Promise<ResolveVendorProfileSuccess | ResolveVendorProfileFailure> {
    const profile = await VendorProfileModel.findOne({ userId }).lean();

    if (!profile) {
        return {
            profile: null,
            error: NextResponse.json(
                { success: false, error: 'Vendor profile not found' },
                { status: 404 },
            ),
        };
    }

    return {
        profile: {
            _id: profile._id.toString(),
            userId: profile.userId.toString(),
            businessName: profile.businessName,
            description: profile.description,
            phone: profile.phone,
            address: profile.address,
            isActive: profile.isActive,
        },
        error: null,
    };
};