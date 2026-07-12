'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import type { UserRole } from '@/types/user';

export function useRequireRoleGuard(role: UserRole | UserRole[], options: { redirectTo?: string } = {}) {
    const { redirectTo = '/dashboard' } = options;
    const { isLoading, isAuthenticated, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const allowedRoles = Array.isArray(role) ? role : [role];
    const hasRequiredRole = !!user && allowedRoles.includes(user.role);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        if (!hasRequiredRole) router.replace(redirectTo);
    }, [isLoading, isAuthenticated, hasRequiredRole, router, pathname, redirectTo]);

    return { isChecking: isLoading, isAuthorized: !isLoading && isAuthenticated && hasRequiredRole };
};