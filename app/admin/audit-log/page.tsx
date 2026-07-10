'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

import { AuditLogTable } from '@/components/admin/audit-log-table';
import { listAuditLogApi } from '@/lib/api/audit-api';
import { useAuth } from '@/components/providers/auth-provider';
import type { AuditAction } from '@/types/audit';

const ACTION_FILTER_OPTIONS: AuditAction[] = [
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
];

const PAGE_SIZE = 20;

export default function AuditLogPage() {
    const { getAccessToken, isAuthenticated } = useAuth();
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState<AuditAction | undefined>(undefined);

    const { data, isLoading } = useQuery({
        queryKey: ['audit-log', page, PAGE_SIZE, actionFilter],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return listAuditLogApi(page, PAGE_SIZE, actionFilter, token);
        },
        enabled: isAuthenticated,
        placeholderData: keepPreviousData,
    });

    const entries = data?.success ? data.entries : [];
    const totalPages = data?.success ? data.pagination.totalPages : 1;

    const handleFilterChange = (value: string) => {
        setActionFilter(value === 'all' ? undefined : (value as AuditAction));
        setPage(1);
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
                    <p className="text-sm text-muted-foreground">
                        System events, most recent first.
                    </p>
                </div>

                <Select value={actionFilter ?? "all"} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-65">
                        <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All actions</SelectItem>
                        {ACTION_FILTER_OPTIONS.map((action) => (
                            <SelectItem key={action} value={action}>
                                {action}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <AuditLogTable entries={entries} isLoading={isLoading} />

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink isActive>{page}</PaginationLink>
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className={
                                    page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    )
}

