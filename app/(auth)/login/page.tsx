'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
    loginSchema,
    type LoginInput,
    mfaVerifySchema,
    type MFAVerifyInput,
} from '@/lib/validation/schemas/auth.schema';
import {
    loginApi,
    mfaVerifyApi,
    mfaRequestApi,
} from '@/lib/api/auth-api';
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

type LoginStage = 'credentials' | 'mfa';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading, login } = useAuth();

    const redirectTo = searchParams.get('redirect') ?? '/dashboard';

    const [stage, setStage] = useState<LoginStage>('credentials');
    const [pendingEmail, setPendingEmail] = useState('');
    const [mfaResendCooldown, setMfaResendCooldown] = useState(0);
    const [isMfaResending, setIsMfaResending] = useState(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace(redirectTo);
        }
    }, [isLoading, isAuthenticated, router, redirectTo]);

    useEffect(() => {
        if (mfaResendCooldown <= 0) return;

        const interval = setInterval(() => {
            setMfaResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [mfaResendCooldown]);

    const credentialsForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onCredentialsSubmit(values: LoginInput) {
        const result = await loginApi(values);
        if (!result.success) {
            if (result.errors) {
                Object.entries(result.errors).forEach(([field, messages]) => {
                    credentialsForm.setError(field as keyof LoginInput, {
                        message: Array.isArray(messages) ? messages[0] : messages,
                    });
                });
                return;
            }

            toast.error(result.error ?? 'Login failed. Please try again.');
            return;
        }

        if (result.mfaRequired) {
            setPendingEmail(result.email);
            setMfaResendCooldown(60);
            setStage('mfa');
            return;
        }

        await login(result.accessToken);
        toast.success(`Welcome back, ${result.user.name}!`);
        router.replace(redirectTo);
    };

    const mfaForm = useForm<MFAVerifyInput>({
        resolver: zodResolver(mfaVerifySchema),
        defaultValues: {
            email: pendingEmail,
            code: '',
        },
    });

    useEffect(() => {
        if (pendingEmail) {
            mfaForm.setValue('email', pendingEmail);
        }
    }, [pendingEmail, mfaForm]);

    async function onMfaSubmit(values: MFAVerifyInput) {
        const result = await mfaVerifyApi(values);

        if (!result.success) {
            const errorMsg =
                'remainingAttempts' in result &&
                    typeof result.remainingAttempts === 'number'
                    ? `${result.error}. ${result.remainingAttempts} attempt${result.remainingAttempts === 1 ? '' : 's'} remaining.`
                    : result.error ?? 'Invalid code. Please try again.';

            mfaForm.setError('code', { message: errorMsg });
            return;
        }

        await login(result.accessToken);
        toast.success(`Welcome back, ${result.user.name}!`);
        router.replace(redirectTo);
    }

    async function handleMfaResend() {
        if (isMfaResending || mfaResendCooldown > 0 || !pendingEmail) return;
        setIsMfaResending(true);
        const result = await mfaRequestApi({ email: pendingEmail });
        setIsMfaResending(false);
        if (!result.success) {
            if ('waitSeconds' in result && typeof result.waitSeconds === 'number') {
                setMfaResendCooldown(result.waitSeconds);
                toast.error(
                    `Please wait ${result.waitSeconds} seconds before requesting a new code.`
                );
                return;
            }

            toast.error(result.error ?? 'Failed to resend code. Please try again.');
            return;
        }
        setMfaResendCooldown(60);
        toast.success('A new MFA code has been sent to your email.');
        mfaForm.resetField('code');
    }

    function handleBackToLogin() {
        setStage('credentials');
        setPendingEmail('');
        setMfaResendCooldown(0);
        mfaForm.reset();
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (stage === 'credentials') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>
                        Enter your email and password to continue
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
                        className="space-y-4"
                        noValidate
                    ><FieldGroup>
                            <Controller
                                control={credentialsForm.control}
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
                                            disabled={credentialsForm.formState.isSubmitting}
                                            aria-invalid={fieldState.invalid}
                                        />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={credentialsForm.control}
                                name="password"
                                render={({ field, fieldState }) => (

                                    <Field data-invalid={fieldState.invalid}>
                                        <div className="flex items-center justify-between">
                                            <FieldLabel htmlFor={field.name}>
                                                Password
                                            </FieldLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Min. 8 characters"
                                            type="password"
                                            autoComplete="new-password"
                                            disabled={credentialsForm.formState.isSubmitting}
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
                            disabled={credentialsForm.formState.isSubmitting}
                        >
                            {credentialsForm.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/signup"
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Two-factor verification</CardTitle>
                <CardDescription>
                    Enter the 6-digit code sent to{' '}
                    <span className="font-medium text-foreground">
                        {pendingEmail}
                    </span>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={mfaForm.handleSubmit(onMfaSubmit)}
                    className="space-y-6"
                    noValidate
                >
                    <input type='hidden' {...mfaForm.register('email')} />
                    <FieldGroup>
                        <Controller
                            control={mfaForm.control}
                            name="code"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Authentication code
                                    </FieldLabel>

                                    <InputOTP
                                        maxLength={6}
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={mfaForm.formState.isSubmitting}
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
                        disabled={mfaForm.formState.isSubmitting}
                    >
                        {mfaForm.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying…
                            </>
                        ) : (
                            'Verify code'
                        )}
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
                        onClick={handleMfaResend}
                        disabled={isMfaResending || mfaResendCooldown > 0}
                    >
                        {isMfaResending ? (
                            <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Sending…
                            </>
                        ) : mfaResendCooldown > 0 ? (
                            `Resend in ${mfaResendCooldown}s`
                        ) : (
                            'Resend code'
                        )}  </Button>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={handleBackToLogin}
                >
                    Back to sign in
                </Button>
            </CardFooter>
        </Card>
    )
}
