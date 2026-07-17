import { z } from 'zod';

export const createBookingSchema = z.object({
    vendorId: z.string().min(1),
    eventDate: z.coerce.date().refine(
        (date) => date > new Date(),
        { message: 'Event date must be in the future' },
    ),
    eventAddress: z.string().min(10).max(300),
    guestCount: z.number().int().min(1).max(10000),
    notes: z.string().max(1000).optional(),
});

export const rejectBookingSchema = z.object({
    rejectionReason: z.string().min(10, 'Please provide a reason of at least 10 characters'),
});

export const adminBookingsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z
        .enum(['requested', 'vendor_accepted', 'rejected', 'completed', 'cancelled'])
        .optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>; 
export type AdminBookingsQuery = z.infer<typeof adminBookingsQuerySchema>;