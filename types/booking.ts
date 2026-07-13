import { Types } from 'mongoose';

export type BookingStatus =
    | 'requested'
    | 'vendor_accepted'
    | 'rejected'
    | 'completed'
    | 'cancelled';

export interface Booking {
    _id: Types.ObjectId;
    customerId: Types.ObjectId;     // ref: 'User'
    vendorId: Types.ObjectId;       // ref: 'VendorProfile'
    eventDate: Date;
    eventAddress: string;
    guestCount: number;
    notes?: string;
    status: BookingStatus;
    rejectionReason?: string;
    cancelledBy?: 'customer' | 'vendor';
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface BookingPublic {
    id: string;
    customerId: string;
    vendorId: string;
    eventDate: Date;
    eventAddress: string;
    guestCount: number;
    notes?: string;
    status: BookingStatus;
    rejectionReason?: string;
    cancelledBy?: 'customer' | 'vendor';
    cancelledAt?: Date;
    createdAt: Date;
}

export function toBookingPublic(booking: Booking): BookingPublic {
    return {
        id: booking._id.toString(),
        customerId: booking.customerId.toString(),
        vendorId: booking.vendorId.toString(),
        eventDate: booking.eventDate,
        eventAddress: booking.eventAddress,
        guestCount: booking.guestCount,
        notes: booking.notes,
        status: booking.status,
        rejectionReason: booking.rejectionReason,
        cancelledBy: booking.cancelledBy,
        cancelledAt: booking.cancelledAt,
        createdAt: booking.createdAt,
    };
}