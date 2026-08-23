import { Badge } from '@/components/ui/badge';
import type { BookingStatus } from '@/types/booking';

const STATUS_CONFIG: Record<
    BookingStatus,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className?: string;
    }
> = {
    requested: {
        label: 'Requested',
        variant: 'secondary',
    },
    vendor_accepted: {
        label: 'Confirmed',
        variant: 'outline',
        className: 'border-green-600 text-green-600',
    },
    rejected: {
        label: 'Rejected',
        variant: 'destructive',
    },
    completed: {
        label: 'Completed',
        variant: 'outline',
        className: 'border-blue-600 text-blue-600',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'outline',
        className: 'border-muted-foreground text-muted-foreground',
    },
};

interface BookingStatusBadgeProps {
    status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <Badge
            variant={config.variant}
            className={config.className}
        >
            {config.label}
        </Badge>
    );
};