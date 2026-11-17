import type { BookingPublic, BookingStatus } from '@/types/booking';

export interface BookingGroups {
    active: BookingPublic[];      // requested + vendor_accepted (customer view)
    requested: BookingPublic[];   // vendor: needs a response
    accepted: BookingPublic[];    // vendor: confirmed, upcoming
    past: BookingPublic[];        // rejected + completed + cancelled (either view)
}

const PAST_STATUSES: BookingStatus[] = ['rejected', 'completed', 'cancelled'];

export function groupBookingsByStage(bookings: BookingPublic[]): BookingGroups {
    return {
        active: bookings.filter((b) => b.status === 'requested' || b.status === 'vendor_accepted'),
        requested: bookings.filter((b) => b.status === 'requested'),
        accepted: bookings.filter((b) => b.status === 'vendor_accepted'),
        past: bookings.filter((b) => PAST_STATUSES.includes(b.status)),
    }
};

