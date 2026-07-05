import type { SubmitVendorApplicationInput } from '@/lib/validation/schemas';
import { apiPost, ApiError } from './client'

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

export async function submitVendorApplicationApi(
    input: SubmitVendorApplicationInput,
    accessToken: string
): Promise<SubmitVendorApplicationResponse | ApiError> {
    return apiPost<SubmitVendorApplicationResponse>(
        '/api/vendor-application/submit',
        { body: input, accessToken }
    );
};