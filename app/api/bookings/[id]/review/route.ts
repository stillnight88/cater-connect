import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { BookingModel, ReviewModel } from '@/lib/db/models';
import { requireCustomer } from '@/lib/middleware/role-guard';
import { createReviewSchema } from '@/lib/validation/schemas/review.schema';
import { formatZodError, isZodError } from '@/lib/validation/helpers';
import { toReviewPublic } from '@/types/review';
import { logReviewCreated } from '@/lib/audit/logger';
import type { Booking } from '@/types/booking';
import type { Review } from '@/types/review';

// POST /api/bookings/[id]/review — Customer: leave a review for a completed booking
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const authResult = await requireCustomer(request);
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
        if (booking.customerId.toString() !== session.userId) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 },
            );
        }
        if (booking.status !== 'completed') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Only completed bookings can be reviewed',
                },
                { status: 400 },
            );
        }

        const body = await request.json();
        const validated = createReviewSchema.parse(body);

        let review;
        try {
            review = await ReviewModel.create({
                bookingId: booking._id,
                vendorId: booking.vendorId,
                customerId: session.userId,
                rating: validated.rating,
                comment: validated.comment,
            });
        } catch (err: unknown) {
            if (isDuplicateKeyError(err)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'This booking has already been reviewed',
                    },
                    { status: 409 },
                );
            }
            throw err;
        }

        await logReviewCreated(
            session.userId,
            review._id.toString(),
            {
                bookingId: booking._id.toString(),
                vendorId: booking.vendorId.toString(),
                rating: validated.rating,
            },
            request,
        );

        return NextResponse.json(
            {
                success: true,
                review: toReviewPublic(review.toObject() as Review),
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/bookings/[id]/review error:', error);

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

function isDuplicateKeyError(err: unknown): boolean {
    return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: unknown }).code === 11000
    );
}