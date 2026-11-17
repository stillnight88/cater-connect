'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { getAdminBookingsApi } from '@/lib/api/booking-api';
import { BookingTable } from '@/components/booking/booking-table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import type { BookingStatus } from '@/types/booking';

const STATUS_OPTIONS: { label: string; value: BookingStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Requested', value: 'requested' },
    { label: 'Confirmed', value: 'vendor_accepted' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

export default function AdminBookingsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/admin/bookings');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'admin') {
            toast.error('Admin access only.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    const { data, isPending: isBookingsLoading } = useQuery({
        queryKey: ['admin', 'bookings', statusFilter],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return getAdminBookingsApi(token, statusFilter === 'all' ? undefined : statusFilter,)
        },
        enabled: user?.role === 'admin',
    });

    if (isLoading || !isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const bookings = data?.success ? data.bookings : [];
    const pagination = data?.success ? data.pagination : null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        All bookings
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Platform-wide booking overview.
                    </p>
                </div>

                <Select
                    value={statusFilter}
                    onValueChange={(v) =>
                        setStatusFilter(v as BookingStatus | 'all')
                    }
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Bookings</CardTitle>
                    {pagination && (
                        <CardDescription>
                            {pagination.total} booking
                            {pagination.total !== 1 ? 's' : ''} total
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    {isBookingsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading bookings…
                        </div>
                    ) : (
                        <BookingTable
                            bookings={bookings}
                            mode="admin"
                            queryKey={['admin', 'bookings', statusFilter]}
                            emptyMessage="No bookings found for this filter."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}