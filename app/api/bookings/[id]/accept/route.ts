import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { UserModel } from '@/lib/db/models';
import { requireVendor } from '@/lib/middleware/role-guard';
import { transitionBooking } from '@/lib/booking/transitions';
import { toBookingPublic } from '@/types/booking';
import { logBookingAccepted } from '@/lib/audit/logger';
import { queueBookingAccepted } from '@/lib/email/queue';

// PATCH /api/bookings/[id]/accept — Vendor: accept a requested booking
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

        const { booking, error } = await transitionBooking(
            id,
            'requested',
            { $set: { status: 'vendor_accepted' } },
            { vendorId: vendorProfile._id },
        );

        if (error) return error;

        await logBookingAccepted(
            session.userId,
            id,
            {
                customerId: booking!.customerId.toString(),
                eventDate: booking!.eventDate,
            },
            request,
        );

        const customer = await UserModel.findById(booking!.customerId).lean();
        if (customer) {
            await queueBookingAccepted({
                customerEmail: customer.email,
                customerName: customer.name,
                vendorBusinessName: vendorProfile.businessName,
                eventDate: booking!.eventDate.toLocaleDateString('en-IN'),
                eventAddress: booking!.eventAddress,
                guestCount: booking!.guestCount,
            });
        }

        return NextResponse.json({
            success: true,
            item: toBookingPublic(booking!),
        });
    } catch (error) {
        console.error('PATCH /api/bookings/[id]/accept error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};