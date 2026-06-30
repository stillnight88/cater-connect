'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { signupSchema, type SignupInput } from '@/lib/validation/schemas/auth.schema';
import { signupApi } from '@/lib/api/auth-api';
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

export default function SignupPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard')
        }
    }, [isAuthenticated, isLoading, router]);

    const form = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: SignupInput) {
        const result = await signupApi(values);
        if (!result.success) {
            if (result.errors) {
                Object.entries(result.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof SignupInput, {
                        message: Array.isArray(messages) ? messages[0] : messages,
                    });
                });
                return;
            }

            toast.error(result.error ?? 'Signup failed. Please try again.');
            return;
        }

        toast.success('Account created! Check your email for the verification code.');
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
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
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your details to get started with CaterConnect</CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                > <FieldGroup>
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Full name
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Jane Doe"
                                        autoComplete="name"
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

                        <Controller
                            control={form.control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Password
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
                        {
                            isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account…
                                </>
                            ) : (
                                "Create account"
                            )
                        }
                    </Button>
                </form>

            </CardContent>

            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card >
    );
};
