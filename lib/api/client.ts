export interface ApiError {
    success: false;
    error: string;
    errors?: Array<{ field: string; message: string }>; // Zod field errors
    waitSeconds?: number;              // Rate limit errors
}

interface FetchOptions {
    body?: unknown;
    accessToken?: string;
}

export async function apiPost<TResponse>(
    path: string,
    options: FetchOptions = {}
): Promise<TResponse | ApiError> {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (options.accessToken) {
            headers['Authorization'] = `Bearer ${options.accessToken}`;
        }

        const response = await fetch(path, {
            method: 'POST',
            headers,
            credentials: 'include', // Required — sends httpOnly refresh_token cookie
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });

        const data = await response.json();
        return data as TResponse | ApiError;
    } catch {
        return {
            success: false,
            error: 'Network error. Please check your connection.',
        } satisfies ApiError;
    }
};

export async function apiGet<TResponse>(
    path: string,
    options: FetchOptions & { params?: Record<string, string | number | undefined> } = {}
): Promise<TResponse | ApiError> {
    try {
        const url = new URL(path, window.location.origin);

        if (options.params) {
            for (const [key, value] of Object.entries(options.params)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            }
        }

        const headers: Record<string, string> = {};
        if (options.accessToken) {
            headers['Authorization'] = `Bearer ${options.accessToken}`;
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
            credentials: 'include',
        });

        const data = await response.json();
        return data as TResponse | ApiError;
    } catch {
        return {
            success: false,
            error: 'Network error. Please check your connection.',
        } satisfies ApiError;
    }
};