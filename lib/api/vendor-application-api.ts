import type { VendorApplicationPublic, VendorApplicationStatus } from '@/types/vendor';
import type { RejectVendorApplicationInput } from '@/lib/validation/schemas/vendor.schema';
import { apiPost, apiGet, ApiError } from './client';

interface ListVendorApplicationsResponse {
    success: true;
    applications: VendorApplicationPublic[];
}

interface GetVendorApplicationResponse {
    success: true;
    application: VendorApplicationPublic;
}

interface MutateVendorApplicationResponse {
    success: true;
    application: VendorApplicationPublic;
}

interface MyApplicationResponse {
    success: true;
    application: VendorApplicationPublic | null;
}

export async function listVendorApplicationsApi(
    status: VendorApplicationStatus | undefined,
    accessToken: string,
): Promise<ListVendorApplicationsResponse | ApiError> {
    return apiGet<ListVendorApplicationsResponse>('/api/vendor-application', { accessToken, params: { status, }, },);
};

export async function getVendorApplicationApi(
    id: string,
    accessToken: string,
): Promise<GetVendorApplicationResponse | ApiError> {
    return apiGet<GetVendorApplicationResponse>(`/api/vendor-application/${id}`, { accessToken });
};

export async function approveVendorApplicationApi(
    id: string,
    accessToken: string,
): Promise<MutateVendorApplicationResponse | ApiError> {
    return apiPost<MutateVendorApplicationResponse>(`/api/vendor-application/${id}/approve`, { accessToken });
};

export async function rejectVendorApplicationApi(
    id: string,
    reason: RejectVendorApplicationInput['rejectionReason'],
    accessToken: string,
): Promise<MutateVendorApplicationResponse | ApiError> {
    return apiPost<MutateVendorApplicationResponse>(
        `/api/vendor-application/${id}/reject`,
        { body: { rejectionReason: reason }, accessToken });
};

export async function myApplicationApi(
    accessToken: string,
): Promise<MyApplicationResponse | ApiError> {
    return apiGet<MyApplicationResponse>('/api/vendor-application/mine', { accessToken });
};


