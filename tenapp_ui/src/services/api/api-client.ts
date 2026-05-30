import { JSON_HEADERS } from './api-client.constants.ts';
import type {
    ApiRequestConfig,
    ApiRequestOptions,
    ApiResponse,
} from './api-client.interfaces.ts';
import {buildUrl, isExcludedFromRefresh, isRefreshEndpoint, parseResponse} from "./api-client.helpers.ts";

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

export const ApiClient = {
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
