'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import { useAuth } from '@/components/providers/auth-provider';
import {
    acceptBookingApi,
    rejectBookingApi,
    cancelBookingApi,
} from '@/lib/api/booking-api';
import {
    rejectBookingSchema,
    type RejectBookingInput,
} from '@/lib/validation/schemas/booking.schema';
import type { BookingPublic } from '@/types/booking';
import Link from 'next/link';

interface RejectDialogProps {
    bookingId: string;
    onConfirm: (reason: string) => void;
    isPending: boolean;
}

export function RejectDialog({
    onConfirm,
    isPending,
}: RejectDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<RejectBookingInput>({
        resolver: zodResolver(rejectBookingSchema),
        defaultValues: { rejectionReason: '' },
    });

    function handleSubmit(data: RejectBookingInput) {
        onConfirm(data.rejectionReason);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Reject
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject booking</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4 pt-2"
                >
                    <FieldGroup>
                        <Controller
                            name="rejectionReason"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Reason for rejection
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Explain why you are unable to accept this booking..."
                                        rows={3}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            size="sm"
                            disabled={isPending}
                        >
                            {isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Confirm rejection
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface CancelBookingDialogProps {
    onConfirm: () => void;
    isPending: boolean;
    triggerLabel?: string;
    notifyLabel: string;
}

export function CancelBookingDialog({
    onConfirm,
    isPending,
    triggerLabel = 'Cancel',
    notifyLabel,
}: CancelBookingDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        triggerLabel
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {notifyLabel} will be notified. This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep booking</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Yes, cancel
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

type TableMode = 'customer' | 'vendor' | 'admin';

interface BookingTableProps {
    bookings: BookingPublic[];
    mode: TableMode;
    queryKey: string[];
    emptyMessage?: string;
}

export function BookingTable({
    bookings,
    mode,
    queryKey,
    emptyMessage = 'No bookings found.',
}: BookingTableProps) {
    const { getAccessToken } = useAuth();
    const queryClient = useQueryClient();
    const [actionError, setActionError] = useState<string | null>(null);

    const acceptMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return acceptBookingApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                setActionError(result.error);
                return;
            }
            setActionError(null);
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string; }) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return rejectBookingApi(id, reason, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                setActionError(result.error);
                return;
            }
            setActionError(null);
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return cancelBookingApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                setActionError(result.error);
                return;
            }
            setActionError(null);
            queryClient.invalidateQueries({ queryKey });
        },
    });

    if (bookings.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-6">
                {emptyMessage}
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {actionError && (<p className="text-sm text-destructive">{actionError}</p>)}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map((booking) => {
                        const isActing =
                            (acceptMutation.isPending &&
                                acceptMutation.variables === booking.id) ||
                            (rejectMutation.isPending &&
                                rejectMutation.variables?.id === booking.id) ||
                            (cancelMutation.isPending &&
                                cancelMutation.variables === booking.id);

                        const detailHref =
                            mode === 'vendor'
                                ? `/vendor/bookings/${booking.id}`
                                : `/bookings/${booking.id}`;

                        return (
                            <TableRow key={booking.id}>
                                <TableCell className="text-sm">
                                    {new Date(
                                        booking.eventDate,
                                    ).toLocaleDateString('en-IN')}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-50 truncate">
                                    {booking.eventAddress}
                                </TableCell>
                                <TableCell className="text-sm tabular-nums">
                                    {booking.guestCount}
                                </TableCell>
                                <TableCell>
                                    <BookingStatusBadge
                                        status={booking.status}
                                    />
                                </TableCell>

                                <TableCell className="text-right">
                                    {isActing ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
                                    ) : (
                                        <div className="flex items-center justify-end gap-2">
                                            {/* View — always available, every mode */}
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Link href={detailHref}>
                                                    View
                                                </Link>
                                            </Button>

                                            {/* Vendor actions */}
                                            {mode === 'vendor' &&
                                                booking.status ===
                                                'requested' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                acceptMutation.mutate(
                                                                    booking.id,
                                                                )
                                                            }
                                                        >
                                                            Accept
                                                        </Button>
                                                        <RejectDialog
                                                            bookingId={
                                                                booking.id
                                                            }
                                                            onConfirm={(
                                                                reason,
                                                            ) =>
                                                                rejectMutation.mutate(
                                                                    {
                                                                        id: booking.id,
                                                                        reason,
                                                                    },
                                                                )
                                                            }
                                                            isPending={
                                                                rejectMutation.isPending
                                                            }
                                                        />
                                                    </>
                                                )}

                                            {/* Customer cancel */}
                                            {mode === 'customer' &&
                                                (booking.status ===
                                                    'requested' ||
                                                    booking.status ===
                                                    'vendor_accepted') && (
                                                    <CancelBookingDialog
                                                        onConfirm={() => cancelMutation.mutate(booking.id)}
                                                        isPending={
                                                            cancelMutation.isPending &&
                                                            cancelMutation.variables === booking.id
                                                        }
                                                        notifyLabel="The vendor"
                                                    />
                                                )}

                                            {/* Vendor cancel from accepted */}
                                            {mode === 'vendor' &&
                                                booking.status ===
                                                'vendor_accepted' && (
                                                    <CancelBookingDialog
                                                        onConfirm={() => cancelMutation.mutate(booking.id)}
                                                        isPending={
                                                            cancelMutation.isPending &&
                                                            cancelMutation.variables === booking.id
                                                        }
                                                        notifyLabel="The customer"
                                                    />
                                                )}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}