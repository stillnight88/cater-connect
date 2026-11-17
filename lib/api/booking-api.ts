import type { BookingPublic } from '@/types/booking';
import type { ReviewPublic } from '@/types/review';
import { apiGet, apiPost, apiPatch, ApiError } from './client';

const API_BASE = '/api';

interface CreateBookingResponse {
    success: true;
    booking: BookingPublic;
}

interface GetMyBookingsResponse {
    success: true;
    bookings: BookingPublic[];
}

interface GetIncomingBookingsResponse {
    success: true;
    bookings: BookingPublic[];
}

interface AcceptBookingResponse {
    success: true;
    booking: BookingPublic;
}

interface RejectBookingResponse {
    success: true;
    booking: BookingPublic;
}

interface CompleteBookingResponse {
    success: true;
    booking: BookingPublic;
}

interface GetBookingResponse {
    success: true;
    booking: BookingPublic;
}

interface CancelBookingResponse {
    success: true;
    booking: BookingPublic;
}

interface GetAdminBookingsResponse {
    success: true;
    bookings: BookingPublic[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface CreateReviewResponse {
    success: true;
    review: ReviewPublic;
}

// Customer operations
export async function createBookingApi(
    data: {
        vendorId: string;
        eventDate: Date;
        eventAddress: string;
        guestCount: number;
        notes?: string;
    },
    accessToken: string,
): Promise<CreateBookingResponse | ApiError> {
    return apiPost<CreateBookingResponse>(`${API_BASE}/bookings`, { accessToken, body: data });
};

export async function getMyBookingsApi(
    accessToken: string,
): Promise<GetMyBookingsResponse | ApiError> {
    return apiGet<GetMyBookingsResponse>(`${API_BASE}/bookings/mine`, { accessToken });
};

// Vendor operations
export async function getIncomingBookingsApi(
    accessToken: string,
): Promise<GetIncomingBookingsResponse | ApiError> {
    return apiGet<GetIncomingBookingsResponse>(`${API_BASE}/bookings/incoming`, { accessToken });
};

export async function acceptBookingApi(
    id: string,
    accessToken: string,
): Promise<AcceptBookingResponse | ApiError> {
    return apiPatch<AcceptBookingResponse>(`${API_BASE}/bookings/${id}/accept`, { accessToken });
};

export async function rejectBookingApi(
    id: string,
    rejectionReason: string,
    accessToken: string,
): Promise<RejectBookingResponse | ApiError> {
    return apiPatch<RejectBookingResponse>(`${API_BASE}/bookings/${id}/reject`, { body: { rejectionReason }, accessToken });
};

export async function completeBookingApi(
    id: string,
    accessToken: string,
): Promise<CompleteBookingResponse | ApiError> {
    return apiPatch<CompleteBookingResponse>(
        `${API_BASE}/bookings/${id}/complete`, { accessToken },
    );
};

// Both parties
export async function getBookingApi(
    id: string,
    accessToken: string,
): Promise<GetBookingResponse | ApiError> {
    return apiGet<GetBookingResponse>(`${API_BASE}/bookings/${id}`, { accessToken });
};

export async function cancelBookingApi(
    id: string,
    accessToken: string,
): Promise<CancelBookingResponse | ApiError> {
    return apiPatch<CancelBookingResponse>(`${API_BASE}/bookings/${id}/cancel`, { accessToken });
};

export async function createReviewApi(
    bookingId: string,
    data: { rating: number; comment?: string },
    accessToken: string,
): Promise<CreateReviewResponse | ApiError> {
    return apiPost<CreateReviewResponse>(
        `${API_BASE}/bookings/${bookingId}/review`,
        { accessToken, body: data },
    );
}

// Admin
export async function getAdminBookingsApi(
    accessToken: string,
    status?: string,
    page: number = 1,
): Promise<GetAdminBookingsResponse | ApiError> {
    return apiGet<GetAdminBookingsResponse>(`${API_BASE}/admin/bookings`, {
        accessToken,
        params: { status, page }
    });
};
