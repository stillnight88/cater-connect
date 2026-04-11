import { AuditLogModel } from '@/lib/db/models';
import { CreateAuditLogInput } from '@/types/audit';
import { connectDB } from '@/lib/db/client';

export async function logAuditEvent(input: CreateAuditLogInput): Promise<void> {
    try {
        await connectDB();

        await AuditLogModel.logEvent({
            actorId: input.actorId,
            action: input.action,
            targetId: input.targetId,
            metadata: input.metadata,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent
        });
    } catch (error) {
        console.error('Audit logging failed:', error);
        console.error('Audit event data:', input);
    }
};

export function getIpAddress(request: Request): string | undefined {
    const forwardedFor = request.headers.get('x-forwarded-for');   // Check X-Forwarded-For header (proxies/load balancers)
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();    // Take first IP if multiple (client IP)
    }

    const realIp = request.headers.get('x-real-ip');   // Check X-Real-IP header (Nginx)
    if (realIp) {
        return realIp.trim();
    }

    const cfIp = request.headers.get('cf-connecting-ip');  // Fallback to CF-Connecting-IP (Cloudflare)
    if (cfIp) {
        return cfIp.trim();
    }

    return undefined;
};

export function getUserAgent(request: Request): string | undefined {
    return request.headers.get('user-agent') || undefined;
};

export function getAuditContext(request: Request): {
    ipAddress?: string;
    userAgent?: string;
} {
    return {
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
    };
};

// Logging functions for common events for type-safe, standardized logging
export async function logSignup(
    userId: string,
    email: string,
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: null,  // No actor yet (user just created)
        action: 'user.signup',
        targetId: userId,
        metadata: { email },
        ...(request ? getAuditContext(request) : {})
    });
};

export async function logEmailVerified(
    userId: string,
    email: string
): Promise<void> {
    await logAuditEvent({
        actorId: userId,
        action: 'user.email_verified',
        targetId: userId,
        metadata: { email },
    });
};

export async function logLogin(
    userId: string,
    email: string,
    method: 'password' | 'mfa' = 'password',
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: userId,
        action: 'user.login',
        targetId: userId,
        metadata: { email, method },
        ...(request ? getAuditContext(request) : {}),
    });
};

export async function logLoginFailed(
    email: string,
    reason: string,
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: null,
        action: 'user.login_failed',
        metadata: { email, reason },
        ...(request ? getAuditContext(request) : {}),
    });
};

export async function logLogout(
    userId: string,
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: userId,
        action: 'user.logout',
        targetId: userId,
        ...(request ? getAuditContext(request) : {}),
    });
};

export async function logMFARequested(
    userId: string,
    email: string,
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: userId,
        action: 'user.mfa_requested',
        targetId: userId,
        metadata: { email },
        ...(request ? getAuditContext(request) : {}),
    });
};

export async function logMFAVerified(
    userId: string,
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: userId,
        action: 'user.mfa_verified',
        targetId: userId,
        ...(request ? getAuditContext(request) : {}),
    });
};

export async function logMFAFailed(
    userId: string,
    reason: string,
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: userId,
        action: 'user.mfa_failed',
        targetId: userId,
        metadata: { reason },
        ...(request ? getAuditContext(request) : {}),
    });
};

export async function logPasswordResetRequested(
    email: string,
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: null,
        action: 'user.password_reset_requested',
        metadata: { email },
        ...(request ? getAuditContext(request) : {}),
    });
};

export async function logPasswordResetCompleted(
    userId: string,
    email: string,
    request?: Request
): Promise<void> {
    await logAuditEvent({
        actorId: userId,
        action: 'user.password_reset_completed',
        targetId: userId,
        metadata: { email },
        ...(request ? getAuditContext(request) : {}),
    });
};

export async function logRoleChanged(
    adminId: string,
    targetUserId: string,
    previousRole: string,
    newRole: string,
    reason?: string
): Promise<void> {
    await logAuditEvent({
        actorId: adminId,
        action: 'user.role_changed',
        targetId: targetUserId,
        metadata: {
            previousRole,
            newRole,
            reason,
        },
    });
};

export async function logVendorApplicationSubmitted(
    userId: string,
    applicationId: string,
    businessName: string
): Promise<void> {
    await logAuditEvent({
        actorId: userId,
        action: 'vendor_application.submitted',
        targetId: applicationId,
        metadata: { businessName },
    });
};

export async function logVendorApplicationApproved(
    adminId: string,
    applicationId: string,
    applicantUserId: string,
    businessName: string
): Promise<void> {
    await logAuditEvent({
        actorId: adminId,
        action: 'vendor_application.approved',
        targetId: applicationId,
        metadata: {
            applicantUserId,
            businessName,
        },
    });
};

export async function logVendorApplicationRejected(
    adminId: string,
    applicationId: string,
    applicantUserId: string,
    businessName: string,
    rejectionReason: string
): Promise<void> {
    await logAuditEvent({
        actorId: adminId,
        action: 'vendor_application.rejected',
        targetId: applicationId,
        metadata: {
            applicantUserId,
            businessName,
            rejectionReason,
        },
    });
};