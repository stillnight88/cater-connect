import { Types } from 'mongoose';

export interface Review {
    _id: Types.ObjectId;
    bookingId: Types.ObjectId;      
    vendorId: Types.ObjectId;       // ref: 'VendorProfile' — denormalized for query efficiency
    customerId: Types.ObjectId;     
    rating: number;                 
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReviewPublic {
    id: string;
    vendorId: string;
    customerId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}

export function toReviewPublic(review: Review): ReviewPublic {
    return {
        id: review._id.toString(),
        vendorId: review.vendorId.toString(),
        customerId: review.customerId.toString(),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
    };
}

export interface VendorRatingSummary {
    averageRating: number;  
    reviewCount: number;
}