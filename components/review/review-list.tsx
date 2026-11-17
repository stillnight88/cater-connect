import { ReviewStars } from '@/components/review/review-stars';
import type { ReviewPublic, VendorRatingSummary } from '@/types/review';

interface ReviewListProps {
    reviews: ReviewPublic[];
    summary: VendorRatingSummary;
}

export function ReviewList({ reviews, summary }: ReviewListProps) {
    if (summary.reviewCount === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No reviews yet. Reviews appear here once customers complete
                a booking with this vendor.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <ReviewStars rating={summary.averageRating} />
                <span className="text-sm font-medium">
                    {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                    ({summary.reviewCount} review
                    {summary.reviewCount !== 1 ? 's' : ''})
                </span>
            </div>


            <ul className="divide-y divide-border">
                {reviews.map((review) => (
                    <li key={review.id} className="py-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <ReviewStars rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">
                                {new Date(
                                    review.createdAt,
                                ).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-muted-foreground">
                                {review.comment}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}