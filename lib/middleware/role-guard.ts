import { NextRequest, NextResponse } from 'next/server';
import { Session } from '@/types/auth';
import { UserRole } from '@/types/user';
import { requireAuth } from './auth-middleware';

export const PERMISSIONS = {
    // Vendor permissions
    'vendor:manage_profile': ['vendor', 'admin'],
    'vendor:manage_menu': ['vendor', 'admin'],
    'vendor:view_bookings': ['vendor', 'admin'],
    'vendor:accept_booking': ['vendor', 'admin'],

    // Customer permissions
    'customer:create_booking': ['customer', 'vendor', 'admin'],
    'customer:view_own_bookings': ['customer', 'vendor', 'admin'],
    'customer:cancel_booking': ['customer', 'vendor', 'admin'],

    // Admin permissions
    'admin:manage_users': ['admin'],
    'admin:approve_vendors': ['admin'],
    'admin:view_all_bookings': ['admin'],
    'admin:view_analytics': ['admin'],
    'admin:manage_system': ['admin'],
    'admin:view_audit_logs': ['admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasRole(session: Session, role: UserRole): boolean {
    return session.role === role;
};

export function hasAnyRole(session: Session, roles: UserRole[]): boolean {
    return roles.includes(session.role);
};

export function hasPermission(session: Session, permission: Permission): boolean {
    const allowedRoles = PERMISSIONS[permission];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allowedRoles.includes(session.role as any);
};

export function hasAllPermissions(session: Session, permissions: Permission[]) {
    return permissions.every((permission) => hasPermission(session, permission));
};

export function hasAnyPermissions(session: Session, permissions: Permission[]) {
    return permissions.some((permission) => hasPermission(session, permission));
};

export async function requireRole(
    request: NextRequest,
    requiredRole: UserRole
): Promise<Session | NextResponse> {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
        return authResult;  // 401 Unauthorized
    }

    const session = authResult;

    if (!hasRole(session, requiredRole)) {
        return NextResponse.json(
            {
                success: false,
                error: 'Forbidden',
                message: `This action requires ${requiredRole} role`,
            },
            { status: 403 }
        );
    }

    return session;
};

export async function requireAnyRole(
    request: NextRequest,
    allowedRoles: UserRole[]
): Promise<Session | NextResponse> {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
        return authResult;  // 401 Unauthorized
    }

    const session = authResult;

    if (!hasAnyRole(session, allowedRoles)) {
        return NextResponse.json(
            {
                success: false,
                error: 'Forbidden',
                message: `This action requires one of: ${allowedRoles.join(', ')}`,
            },
            { status: 403 }
        );
    }

    return session;
};

export async function requirePermission(
    request: NextRequest,
    permission: Permission
): Promise<Session | NextResponse> {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
        return authResult;  // 401 Unauthorized
    }

    const session = authResult;

    if (!hasPermission(session, permission)) {
        return NextResponse.json(
            {
                success: false,
                error: 'Forbidden',
                message: `Missing permission: ${permission}`,
            },
            { status: 403 }
        );
    }

    return session;
};

export async function requireAdmin(request: NextRequest): Promise<Session | NextResponse> {
    return requireRole(request, 'admin');
};