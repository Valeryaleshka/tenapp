type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface ApiRequestOptions {
    params?: QueryParams;
    signal?: AbortSignal;
}

interface ApiResponse<T> {
    data: T;
}

interface ApiRequestConfig extends ApiRequestOptions {
    body?: unknown;
    method: 'DELETE' | 'GET' | 'POST' | 'PUT';
    retry?: boolean;
}

export class ApiError extends Error {
    readonly data: unknown;
    readonly status: number;

    constructor(
        message: string,
        status: number,
        data: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
        this.data = data;
        this.status = status;
    }
}

const API_BASE_URL = '/api';
const JSON_HEADERS = {
    'Content-Type': 'application/json',
};

const isRefreshEndpoint = (url: string): boolean => {
    return url.includes('/auth/refresh');
};

const isExcludedFromRefresh = (url: string): boolean => {
    return (
        url.includes('/auth/me') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/logout') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password')
    );
};

const buildUrl = (path: string, params?: QueryParams): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
};

const parseResponse = async (response: Response): Promise<unknown> => {
    if (response.status === 204) {
        return undefined;
    }

    const text = await response.text();

    if (!text) {
        return undefined;
    }

    const contentType = response.headers.get('content-type') ?? '';
    return contentType.includes('application/json') ? JSON.parse(text) : text;
};

let refreshPromise: Promise<void> | null = null;

const refreshAuth = async (): Promise<void> => {
    if (!refreshPromise) {
        refreshPromise = request<void>('/auth/refresh', { method: 'POST', retry: false }).then(() => undefined);
    }

    try {
        await refreshPromise;
    } finally {
        refreshPromise = null;
    }
};

const request = async <T>(path: string, config: ApiRequestConfig): Promise<ApiResponse<T>> => {
    const url = buildUrl(path, config.params);
    const response = await fetch(url, {
        body: config.body === undefined ? undefined : JSON.stringify(config.body),
        credentials: 'include',
        headers: JSON_HEADERS,
        method: config.method,
        signal: config.signal,
    });
    const data = await parseResponse(response);

    if (response.ok) {
        return { data: data as T };
    }

    const shouldRefresh =
        response.status === 401 &&
        config.retry !== false &&
        !isRefreshEndpoint(path) &&
        !isExcludedFromRefresh(path);

    if (shouldRefresh) {
        await refreshAuth();
        return request<T>(path, { ...config, retry: false });
    }

    throw new ApiError(response.statusText || 'Request failed', response.status, data);
};

export const apiClient = {
    get<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
        return request<T>(path, { ...options, method: 'GET' });
    },

    post<T = unknown>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
        return request<T>(path, { ...options, body, method: 'POST' });
    },

    put<T = unknown>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
        return request<T>(path, { ...options, body, method: 'PUT' });
    },

    delete<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
        return request<T>(path, { ...options, method: 'DELETE' });
    },
};
