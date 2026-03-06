import mongoose, { Schema, Model } from 'mongoose';
import { OTP, OTPType } from '@/types/auth';

// One-Time Password for email verification, password reset, and MFA
const OTPSchema = new Schema<OTP>({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        index: true,
    },
    code: {
        type: String,
        required: [true, 'OTP code is required'],
        match: [/^\d{6}$/, 'OTP must be 6 digits'],
    },
    type: {
        type: String,
        enum: {
            values: ['email_verification', 'password_reset', 'mfa_login'] as OTPType[],
            message: '{VALUE} is not a valid OTP type',
        },
        required: [true, 'OTP type is required'],
        index: true
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiry date is required'],
        index: true
    },
    verified: {
        type: Boolean,
        default: false,
        index: true
    },
    attempts: {
        type: Number,
        default: 0,
        min: [0, 'Attempts cannot be negative'],
        max: [10, 'Maximum attempts exceeded'],
    }
},
    {
        timestamps: true,
        collection: 'otps',
    }
);

// Indexes for query optimization
OTPSchema.index({ userId: 1, type: 1, verified: 1 });      // Index for finding active tokens
OTPSchema.index({ userId: 1, type: 1, expiresAt: -1 });    // Index for finding active tokens

// TTL index - automatically delete OTPs after expiry 
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });   // 1 hour

// Static methods for OTP management
OTPSchema.statics = {
    // Find latest unverified, non-expired OTP for user
    async findActiveOTP(userId: string, type: OTPType) {
        return this.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            type,
            verified: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });     // Get most recent
    },

    // Verify OTP code - Returns the OTP if valid, null otherwise
    async verifyCode(userId: string, type: OTPType, code: string) {
        const otp = await this.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            type,
            code,
            verified: false,
            expiresAt: { $gt: new Date() },
        });

        if (!otp) {
            return null;
        }

        otp.verified = true;
        await otp.save();

        return otp;
    },

    // Increment attempt counter
    async incrementAttempts(otpId: string) {
        return this.findByIdAndUpdate(
            otpId,
            { $inc: { attempts: 1 } },
            { new: true }
        );
    },

    // Invalidate all previous OTPs for user and type - Called before creating new OTP
    async invalidatePreviousOTPs(userId: string, type: OTPType) {
        return this.updateMany(
            {
                userId: new mongoose.Types.ObjectId(userId),
                type,
                verified: false,
            },
            { verified: true } // Mark as verified to prevent reuse
        );
    },

    // Check if max attempts reached
    async hasExceededAttempts(otpId: string, maxAttempts: number = 5) {
        const otp = await this.findById(otpId);
        return otp ? otp.attempts >= maxAttempts : false;
    },

    // Clean up expired OTPs manually (if TTL index not working)
    async cleanupExpiredOTPs() {
        return this.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    },
};

// Prevent model recompilation in Next.js development
export const OTPModel: Model<OTP> =
    mongoose.models.OTP || mongoose.model<OTP>('OTP', OTPSchema);