import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { UserModel } from '@/lib/db/models';
import { requireVendor } from '@/lib/middleware/role-guard';
import { rejectBookingSchema } from '@/lib/validation/schemas/booking.schema';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { transitionBooking } from '@/lib/booking/transitions';
import { toBookingPublic } from '@/types/booking';
import { logBookingRejected } from '@/lib/audit/logger';
import { queueBookingRejected } from '@/lib/email/queue';

// PATCH /api/bookings/[id]/reject — Vendor: reject a requested booking
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

        const body = await request.json();
        const validated = rejectBookingSchema.parse(body);

        const { booking, error } = await transitionBooking(
            id,
            'requested',
            {
                $set: {
                    status: 'rejected',
                    rejectionReason: validated.rejectionReason,
                },
            },
            { vendorId: vendorProfile._id },
        );

        if (error) return error;

        await logBookingRejected(
            session.userId,
            id,
            {
                customerId: booking!.customerId.toString(),
                rejectionReason: validated.rejectionReason
            },
            request,
        );

        const customer = await UserModel.findById(booking!.customerId).lean();
        if (customer) {
            await queueBookingRejected({
                customerEmail: customer.email,
                customerName: customer.name,
                vendorBusinessName: vendorProfile.businessName,
                eventDate: booking!.eventDate.toLocaleDateString('en-IN'),
                rejectionReason: validated.rejectionReason,
            });
        }

        return NextResponse.json({
            success: true,
            item: toBookingPublic(booking!),
        });
    } catch (error) {
        console.error('PATCH /api/bookings/[id]/reject error:', error);

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