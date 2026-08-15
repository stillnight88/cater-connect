import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { VendorProfileModel, UserModel } from '@/lib/db/models';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { transitionBooking } from '@/lib/booking/transitions';
import { toBookingPublic } from '@/types/booking';
import { logBookingCancelled } from '@/lib/audit/logger';
import { queueBookingCancelled } from '@/lib/email/queue';

// PATCH /api/bookings/[id]/cancel — Customer or Vendor: cancel a booking
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) return authResult;
        const session = authResult;

        const { id } = await params;

        if (session.role === 'customer') {
            const { booking, error } = await transitionBooking(
                id,
                ['requested', 'vendor_accepted'],
                {
                    $set: {
                        status: 'cancelled',
                        cancelledBy: 'customer',
                        cancelledAt: new Date(),
                    },
                },
                { customerId: session.userId },
            );

            if (error) return error;

            await logBookingCancelled(
                session.userId,
                id,
                {
                    cancelledBy: 'customer',
                    eventDate: booking!.eventDate,
                },
                request,
            );

            const vendorProfile = await VendorProfileModel.findById(
                booking!.vendorId,
            ).lean();
            const vendorUser = vendorProfile
                ? await UserModel.findById(vendorProfile.userId).lean()
                : null;

            if (vendorUser && vendorProfile) {
                await queueBookingCancelled({
                    recipientEmail: vendorUser.email,
                    recipientName: vendorUser.name,
                    cancelledByName: session.email,
                    cancelledBy: 'customer',
                    eventDate: booking!.eventDate.toLocaleDateString('en-IN'),
                    eventAddress: booking!.eventAddress,
                });
            }

            return NextResponse.json({
                success: true,
                booking: toBookingPublic(booking!),
            });
        }

        if (session.role === 'vendor') {
            const { profile: vendorProfile, error: vendorError } = await resolveVendorProfile(session.userId);
            if (vendorError) return vendorError;

            const { booking, error } = await transitionBooking(
                id,
                'vendor_accepted',
                {
                    $set: {
                        status: 'cancelled',
                        cancelledBy: 'vendor',
                        cancelledAt: new Date(),
                    },
                },
                { vendorId: vendorProfile._id },
            );

            if (error) return error;

            await logBookingCancelled(
                session.userId,
                id,
                {
                    cancelledBy: 'vendor',
                    eventDate: booking!.eventDate,
                },
                request,
            );

            const customer = await UserModel.findById(
                booking!.customerId,
            ).lean();

            if (customer) {
                await queueBookingCancelled({
                    recipientEmail: customer.email,
                    recipientName: customer.name,
                    cancelledByName: vendorProfile.businessName,
                    cancelledBy: 'vendor',
                    eventDate: booking!.eventDate.toLocaleDateString('en-IN'),
                    eventAddress: booking!.eventAddress,
                });
            }

            return NextResponse.json({
                success: true,
                booking: toBookingPublic(booking!),
            });
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Only the customer or vendor party can cancel a booking',
            },
            { status: 403 },
        );
    } catch (error) {
        console.error('PATCH /api/bookings/[id]/cancel error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};