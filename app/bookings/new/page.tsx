'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, CalendarIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { createBookingApi } from '@/lib/api/booking-api';
import { getVendorsApi } from '@/lib/api/vendor-api';
import {
    createBookingSchema,
    type CreateBookingInput,
    type CreateBookingFormInput
} from '@/lib/validation/schemas/booking.schema';
import { getErrorMessage } from '@/lib/utils/error';
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function NewBookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();

    const prefilledVendorId = searchParams.get('vendorId') ?? '';

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/bookings/new');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'customer') {
            toast.error('Only customer accounts can create bookings.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    const form = useForm<CreateBookingFormInput, object, CreateBookingInput>({
        resolver: zodResolver(createBookingSchema),
        defaultValues: {
            vendorId: prefilledVendorId,
            eventDate: undefined,
            eventAddress: '',
            guestCount: 1,
            notes: '',
        },
    });

    const { data: vendorsData } = useQuery({
        queryKey: ['vendors'],
        queryFn: () => getVendorsApi(),
        enabled: user?.role === 'customer',
    });

    const vendors = vendorsData?.success ? vendorsData.vendors : [];

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: CreateBookingInput) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return createBookingApi(data, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error ?? 'Failed to create booking.');
                return;
            }
            queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] });
            toast.success('Booking request sent.');
            console.log(result.booking.id);
            router.push(`/bookings/${result.booking.id}`);
        },
        onError: (err) => {
            toast.error(getErrorMessage(err.message));
        },
    });

    if (isLoading || !isAuthenticated || user?.role !== 'customer') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-10">
            <Link
                href="/vendors"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Browse vendors
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Request a booking
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in your event details. The vendor will accept or
                    reject your request.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Event details</CardTitle>
                    <CardDescription>
                        All fields except notes are required.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={form.handleSubmit((data) => mutate(data))}
                        className="space-y-6"
                        noValidate
                    >
                        <FieldGroup>
                            <Controller
                                name="vendorId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="vendorId">
                                            Vendor
                                        </FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id="vendorId"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <SelectValue placeholder="Select a vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vendors.map((v) => (
                                                    <SelectItem
                                                        key={v.id}
                                                        value={v.id}
                                                    >
                                                        {v.businessName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="eventDate"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="eventDate">
                                            Event date
                                        </FieldLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="eventDate"
                                                    variant="outline"
                                                    className="w-full justify-start font-normal"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    {field.value ? (
                                                        format(field.value as Date, 'PPP')
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            Pick a date
                                                        </span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value as Date | undefined}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
                                                    captionLayout="label"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="eventAddress"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Event address
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Full address where the event will be held"
                                            rows={3}
                                            disabled={isPending}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="guestCount"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Number of guests
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="number"
                                            min={1}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="e.g. 50"
                                            disabled={isPending}
                                            onChange={(e) =>
                                                field.onChange(
                                                    parseInt(
                                                        e.target.value,
                                                        10,
                                                    ) || 1,
                                                )
                                            }
                                        />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="notes"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Notes{' '}
                                            <span className="text-muted-foreground font-normal">
                                                (optional)
                                            </span>
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Dietary requirements, theme, special requests..."
                                            rows={3}
                                            disabled={isPending}
                                        />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending request…
                                </>
                            ) : (
                                'Send booking request'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}