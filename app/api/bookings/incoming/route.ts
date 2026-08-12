import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { BookingModel } from '@/lib/db/models';
import { requireVendor } from '@/lib/middleware/role-guard';
import { toBookingPublic, type Booking } from '@/types/booking';

// GET /api/bookings/incoming — Vendor: all incoming bookings sorted by event date
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireVendor(request);
        if (authResult instanceof NextResponse) return authResult;
        const session = authResult;

        const { profile: vendorProfile, error } = await resolveVendorProfile(session.userId);
        if (error) return error;

        const bookings = await BookingModel.find({ vendorId: vendorProfile._id })
            .lean<Booking[]>()
            .sort({ eventDate: 1 });

        return NextResponse.json(
            {
                success: true,
                bookings: bookings.map(toBookingPublic)
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('GET /api/bookings/incoming error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};