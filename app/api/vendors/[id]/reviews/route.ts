import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/client';
import { VendorProfileModel, ReviewModel } from '@/lib/db/models';
import { toReviewPublic } from '@/types/review';
import type { Review, VendorRatingSummary } from '@/types/review';

// GET /api/vendors/[id]/reviews — Public: review list + aggregate rating
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const vendor = await VendorProfileModel.findOne({
            _id: id,
            isActive: true,
        }).lean();

        if (!vendor) {
            return NextResponse.json(
                { success: false, error: 'Vendor not found' },
                { status: 404 },
            );
        }

        const reviewsPromise = ReviewModel.find({ vendorId: id })
            .lean<Review[]>()
            .sort({ createdAt: -1 });

        const summaryPromise = ReviewModel.aggregate<{
            _id: null;
            averageRating: number;
            reviewCount: number;
        }>([
            { $match: { vendorId: vendor._id } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 },
                },
            }
        ]);

        const [reviews, summaryResult] = await Promise.all([
            reviewsPromise,
            summaryPromise,
        ]);

        const summary: VendorRatingSummary = summaryResult[0]
            ? {
                averageRating:
                    Math.round(summaryResult[0].averageRating * 10) / 10,
                reviewCount: summaryResult[0].reviewCount,
            }
            : { averageRating: 0, reviewCount: 0 };

        return NextResponse.json({
            success: true,
            reviews: reviews.map(toReviewPublic),
            summary,
        });
    } catch (error) {
        console.error('GET /api/vendors/[id]/reviews error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
};