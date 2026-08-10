import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { VendorProfileModel, BookingModel, UserModel } from '@/lib/db/models';
import { requireCustomer } from '@/lib/middleware/role-guard';
import { createBookingSchema } from '@/lib/validation/schemas';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { toBookingPublic, type Booking } from '@/types/booking';
import { logBookingRequested } from '@/lib/audit/logger';
import { queueBookingRequested } from '@/lib/email/queue';

// POST /api/bookings — Customer: create a booking request
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireCustomer(request);
        if (authResult instanceof NextResponse) return authResult;
        const session = authResult;

        const body = await request.json();
        const validated = createBookingSchema.parse(body);

        const vendor = await VendorProfileModel.findOne({
            _id: validated.vendorId,
            isActive: true,
        }).lean();

        if (!vendor) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Vendor not found or is not currently accepting bookings',
                },
                { status: 400 },
            );
        }

        const booking = await BookingModel.create({
            customerId: session.userId,
            vendorId: vendor._id,
            eventDate: validated.eventDate,
            eventAddress: validated.eventAddress,
            guestCount: validated.guestCount,
            notes: validated.notes,
            status: 'requested',
        });

        await logBookingRequested(
            session.userId,
            booking._id.toString(),
            {
                vendorId: vendor._id.toString(),
                eventDate: validated.eventDate,
                guestCount: validated.guestCount,
            },
            request,
        );
        
        const [vendorUser, customerUser] = await Promise.all([
            UserModel.findById(vendor.userId).lean(),
            UserModel.findById(session.userId).lean(),
        ]);

        if (vendorUser && customerUser) {
            await queueBookingRequested({
                vendorEmail: vendorUser.email,
                vendorName: vendorUser.name,
                customerName: customerUser.name,
                eventDate: validated.eventDate.toLocaleDateString('en-IN'),
                eventAddress: validated.eventAddress,
                guestCount: validated.guestCount,
                notes: validated.notes,
            });
        }

        return NextResponse.json(
            {
                success: true,
                booking: toBookingPublic(booking.toObject() as Booking),
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/bookings error:', error);

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