import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { resolveVendorProfile } from '@/lib/vendor/resolve-profile';
import { BookingModel } from '@/lib/db/models';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { toBookingPublic, type Booking } from '@/types/booking';
import { ReviewModel } from '@/lib/db/models';

// GET /api/bookings/[id] — Customer, Vendor, or Admin: single booking detail
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) return authResult;
        const session = authResult;

        const { id } = await params;

        const booking = await BookingModel.findById(id).lean<Booking>();
        if (!booking) {
            return NextResponse.json(
                { success: false, error: 'Booking not found' },
                { status: 404 },
            );
        }

        if (session.role === 'admin') {
            return NextResponse.json({
                success: true,
                booking: toBookingPublic(booking),
            });
        }

        if (session.role === 'customer') {
            if (booking.customerId.toString() !== session.userId) {
                return NextResponse.json(
                    { success: false, error: 'Forbidden' },
                    { status: 403 },
                );
            }

            const hasReviewed = booking.status === 'completed'
                ? Boolean(await ReviewModel.exists({ bookingId: booking._id }))
                : false;

            return NextResponse.json({
                success: true,
                booking: {
                    ...toBookingPublic(booking),
                    hasReviewed,
                },
            });
        }

        if (session.role === 'vendor') {
            const { profile: vendorProfile, error } = await resolveVendorProfile(session.userId);
            if (error) return error;
            if (booking.vendorId.toString() !== vendorProfile._id) {
                return NextResponse.json(
                    { success: false, error: 'Forbidden' },
                    { status: 403 },
                );
            }
            return NextResponse.json({
                success: true,
                booking: toBookingPublic(booking),
            });
        }

        return NextResponse.json(
            { success: false, error: 'Forbidden' },
            { status: 403 },
        );
    } catch (error) {
        console.error('GET /api/bookings/[id] error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};