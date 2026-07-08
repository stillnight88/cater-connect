import type { AuditLogPublic, AuditAction } from '@/types/audit';
import { apiGet, ApiError } from './client';

interface ListAuditLogResponse {
    entries: AuditLogPublic[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export async function listAuditLogApi(
    page: number,
    limit: number,
    action: AuditAction | undefined,
    accessToken: string,
): Promise<ListAuditLogResponse | ApiError> {
    return apiGet<ListAuditLogResponse>('/audit-log', { accessToken, params: { page, limit, action } });
};
