'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import {
    getBookingApi,
    acceptBookingApi,
    cancelBookingApi,
    completeBookingApi,
} from '@/lib/api/booking-api';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RejectDialog, CancelBookingDialog } from '@/components/booking/booking-table';
import { getErrorMessage } from '@/lib/utils/error';
import { rejectBookingApi } from '@/lib/api/booking-api';
import { useParams } from 'next/navigation';

export default function VendorBookingDetailPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();

    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(`/login?redirect=/vendor/bookings/${id}`);
        }
        if (!isLoading && isAuthenticated && user?.role !== 'vendor') {
            toast.error('Only vendor accounts can access this page.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router, id]);

    const { data, isPending: isBookingLoading } = useQuery({
        queryKey: ['booking', id],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return getBookingApi(id, token)
        },
        enabled: user?.role === 'vendor',
    });

    const acceptMutation = useMutation({
        mutationFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired.');
            return acceptBookingApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? 'Failed to accept booking.');
                return;
            }
            toast.success('Booking accepted.');
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
            queryClient.invalidateQueries({
                queryKey: ['bookings', 'incoming'],
            });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err));
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (reason: string) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired.');
            return rejectBookingApi(id, reason, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? 'Failed to reject booking.');
                return;
            }
            toast.success('Booking rejected.');
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
            queryClient.invalidateQueries({ queryKey: ['bookings', 'incoming'] });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err));
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired.');
            return cancelBookingApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? 'Failed to cancel booking.');
                return;
            }
            toast.success('Booking cancelled.');
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
            queryClient.invalidateQueries({ queryKey: ['bookings', 'incoming'] });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err));
        },
    });

    const completeMutation = useMutation({
        mutationFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired.');
            return completeBookingApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? 'Failed to mark as complete.');
                return;
            }
            toast.success('Booking marked as complete.');
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
            queryClient.invalidateQueries({ queryKey: ['bookings', 'incoming'] });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err));
        },
    });


    if (isLoading || !isAuthenticated || user?.role !== 'vendor') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isBookingLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data?.success) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10">
                <p className="text-sm text-destructive">
                    {data?.error ?? 'Booking not found.'}
                </p>
            </div>
        );
    }

    const booking = data.booking;
    const isActing =
        acceptMutation.isPending ||
        rejectMutation.isPending ||
        cancelMutation.isPending ||
        completeMutation.isPending;

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <Link
                href="/vendor/bookings"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                All bookings
            </Link>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Booking detail
                </h1>
                <BookingStatusBadge status={booking.status} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Event details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground">Event date</p>
                            <p className="font-medium mt-0.5">
                                {new Date(
                                    booking.eventDate,
                                ).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Guests</p>
                            <p className="font-medium mt-0.5">
                                {booking.guestCount}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium mt-0.5">
                            {booking.eventAddress}
                        </p>
                    </div>

                    {booking.notes && (
                        <div>
                            <p className="text-muted-foreground">
                                Notes from customer
                            </p>
                            <p className="font-medium mt-0.5">
                                {booking.notes}
                            </p>
                        </div>
                    )}

                    {booking.rejectionReason && (
                        <div>
                            <p className="text-muted-foreground">
                                Rejection reason
                            </p>
                            <p className="font-medium mt-0.5">
                                {booking.rejectionReason}
                            </p>
                        </div>
                    )}

                    {booking.cancelledBy && (
                        <div>
                            <p className="text-muted-foreground">
                                Cancelled by
                            </p>
                            <p className="font-medium mt-0.5 capitalize">
                                {booking.cancelledBy}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {!isActing && (
                <div className="flex flex-wrap items-center gap-3 mt-6">
                    {booking.status === 'requested' && (
                        <>
                            <Button
                                size="sm"
                                onClick={() => acceptMutation.mutate()}
                            >
                                Accept booking
                            </Button>

                            <RejectDialog
                                bookingId={booking.id}
                                onConfirm={(reason) => rejectMutation.mutate(reason)}
                                isPending={rejectMutation.isPending}
                            />
                        </>
                    )}

                    {booking.status === 'vendor_accepted' && (
                        <>
                            <Button
                                size="sm"
                                onClick={() => completeMutation.mutate()}
                            >
                                Mark as complete
                            </Button>

                            <CancelBookingDialog
                                onConfirm={() => cancelMutation.mutate()}
                                isPending={cancelMutation.isPending}
                                triggerLabel="Cancel booking"
                                notifyLabel="The customer"
                            />
                        </>
                    )}
                </div>
            )}

            {isActing && (
                <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                </div>
            )}
        </div>
    );
}