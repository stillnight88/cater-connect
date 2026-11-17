import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from './client';
import type { ReviewPublic, VendorRatingSummary } from '@/types/review';
import type { MenuItemPublic } from '@/types/menu';

const API_BASE = '/api';

export interface VendorPublic {
    id: string;
    businessName: string;
    description: string;
    phone: string;
    address: string;
}

interface GetVendorsResponse {
    success: true;
    vendors: VendorPublic[];
}

interface GetVendorResponse {
    success: true;
    vendor: VendorPublic;
}

interface GetVendorMenuResponse {
    success: true;
    items: MenuItemPublic[];
}

interface GetMyMenuResponse {
    success: true;
    items: MenuItemPublic[];
}

interface CreateMenuItemResponse {
    success: true;
    item: MenuItemPublic;
}

interface UpdateMenuItemResponse {
    success: true;
    item: MenuItemPublic;
}

interface PublishMenuItemResponse {
    success: true;
    item: MenuItemPublic;
}

interface UnpublishMenuItemResponse {
    success: true;
    item: MenuItemPublic;
}

interface DeleteMenuItemResponse {
    success: true;
}

interface GetVendorReviewsResponse {
    success: true;
    reviews: ReviewPublic[];
    summary: VendorRatingSummary;
}

// No accessToken — public route
export async function getVendorsApi(): Promise<GetVendorsResponse | ApiError> {
    return apiGet<GetVendorsResponse>(`${API_BASE}/vendors`);
};

export async function getVendorApi(id: string): Promise<GetVendorResponse | ApiError> {
    return apiGet<GetVendorResponse>(`${API_BASE}/vendors/${id}`);
};

export async function getVendorReviewsApi(
    vendorId: string,
): Promise<GetVendorReviewsResponse | ApiError> {
    return apiGet<GetVendorReviewsResponse>(
        `${API_BASE}/vendors/${vendorId}/reviews`,
    );
}

// Published menu items only
export async function getVendorMenuApi(vendorId: string): Promise<GetVendorMenuResponse | ApiError> {
    return apiGet<GetVendorMenuResponse>(`${API_BASE}/vendors/${vendorId}/menu`);
};

// vendor-authed
export async function createMenuItemApi(
    data: { name: string; description: string; price: number; category: string },
    accessToken: string,
): Promise<CreateMenuItemResponse | ApiError> {
    return apiPost<CreateMenuItemResponse>(`${API_BASE}/menu`, { accessToken, body: data });
};

export async function updateMenuItemApi(
    id: string,
    data: Partial<{ name: string; description: string; price: number; category: string }>,
    accessToken: string,
): Promise<UpdateMenuItemResponse | ApiError> {
    return apiPatch<UpdateMenuItemResponse>(`${API_BASE}/menu/${id}`, { accessToken, body: data });
};

export async function publishMenuItemApi(
    id: string,
    accessToken: string,
): Promise<PublishMenuItemResponse | ApiError> {
    return apiPatch<PublishMenuItemResponse>(`${API_BASE}/menu/${id}/publish`, { accessToken });
};

export async function unpublishMenuItemApi(
    id: string,
    accessToken: string,
): Promise<UnpublishMenuItemResponse | ApiError> {
    return apiPatch<UnpublishMenuItemResponse>(`${API_BASE}/menu/${id}/unpublish`, { accessToken });
};

export async function deleteMenuItemApi(
    id: string,
    accessToken: string,
): Promise<DeleteMenuItemResponse | ApiError> {
    return apiDelete<DeleteMenuItemResponse>(`${API_BASE}/menu/${id}`, { accessToken });
};

// All items including drafts — vendor sees their own full menu
export async function getMyMenuApi(
    accessToken: string,
): Promise<GetMyMenuResponse | ApiError> {
    return apiGet<GetMyMenuResponse>(`${API_BASE}/menu`, { accessToken });
};