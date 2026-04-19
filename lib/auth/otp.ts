import { OTPModel } from '@/lib/db/models';
import { OTPType } from '@/types/auth';

// OTP Configuration
export const OTP_CONFIG = {
    LENGTH: 6,                      // 6-digit OTP
    EXPIRY_MINUTES: 10,            // OTP expires after 10 minutes
    MAX_ATTEMPTS: 5,              // Maximum verification attempts
    RESEND_COOLDOWN_SECONDS: 60, // Wait 60s before resending
} as const;

// Generate a cryptographically secure numeric OTP - Uses crypto.randomBytes for security (not Math.random)
export function generateOTP(length: number = OTP_CONFIG.LENGTH): string {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += randomValues[i] % 10;
    }

    return otp;
};

export async function createOTP(userId: string, type: OTPType): Promise<{ code: string; expiresAt: Date; otpId: string }> {
    await OTPModel.invalidatePreviousOTPs(userId, type);   // Invalidate all previous OTPs of this type for the user

    const code = generateOTP();   // Generate new OTP code

    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);    // Calculate expiry time

    const otp = await OTPModel.create({
        userId,
        code,
        type,
        expiresAt,
        verified: false,
        attempts: 0
    });

    return {
        code: otp.code,
        expiresAt: otp.expiresAt,
        otpId: otp._id.toString(),
    };
};

// Validates: Code matches, Not expired, Not already verified, Not exceeded max attempts
export async function verifyOTP(
    userId: string,
    type: OTPType,
    code: string
): Promise<
    | { success: true; otpId: string }
    | { success: false; error: string; remainingAttempts?: number }
> {
    const otp = await OTPModel.findActiveOTP(userId, type);   // Find active OTP
    if (!otp) {
        return {
            success: false,
            error: 'No active OTP found. Please request a new one.',
        };
    }

    // Check if already verified
    if (otp.verified) {
        return {
            success: false,
            error: 'This OTP has already been used.',
        };
    }

    // Check if expired
    if (otp.expiresAt < new Date()) {
        return {
            success: false,
            error: 'OTP has expired. Please request a new one.',
        };
    }

    // Check max attempts
    if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        return {
            success: false,
            error: 'Maximum verification attempts exceeded. Please request a new OTP.',
        };
    }

    // Verify code
    if (otp.code !== code) {
        await OTPModel.incrementAttempts(otp._id.toString());
        const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - (otp.attempts + 1);

        return {
            success: false,
            error: 'Invalid OTP code.',
            remainingAttempts: Math.max(remainingAttempts, 0),
        };
    }

    // Mark as verified
    otp.verified = true;
    await otp.save();

    return {
        success: true,
        otpId: otp._id.toString(),
    };
};

// Prevents OTP spam by enforcing cooldown period
export async function canRequestOTP(
    userId: string,
    type: OTPType
): Promise<
    | { allowed: true }
    | { allowed: false; waitSeconds: number; lastRequestedAt: Date }
> {
    const lastOTP = await OTPModel.findOne({ userId, type })
        .sort({ createdAt: -1 })
        .limit(1);

    if (!lastOTP) {
        return { allowed: true };
    }

    const timeSinceLastRequest = Date.now() - lastOTP.createdAt.getTime();
    const cooldownMs = OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000;

    if (timeSinceLastRequest < cooldownMs) {
        const waitSeconds = Math.ceil((cooldownMs - timeSinceLastRequest) / 1000);

        return {
            allowed: false,
            waitSeconds,
            lastRequestedAt: lastOTP.createdAt,
        };
    }

    return { allowed: true };
};

// Format OTP for display (with spacing), @example - formatOTPForDisplay('847293') // "847 293" 
export function formatOTPForDisplay(code: string): string {
    if (code.length === 6) {
        return `${code.slice(0, 3)} ${code.slice(3)}`;
    }
    return code;
};