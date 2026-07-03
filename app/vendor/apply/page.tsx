'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

import {
    submitVendorApplicationSchema,
    type SubmitVendorApplicationInput,
} from '@/lib/validation/schemas/vendor.schema';
import { submitVendorApplicationApi } from '@/lib/api/vendor-api';
import { useAuth } from '@/components/providers/auth-provider';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';

export default function VendorApplyPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/vendor/apply');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'customer') {
            toast.error('Only customer accounts can apply to become a vendor.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, router, user]);

    const form = useForm<SubmitVendorApplicationInput>({
        resolver: zodResolver(submitVendorApplicationSchema),
        defaultValues: {
            businessName: '',
            description: '',
            phone: '',
            address: '',
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: SubmitVendorApplicationInput) {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            toast.error('Your session has expired. Please sign in again.');
            router.replace('/login?redirect=/vendor/apply');
            return;
        }

        const result = await submitVendorApplicationApi(values, accessToken);

        if (!result.success) {
            if (result.errors) {
                Object.entries(result.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof SubmitVendorApplicationInput, {
                        message: Array.isArray(messages) ? messages[0] : messages,
                    });
                });
                return;
            }

            toast.error(result.error ?? 'Failed to submit application. Please try again.');
            return;
        }

        setSubmitted(true);
        toast.success('Vendor application submitted successfully!');
    }

    if (isLoading || !isAuthenticated || user?.role !== 'customer') {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center text-center gap-4 pt-6">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                        <div>
                            <h2 className="text-lg font-semibold">
                                Application submitted
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                We&apos;ll review your application and notify you by
                                email once a decision has been made.
                            </p>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => router.push('/dashboard')}
                        >
                            Go to dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Apply to become a vendor</CardTitle>
                    <CardDescription>
                        Tell us about your catering business. An admin will review
                        your application.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        noValidate
                    >
                        <Field>
                            <FieldGroup>
                                <Controller
                                    control={form.control}
                                    name="businessName"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Business name
                                            </FieldLabel>

                                            <Input
                                                {...field}
                                                id={field.name}
                                                placeholder="Spice Route Catering"
                                                disabled={isSubmitting}
                                                aria-invalid={fieldState.invalid}
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                                
                                <Controller
                                    control={form.control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Business description
                                            </FieldLabel>

                                            <Textarea
                                                {...field}
                                                id={field.name}
                                                rows={4}
                                                placeholder="Tell us about your catering business..."
                                                disabled={isSubmitting}
                                                aria-invalid={fieldState.invalid}
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="phone"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Phone number
                                            </FieldLabel>

                                            <Input
                                                {...field}
                                                id={field.name}
                                                type='tel'
                                                placeholder="+91 98765 43210"
                                                disabled={isSubmitting}
                                                autoComplete='tel'
                                                aria-invalid={fieldState.invalid}
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="address"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Business address
                                            </FieldLabel>

                                            <Textarea
                                                {...field}
                                                id={field.name}
                                                rows={3}
                                                placeholder="Full business address"
                                                disabled={isSubmitting}
                                                aria-invalid={fieldState.invalid}
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting…
                                    </>
                                ) : (
                                    'Submit application'
                                )}
                            </Button>

                        </Field>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
