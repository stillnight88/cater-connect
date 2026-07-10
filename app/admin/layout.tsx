'use client';

import { RequireRole } from '@/components/auth/require-role';
import { AdminNav } from '@/components/admin/admin-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequireRole role='admin'>
            <div className="min-h-screen">
                <AdminNav />
                <main className="px-6 py-8">{children}</main>
            </div>
        </RequireRole>
    )
};