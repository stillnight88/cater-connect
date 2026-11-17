import { Types } from 'mongoose';

// Audit event types, Tracks all security-critical actions
export type AuditAction =
    // Auth events
    | 'user.signup'
    | 'user.email_verified'
    | 'user.login'
    | 'user.login_failed'
    | 'user.logout'
    | 'user.mfa_requested'
    | 'user.mfa_verified'
    | 'user.mfa_failed'
    | 'user.password_reset_requested'
    | 'user.password_reset_completed'

    // Role & permission events
    | 'user.role_changed'

    // Vendor application events
    | 'vendor_application.submitted'
    | 'vendor_application.approved'
    | 'vendor_application.rejected'

    | 'menu_item.created'
    | 'menu_item.published'
    | 'menu_item.unpublished'
    | 'menu_item.deleted'
    | 'booking.requested'
    | 'booking.accepted'
    | 'booking.rejected'
    | 'booking.completed'
    | 'booking.cancelled'
    | 'review.created';

// Audit log entry, Immutable record of system actions
export interface AuditLog {
    _id: Types.ObjectId;
    actorId: Types.ObjectId | null;    // Who performed the action, null for system-initiated events (e.g., auto-expiry)
    action: AuditAction;       // What action was performed
    targetId?: Types.ObjectId;   // Who/what was affected by the action, Can be userId, applicationId, etc.
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;   // When the action occurred
    createdAt: Date;
}

// Input for creating audit log entries
export interface CreateAuditLogInput {
    actorId: string | null;
    action: AuditAction;
    targetId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

// Public audit log format (for admin viewing)
export interface AuditLogPublic {
    id: string;
    actorId: string | null;
    action: AuditAction;
    targetId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    timestamp: Date;
}

// Convert Mongoose AuditLog to public format
export function toAuditLogPublic(log: AuditLog): AuditLogPublic {
    return {
        id: log._id.toString(),
        actorId: log.actorId?.toString() || null,
        action: log.action,
        targetId: log.targetId?.toString(),
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        timestamp: log.timestamp,
    };
}