import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
    rating: number;
    size?: 'sm' | 'md';
    className?: string;
}

export function ReviewStars({
    rating,
    size = 'md',
    className,
}: ReviewStarsProps) {
    const rounded = Math.round(rating);
    const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        starSize,
                        star <= rounded
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-none text-muted-foreground',
                    )}
                />
            ))}
        </div>
    );
};