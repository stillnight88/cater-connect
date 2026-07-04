import type {
    SignupInput,
    VerifyEmailInput,
    LoginInput,
    MFAVerifyInput,
    MFARequestInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    ResendVerificationInput,
} from '@/lib/validation/schemas';
import type { UserRole, UserPublic } from '@/types/user';
import { apiPost, ApiError } from './client'

export interface SignupResponse {
    success: true;
    message: string;
    user: { id: string; email: string; name: string };
}

export interface VerifyEmailResponse {
    success: true;
    message: string;
}

export interface LoginSuccessResponse {
    success: true;
    mfaRequired?: false;
    accessToken: string;
    user: {
        id: string,
        name: string;
        email: string;
        role: UserRole;
        emailVerified: boolean;
    };
}

export interface LoginMFARequiredResponse {
    success: true;
    mfaRequired: true;
    message: string;
    email: string;
}

export type LoginResponse = LoginSuccessResponse | LoginMFARequiredResponse;

export interface MFAVerifyResponse {
    success: true;
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        emailVerified: boolean;
    };
}

export interface MFARequestResponse {
    success: true;
    message: string;
}

export interface ForgotPasswordResponse {
    success: true;
    message: string;
}

export interface ResetPasswordResponse {
    success: true;
    message: string;
}

export interface ResendVerificationResponse {
    success: true;
    message: string;
}

export interface LogoutResponse {
    success: true;
    message: string;
}

export interface RefreshResponse {
    success: true;
    accessToken: string;
    user: { id: string; email: string; role: UserRole };
}

export interface MeResponse {
    success: true;
    user: UserPublic;
}

export async function signupApi(input: SignupInput): Promise<SignupResponse | ApiError> {
    return apiPost<SignupResponse>('/api/auth/signup', { body: input });
};

export async function verifyEmailApi(input: VerifyEmailInput): Promise<VerifyEmailResponse | ApiError> {
    return apiPost<VerifyEmailResponse>('/api/auth/verify-email', { body: input });
};

export async function resendVerificationApi(input: ResendVerificationInput): Promise<ResendVerificationResponse | ApiError> {
    return apiPost<ResendVerificationResponse>('/api/auth/resend-verification', { body: input, });
};

export async function loginApi(input: LoginInput): Promise<LoginResponse | ApiError> {
    return apiPost<LoginResponse>('/api/auth/login', { body: input });
};

export async function mfaVerifyApi(input: MFAVerifyInput): Promise<MFAVerifyResponse | ApiError> {
    return apiPost<MFAVerifyResponse>('/api/auth/mfa/verify', { body: input });
};

export async function mfaRequestApi(input: MFARequestInput): Promise<MFARequestResponse | ApiError> {
    return apiPost<MFARequestResponse>('/api/auth/mfa/request', { body: input });
};

export async function forgotPasswordApi(input: ForgotPasswordInput): Promise<ForgotPasswordResponse | ApiError> {
    return apiPost<ForgotPasswordResponse>('/api/auth/forgot-password', { body: input, });
};

export async function resetPasswordApi(input: ResetPasswordInput
): Promise<ResetPasswordResponse | ApiError> {
    return apiPost<ResetPasswordResponse>('/api/auth/reset-password', { body: input, });
};

export async function logoutApi(): Promise<LogoutResponse | ApiError> {
    return apiPost<LogoutResponse>('/api/auth/logout', { body: {} });  // Body is empty — refresh token comes from httpOnly cookie
};

export async function refreshApi(): Promise<RefreshResponse | ApiError> {
    return apiPost<RefreshResponse>('/api/auth/refresh');  // No body — refresh token comes from httpOnly cookie automatically
};

export async function meApi(accessToken: string): Promise<MeResponse | ApiError> {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}`, },
            credentials: 'include',
        });

        const data = await response.json();
        return data as MeResponse | ApiError;
    } catch {
        return {
            success: false,
            error: 'Network error. Please check your connection.',
        } satisfies ApiError;
    }
};