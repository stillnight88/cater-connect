import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { BookingModel } from '@/lib/db/models';
import { requireVendor } from '@/lib/middleware/role-guard';
import { transitionBooking } from '@/lib/booking/transitions';
import { toBookingPublic, type Booking } from '@/types/booking';
import { logBookingCompleted } from '@/lib/audit/logger';

// PATCH /api/bookings/[id]/complete — Vendor: mark accepted booking as complete
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

        const { profile: vendorProfile, error: vendorError } = await resolveVendorProfile(session.userId);
        if (vendorError) return vendorError;

        const existing = await BookingModel.findOne({
            _id: id,
            vendorId: vendorProfile._id,
            status: 'vendor_accepted',
        }).lean<Booking>();

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Booking not found or not in accepted status',
                },
                { status: 400 },
            );
        }
        if (existing.eventDate > new Date()) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Booking cannot be marked complete before the event date',
                },
                { status: 400 },
            );
        }

        const { booking, error } = await transitionBooking(
            id,
            'vendor_accepted',
            { $set: { status: 'completed' } },
            { vendorId: vendorProfile._id },
        );

        if (error) return error;

        await logBookingCompleted(
            session.userId,
            id,
            {
                customerId: booking!.customerId.toString(),
                vendorId: vendorProfile._id.toString(),
            },
            request,
        );

        return NextResponse.json({
            success: true,
            item: toBookingPublic(booking!),
        });
    } catch (error) {
        console.error('PATCH /api/bookings/[id]/complete error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};