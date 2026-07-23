import { Schema, model, models, type Model } from 'mongoose';
import type { Review } from '@/types/review';

const reviewSchema = new Schema<Review>({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true,
    },
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: { type: String },
}, { timestamps: true });

reviewSchema.index({ vendorId: 1, createdAt: -1 });

export const ReviewModel: Model<Review> =
    models.Review || model<Review>('Review', reviewSchema);