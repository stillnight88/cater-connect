import { z } from 'zod';

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email cannot exceed 255 characters')
    .pipe(z.email({ message: 'Invalid email address' }));

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters');
// .regex(/[A-Z]/,'Password must contain at least one uppercase letter')
// .regex(/[a-z]/,'Password must contain at least one lowercase letter')
// .regex(/[0-9]/,'Password must contain at least one number')
// .regex(/[^A-Za-z0-9]/,'Password must contain at least one special character');

const otpCodeSchema = z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits');

const nameSchema = z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'_-]+$/, 'Name can only contain letters, spaces, hyphens, underscore and apostrophes');

export const signupSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema
});
export type SignupInput = z.infer<typeof signupSchema>;

export const verifyEmailSchema = z.object({
    email: emailSchema,
    code: otpCodeSchema
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
});
export type LoginInput = z.infer<typeof loginSchema>;

export const mfaRequestSchema = z.object({
    email: emailSchema
});
export type MFARequestInput = z.infer<typeof mfaRequestSchema>;

export const mfaVerifySchema = z.object({
    email: emailSchema,
    code: otpCodeSchema
});
export type MFAVerifyInput = z.infer<typeof mfaVerifySchema>;

export const forgotPasswordSchema = z.object({
    email: emailSchema
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
    email: emailSchema,
    code: otpCodeSchema,
    newPassword: passwordSchema
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const logoutSchema = z.object({
    refreshToken: z.string().optional(),
});
export type LogoutInput = z.infer<typeof logoutSchema>;

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const resendVerificationSchema = z.object({
    email: emailSchema,
});
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;