import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const JSON_HEADERS = {
    'Content-Type': 'application/json',
};

const isRefreshEndpoint = (url?: string): boolean => {
    return typeof url === 'string' && url.includes('/auth/refresh');
};

const isExcludedFromRefresh = (url?: string): boolean => {
    if (typeof url !== 'string') {
        return false;
    }

    return (
        url.includes('/auth/me') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/logout') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password')
    );
};

export const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: JSON_HEADERS,
});

const refreshClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: JSON_HEADERS,
});

let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const shouldRefresh =
            status === 401 &&
            !originalRequest._retry &&
            !isRefreshEndpoint(originalRequest.url) &&
            !isExcludedFromRefresh(originalRequest.url);

        if (!shouldRefresh) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshClient.post('/auth/refresh').then(() => undefined);
            }

            await refreshPromise;
            return apiClient(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        } finally {
            refreshPromise = null;
        }
    },
);
