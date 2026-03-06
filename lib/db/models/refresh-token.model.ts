import mongoose, { Schema, Model } from 'mongoose';
import { RefreshToken } from '@/types/auth';

// Stores refresh tokens for session management and revocation 
const RefreshTokenSchema = new Schema<RefreshToken>({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        index: true
    },
    tokenId: {
        type: String,
        required: [true, 'Token ID is required'],
        unique: true,
        index: true
    },
    token: {
        type: String,
        required: [true, 'Token is required'],
        unique: true
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiry date is required'],
        unique: true
    },
    isRevoked: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
    collection: 'refresh_tokens',
});

// Indexes for query optimization
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });      // Index for finding active tokens
RefreshTokenSchema.index({ tokenId: 1, isRevoked: 1 });    // Index for token validation

// TTL index - automatically delete expired tokens after 30 days
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static methods for token management
RefreshTokenSchema.statics = {
    // Find active (non-revoked, non-expired) token by tokenId
    async findActiveToken(tokenId: string) {
        return this.findOne({
            tokenId,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });
    },

    // Revoke all tokens for a user - Used during password reset or security breach
    async revokeAllUserTokens(userId: string) {
        return this.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), isRevoked: false },
            { isRevoked: true }
        );
    },

    // Revoke specific token - Used during logout
    async revokeToken(tokenId: string) {
        return this.updateOne({ tokenId }, { isRevoked: true });
    },

    // Clean up expired tokens manually (if TTL index not working)
    async cleanupExpiredTokens() {
        return this.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    },

    // Count active tokens for a user
    async countActiveTokens(userId: string) {
        return this.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });
    }
};

//  Prevent model recompilation in Next.js development
export const RefreshTokenModel: Model<RefreshToken> =
    mongoose.models.RefreshToken ||
    mongoose.model<RefreshToken>('RefreshToken', RefreshTokenSchema);