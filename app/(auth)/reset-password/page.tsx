'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
    resetPasswordSchema,
    type ResetPasswordInput,
} from '@/lib/validation/schemas/auth.schema';
import { resetPasswordApi } from '@/lib/api/auth-api';
import { useAuth } from '@/components/providers/auth-provider';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';


export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading } = useAuth();

    const email = searchParams.get('email') ?? '';

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard')
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isLoading && !email) {
            router.replace('/forgot-password');
        }
    }, [email, isLoading, router]);

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email,
            code: '',
            newPassword: '',
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: ResetPasswordInput) {
        const result = await resetPasswordApi(values);
        if (!result.success) {
            if (result.errors) {
                Object.entries(result.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof ResetPasswordInput, {
                        message: Array.isArray(messages) ? messages[0] : messages,
                    });
                });
                return;
            }

            const errorMsg =
                'remainingAttempts' in result &&
                    typeof result.remainingAttempts === 'number'
                    ? `${result.error}. ${result.remainingAttempts} attempt${result.remainingAttempts === 1 ? '' : 's'} remaining.`
                    : result.error ?? 'Reset failed. Please try again.';

            form.setError('code', { message: errorMsg });
            return;
        }
        // Server revokes all existing sessions on password reset
        toast.success('Password reset successfully. Please sign in.');
        router.push('/login');
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reset password</CardTitle>
                <CardDescription>
                    Enter the code sent to{' '}
                    <span className="font-medium text-foreground">{email}</span>{' '}
                    and choose a new password
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                >
                    <input type="hidden" {...form.register('email')} />
                    <Field>
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="code"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Reset code
                                        </FieldLabel>

                                        <InputOTP
                                            maxLength={6}
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={form.formState.isSubmitting}
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="newPassword"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            New password
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Min. 8 characters"
                                            type="password"
                                            autoComplete="new-password"
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
                                    Resetting password…
                                </>
                            ) : (
                                'Reset password'
                            )}
                        </Button>
                    </Field>
                </form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    Didn&apos;t get a code?{' '}
                    <Link
                        href="/forgot-password"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Request a new one
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
