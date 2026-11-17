'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { getMyBookingsApi } from '@/lib/api/booking-api';
import { BookingTable } from '@/components/booking/booking-table';
import { groupBookingsByStage } from '@/lib/booking/grouping';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function MyBookingsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/bookings');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'customer') {
            toast.error('Only customer accounts can view this page.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    const { data, isPending: isBookingsLoading } = useQuery({
        queryKey: ['bookings', 'mine'],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return getMyBookingsApi(token);
        },
        enabled: user?.role === 'customer',
    });

    if (isLoading || !isAuthenticated || user?.role !== 'customer') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const bookings = data?.success ? data.bookings : [];

    const { active, past } = groupBookingsByStage(bookings);

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        My bookings
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track and manage your catering event requests.
                    </p>
                </div>
                <Button asChild size="sm">
                    <Link href="/bookings/new">New booking</Link>
                </Button>
            </div>

            {isBookingsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading bookings…
                </div>
            ) : (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Active</CardTitle>
                            <CardDescription>
                                {active.length} active booking
                                {active.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingTable
                                bookings={active}
                                mode="customer"
                                queryKey={['bookings', 'mine']}
                                emptyMessage="No active bookings. Browse vendors to make your first booking request."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Past</CardTitle>
                            <CardDescription>
                                Completed, rejected, and cancelled bookings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingTable
                                bookings={past}
                                mode="customer"
                                queryKey={['bookings', 'mine']}
                                emptyMessage="No past bookings yet."
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}