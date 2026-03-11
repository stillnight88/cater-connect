import mongoose, { Schema, Model } from 'mongoose';
import { AuditLog, AuditAction } from '@/types/audit';

// Audit Log Schema - Immutable record of security-critical and business-critical actions, 
const AuditLogSchema = new Schema<AuditLog>({
    actorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        default: null, // null for system-initiated events
    },
    action: {
        type: String,
        required: [true, 'Action is required'],
        enum: {
            values: [
                // Auth events
                'user.signup',
                'user.email_verified',
                'user.login',
                'user.login_failed',
                'user.logout',
                'user.mfa_requested',
                'user.mfa_verified',
                'user.mfa_failed',
                'user.password_reset_requested',
                'user.password_reset_completed',
                // Role & permission events
                'user.role_changed',
                // Vendor application events
                'vendor_application.submitted',
                'vendor_application.approved',
                'vendor_application.rejected',
            ] as AuditAction[],
            message: '{VALUE} is not a valid audit action',
        },
        index: true,
    },
    targetId: {
        type: Schema.Types.ObjectId,
        index: true
    },
    metadata: {
        type: Schema.Types.Mixed,
        index: true
    },
    ipAddress: {
        type: String,
        trim: true,
        index: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
        index: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },      // Only createdAt (immutable)
    collection: 'audit_logs',
});

// Indexes for query optimization
AuditLogSchema.index({ actorId: 1, timestamp: -1 });   // Index for actor-based queries
AuditLogSchema.index({ action: 1, timestamp: -1 });    // Index for action-based queries
AuditLogSchema.index({ targetId: 1, timestamp: -1 });  // Index for target-based queries
AuditLogSchema.index({ action: 1, ipAddress: 1, timestamp: -1 });   // Index for security analysis
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });   // 2 years

// Prevent updates to audit logs (immutable)
AuditLogSchema.pre('save', function () {
    if (!this.isNew) {
        throw new Error('Audit logs are immutable and cannot be updated');
    }
});

// Static methods 
AuditLogSchema.statics = {
    // Log an audit event - Primary method for creating audit entries
    async logEvent(data: {
        actorId: string | null;
        action: AuditAction;
        targetId?: string;
        metadata?: Record<string, unknown>;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return this.create({
            actorId: data.actorId ? new mongoose.Types.ObjectId(data.actorId) : null,
            action: data.action,
            targetId: data.targetId ? new mongoose.Types.ObjectId(data.targetId) : undefined,
            metadata: data.metadata || {},
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            timestamp: new Date(),
        });
    },

    // Get activity timeline for a user - Shows all actions performed by the user
    async getUserActivity(
        userId: string,
        limit: number = 50,
        skip: number = 0
    ) {
        return this.find({
            actorId: new mongoose.Types.ObjectId(userId),
        })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);
    },

    // Get history for a specific entity - Shows all actions performed on a target 
    async getEntityHistory(
        targetId: string,
        limit: number = 50,
        skip: number = 0
    ) {
        return this.find({
            targetId: new mongoose.Types.ObjectId(targetId),
        })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate('actorId', 'name email role');
    },

    // Returns logs in a format suitable for export
    async exportLogs(startDate: Date, endDate: Date) {
        return this.find({
            timestamp: { $gte: startDate, $lte: endDate },
        })
            .sort({ timestamp: 1 })
            .populate('actorId', 'name email role')
            .lean();
    },
};

export const AuditLogModel: Model<AuditLog> =
    mongoose.models.AuditLog ||
    mongoose.model<AuditLog>('AuditLog', AuditLogSchema);

