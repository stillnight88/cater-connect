import { z } from 'zod';
import type { AuditAction } from '@/types/audit';

const AUDIT_ACTIONS = [
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
    'user.role_changed',
    'vendor_application.submitted',
    'vendor_application.approved',
    'vendor_application.rejected',
    'menu_item.created',
    'menu_item.published',
    'menu_item.unpublished',
    'menu_item.deleted',
    'booking.requested',
    'booking.accepted',
    'booking.rejected',
    'booking.completed',
    'booking.cancelled',
    'review.created',
] as const satisfies readonly AuditAction[];

export const auditLogQuerySchema = z.object({
    page: z.coerce.number().int('page must be an integer').min(1, 'page must be at least 1').default(1),
    limit: z.coerce.number().int('limit must be an integer').min(1, 'limit must be at least 1').max(20, 'limit cannot exceed 20').default(20),
    action: z.enum(AUDIT_ACTIONS).optional(),
});

export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;