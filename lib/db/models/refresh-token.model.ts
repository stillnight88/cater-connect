import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import { UpdateResult, DeleteResult } from "mongodb";
import { RefreshToken } from '@/types/auth';

type RefreshTokenDocument = HydratedDocument<RefreshToken>;
export interface RefreshTokenModelType extends Model<RefreshToken> {
    findActiveToken(tokenId: string): Promise<RefreshTokenDocument | null>;
    revokeAllUserTokens(userId: string): Promise<UpdateResult>;
    revokeToken(tokenId: string): Promise<UpdateResult>;
    cleanupExpiredTokens(): Promise<DeleteResult>;
    countActiveTokens(userId: string): Promise<number>;
}

// Stores refresh tokens for session management and revocation 
const RefreshTokenSchema = new Schema<RefreshToken, RefreshTokenModelType>({
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

// Find active (non-revoked, non-expired) token by tokenId
RefreshTokenSchema.static(
    "findActiveToken",
    async function (tokenId: string) {
        return this.findOne({
            tokenId,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });
    }
);

// Revoke all tokens for a user - Used during password reset or security breach
RefreshTokenSchema.static(
    "revokeAllUserTokens",
    async function (userId: string) {
        return this.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), isRevoked: false },
            { isRevoked: true }
        );
    }
);

// Revoke specific token - Used during logout
RefreshTokenSchema.static(
    "revokeToken",
    async function (tokenId: string) {
        return this.updateOne({ tokenId }, { isRevoked: true });
    }
);

// Clean up expired tokens manually (if TTL index not working)
RefreshTokenSchema.static(
    "cleanupExpiredTokens",
    async function () {
        return this.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    }
);

// Count active tokens for a user
RefreshTokenSchema.static(
    "countActiveTokens",
    async function (userId: string) {
        return this.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });
    }
);

//  Prevent model recompilation in Next.js development
const existingModel = mongoose.models.RefreshToken as RefreshTokenModelType
export const RefreshTokenModel =
    existingModel ||
    mongoose.model<RefreshToken, RefreshTokenModelType>('RefreshToken', RefreshTokenSchema);