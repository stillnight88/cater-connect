import type { VendorApplicationPublic, VendorApplicationStatus } from '@/types/vendor';
import type { RejectVendorApplicationInput, SubmitVendorApplicationInput } from '@/lib/validation/schemas';
import { apiPost, apiGet, ApiError } from './client';

export interface SubmitVendorApplicationResponse {
    success: true;
    message: string;
    application: {
        id: string;
        businessName: string;
        status: string;
        submittedAt: string;
    };
}
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

export async function submitVendorApplicationApi(
    input: SubmitVendorApplicationInput,
    accessToken: string
): Promise<SubmitVendorApplicationResponse | ApiError> {
    return apiPost<SubmitVendorApplicationResponse>(
        '/api/vendor-application/submit',
        { body: input, accessToken }
    );
};

export async function listVendorApplicationsApi(
    status: VendorApplicationStatus | undefined,
    accessToken: string,
): Promise<ListVendorApplicationsResponse | ApiError> {
    return apiGet<ListVendorApplicationsResponse>('/api/vendor-application', { accessToken, params: { status } });
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


