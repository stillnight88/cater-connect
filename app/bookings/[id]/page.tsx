'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { getBookingApi, cancelBookingApi } from '@/lib/api/booking-api';
import { createReviewApi } from '@/lib/api/booking-api';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { CancelBookingDialog } from '@/components/booking/booking-table';
import { getErrorMessage } from '@/lib/utils/error';
import { ReviewForm } from '@/components/review/review-form';
import type { CreateReviewInput } from '@/lib/validation/schemas/review.schema';
import { useParams } from 'next/navigation';

export default function BookingDetailPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();

    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(`/login?redirect=/bookings/${id}`);
        }
        if (!isLoading && isAuthenticated && user?.role !== 'customer') {
            toast.error('Only customer accounts can view this page.');
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
        enabled: user?.role === 'customer',
    });

    const cancelMutation = useMutation({
        mutationFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return cancelBookingApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? 'Failed to cancel booking.');
                return;
            }
            toast.success('Booking cancelled.');
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
            queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err.message));
        },
    });

    const reviewMutation = useMutation({
        mutationFn: async (data: CreateReviewInput) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return createReviewApi(id, data, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? 'Failed to submit review.');
                return;
            }
            toast.success('Review submitted. Thank you!');
            queryClient.invalidateQueries({ queryKey: ['booking', id] });
        },
        onError: (err) => {
            toast.error(getErrorMessage(err));
        },
    });

    if (isLoading || !isAuthenticated || user?.role !== 'customer') {
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
            <div className="max-w-2xl mx-auto px-4 py-10">
                <p className="text-sm text-destructive">
                    {data?.error ?? 'Booking not found.'}
                </p>
            </div>
        );
    }

    const booking = data.booking;
    const canCancel = booking.status === 'requested' || booking.status === 'vendor_accepted';

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <Link
                href="/bookings"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                My bookings
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
                            <p className="text-muted-foreground">Notes</p>
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

            {canCancel && (
                <div className="mt-6">
                    <CancelBookingDialog
                        onConfirm={() => cancelMutation.mutate()}
                        isPending={cancelMutation.isPending}
                        triggerLabel="Cancel booking"
                        notifyLabel="The vendor"
                    />
                </div>
            )}

            {booking.status === 'completed' && !booking.hasReviewed && (
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Leave a review
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ReviewForm
                                onSubmit={(data) => reviewMutation.mutate(data)}
                                isPending={reviewMutation.isPending}
                                error={
                                    reviewMutation.data && !reviewMutation.data.success
                                        ? reviewMutation.data.error
                                        : null
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {booking.status === 'completed' && booking.hasReviewed && (
                <p className="text-sm text-muted-foreground mt-8">
                    Thank you for your review.
                </p>
            )}

        </div>
    );
}