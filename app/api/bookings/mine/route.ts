import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { BookingModel } from '@/lib/db/models';
import { requireCustomer } from '@/lib/middleware/role-guard';
import { toBookingPublic, type Booking } from '@/types/booking';

// GET /api/bookings/mine — Customer: own bookings sorted by newest first
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireCustomer(request);
        if (authResult instanceof NextResponse) return authResult;
        const session = authResult;

        const bookings = await BookingModel.find({ customerId: session.userId })
            .lean<Booking[]>()
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                bookings: bookings.map(toBookingPublic)
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('GET /api/bookings/mine error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};