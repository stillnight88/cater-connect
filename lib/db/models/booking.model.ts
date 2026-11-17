import { Schema, model, models, type Model } from 'mongoose';
import type { Booking } from '@/types/booking';

const bookingSchema = new Schema<Booking>({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    eventAddress: {
        type: String,
        required: true,
    },
    guestCount: {
        type: Number,
        required: true,
        min: 1,
    },
    notes: { type: String },
    status: {
        type: String,
        enum: ['requested', 'vendor_accepted', 'rejected', 'completed', 'cancelled'],
        default: 'requested',
        required: true,
    },
    rejectionReason: { type: String },
    cancelledBy: {
        type: String,
        enum: ['customer', 'vendor']
    },
    cancelledAt: { type: Date },
}, { timestamps: true },);

bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ vendorId: 1, status: 1 });
bookingSchema.index({ eventDate: 1 });

export const BookingModel: Model<Booking> =
    models.Booking || model<Booking>('Booking', bookingSchema);