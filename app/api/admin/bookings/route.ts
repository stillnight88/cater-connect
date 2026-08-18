import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { BookingModel } from '@/lib/db/models';
import { requireAdmin } from '@/lib/middleware/role-guard';
import { adminBookingsQuerySchema } from '@/lib/validation/schemas/booking.schema';
import { isZodError, formatZodError } from '@/lib/validation/helpers';
import { toBookingPublic } from '@/types/booking';
import type { Booking } from '@/types/booking';

// GET /api/admin/bookings — Admin: all bookings, filterable by status, paginated
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        let query;
        try {
            query = adminBookingsQuerySchema.parse({
                page: request.nextUrl.searchParams.get('page') ?? undefined,
                limit: request.nextUrl.searchParams.get('limit') ?? undefined,
                status: request.nextUrl.searchParams.get('status') ?? undefined,
            });
        } catch (error) {
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
            throw error;
        }

        const { page, limit, status } = query;
        const filter = status ? { status } : {};
        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            BookingModel.find(filter)
                .lean<Booking[]>()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            BookingModel.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            bookings: bookings.map(toBookingPublic),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('GET /api/admin/bookings error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};