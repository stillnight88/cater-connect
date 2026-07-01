'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
    verifyEmailSchema,
    type VerifyEmailInput,
} from '@/lib/validation/schemas';
import { verifyEmailApi, resendVerificationApi } from '@/lib/api/auth-api';
import { useAuth } from '@/components/providers/auth-provider';

import { Button } from '@/components/ui/button';
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

export function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading } = useAuth();

    const email = searchParams.get('email') ?? '';

    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (!isLoading && !email) {
            router.replace('/signup');
        }
    }, [email, isLoading, router]);

    useEffect(() => {
        if (resendCooldown <= 0) return;

        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [resendCooldown]);

    const form = useForm<VerifyEmailInput>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            email,
            code: '',
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: VerifyEmailInput) {
        const result = await verifyEmailApi(values);
        if (!result.success) {
            if (result.errors) {
                Object.entries(result.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof VerifyEmailInput, {
                        message: Array.isArray(messages) ? messages[0] : messages,
                    });
                });
                return;
            }
            const errorMsg =
                'remainingAttempts' in result && typeof result.remainingAttempts === 'number'
                    ? `${result.error}. ${result.remainingAttempts} attempt${result.remainingAttempts === 1 ? '' : 's'} remaining.`
                    : result.error ?? 'Verification failed. Please try again.';

            form.setError('code', { message: errorMsg });
            return;
        }

        toast.success('Email verified! You can now sign in.');
        router.push('/login');
    }

    async function handleResend() {
        if (isResending || resendCooldown > 0 || !email) return;

        setIsResending(true);
        const result = await resendVerificationApi({ email });
        if (!result.success) {
            // waitSeconds is returned on 429
            if ('waitSeconds' in result && typeof result.waitSeconds === 'number') {
                setResendCooldown(result.waitSeconds);
                toast.error(`Please wait ${result.waitSeconds} seconds before requesting a new code.`);
                return;
            }

            toast.error(result.error ?? 'Failed to resend code. Please try again.');
            return;
        }
        setResendCooldown(60);
        toast.success('A new verification code has been sent to your email.');
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
                <CardTitle>Verify your email</CardTitle>
                <CardDescription>
                    Enter the 6-digit code sent to{' '}
                    <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                >
                    {/* Hidden email field — included in form values for API submission */}
                    <input type='hidden' {...form.register('email')} />
                    <FieldGroup>
                        <Controller
                            control={form.control}
                            name="code"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Verification code
                                    </FieldLabel>

                                    <InputOTP
                                        maxLength={6}
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isSubmitting}
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
                    </FieldGroup>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {
                            isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying…
                                </>
                            ) : (
                                'Verify email'
                            )
                        }
                    </Button>
                </form>

            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Didn&apos;t receive a code?</span>
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-sm font-medium"
                        onClick={handleResend}
                        disabled={isResending || resendCooldown > 0}
                    > {isResending ? (
                        <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Sending…
                        </>
                    ) : resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                    ) : (
                        'Resend code'
                    )}
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Wrong email?{' '}
                    <Link
                        href="/signup"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Go back to signup
                    </Link>
                </p>
            </CardFooter>
        </Card >
    );
};