import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { BookingModel } from '@/lib/db/models';
import type { Booking, BookingStatus } from '@/types/booking';
import type { QueryFilter, UpdateQuery } from 'mongoose';

export interface TransitionResult {
    booking: Booking | null;
    error: NextResponse | null;
}

export async function transitionBooking(
    bookingId: string,
    requiredStatus: BookingStatus | BookingStatus[],
    updates: UpdateQuery<Booking>,
    additionalFilter: QueryFilter<Booking> = {},
): Promise<TransitionResult> {
    await connectDB();

    const statusFilter = Array.isArray(requiredStatus) ? { $in: requiredStatus } : requiredStatus;

    const booking = await BookingModel.findOneAndUpdate(
        {
            _id: bookingId,
            status: statusFilter,
            ...additionalFilter,
        },
        updates,
        { new: true },
    ).lean<Booking>();


    if (!booking) {
        return {
            booking: null,
            error: NextResponse.json(
                {
                    success: false,
                    error: 'Invalid transition',
                    message: 'Booking not found or this action is no longer valid for its current status',
                },
                { status: 400 },
            ),
        };
    }

    return { booking, error: null }
};