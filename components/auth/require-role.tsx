'use client';

import { Loader2 } from 'lucide-react';
import { useRequireRoleGuard } from '@/lib/auth/require-role';
import type { UserRole } from '@/types/user';

interface RequireRoleProps {
    role: UserRole | UserRole[];
    redirectTo?: string;
    children: React.ReactNode;
}

export function RequireRole({ role, redirectTo, children }: RequireRoleProps) {
    const { isChecking, isAuthorized } = useRequireRoleGuard(role, { redirectTo });
    if (isChecking || !isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    return <>{children}</>;
}