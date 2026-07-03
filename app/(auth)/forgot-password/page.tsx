'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
    forgotPasswordSchema,
    type ForgotPasswordInput,
} from '@/lib/validation/schemas/auth.schema';
import { forgotPasswordApi } from '@/lib/api/auth-api';
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

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

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

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: ''
        }
    });

    const isSubmitting = form.formState.isSubmitting

    async function onSubmit(values: ForgotPasswordInput) {
        if (resendCooldown > 0) return;
        const result = await forgotPasswordApi(values);

        if (!result.success) {
            if (result.errors) {
                Object.entries(result.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof ForgotPasswordInput, {
                        message: Array.isArray(messages) ? messages[0] : messages,
                    });
                });
                return;
            }

            // 429 — rate limited
            if ('waitSeconds' in result && typeof result.waitSeconds === 'number') {
                setResendCooldown(result.waitSeconds);
                toast.error(
                    `Please wait ${result.waitSeconds} seconds before requesting another code.`
                );
                return;
            }

            toast.error(result.error ?? 'Something went wrong. Please try again.');
            return;
        }

        // This is intentional — prevents account enumeration
        toast.success('If an account exists, a reset code has been sent.');

        router.push(
            `/reset-password?email=${encodeURIComponent(values.email)}`
        );
    }
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-400px">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Forgot password</CardTitle>
                <CardDescription>
                    Enter your email and we&apos;ll send you a code to reset your
                    password
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
                                name="email"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Email
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            type="email"
                                            id={field.name}
                                            placeholder="jane@doe.com"
                                            autoComplete="email"
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
                            disabled={isSubmitting || resendCooldown > 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending code…
                                </>
                            ) : resendCooldown > 0 ? (
                                `Try again in ${resendCooldown}s`
                            ) : (
                                'Send reset code'
                            )}
                        </Button>
                    </Field>
                </form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
