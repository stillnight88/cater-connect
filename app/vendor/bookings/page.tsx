'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { getIncomingBookingsApi } from '@/lib/api/booking-api';
import { groupBookingsByStage } from '@/lib/booking/grouping';
import { BookingTable } from '@/components/booking/booking-table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function VendorBookingsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/vendor/bookings');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'vendor') {
            toast.error('Only vendor accounts can access this page.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    const { data, isPending: isBookingsLoading } = useQuery({
        queryKey: ['bookings', 'incoming'],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return getIncomingBookingsApi(token)
        },
        enabled: user?.role === 'vendor',
    });

    if (isLoading || !isAuthenticated || user?.role !== 'vendor') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const bookings = data?.success ? data.bookings : [];

    const { requested, accepted, past } = groupBookingsByStage(bookings);

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Bookings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review and manage incoming booking requests for your
                    catering services.
                </p>
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
                            <CardTitle className="text-base">
                                Pending requests
                            </CardTitle>
                            <CardDescription>
                                {requested.length} request
                                {requested.length !== 1 ? 's' : ''} awaiting
                                your response
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingTable
                                bookings={requested}
                                mode="vendor"
                                queryKey={['bookings', 'incoming']}
                                emptyMessage="No pending requests. New booking requests will appear here."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Confirmed
                            </CardTitle>
                            <CardDescription>
                                {accepted.length} confirmed event
                                {accepted.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingTable
                                bookings={accepted}
                                mode="vendor"
                                queryKey={['bookings', 'incoming']}
                                emptyMessage="No confirmed bookings yet."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Past
                            </CardTitle>
                            <CardDescription>
                                Completed, rejected, and cancelled bookings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingTable
                                bookings={past}
                                mode="vendor"
                                queryKey={['bookings', 'incoming']}
                                emptyMessage="No past bookings yet."
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}