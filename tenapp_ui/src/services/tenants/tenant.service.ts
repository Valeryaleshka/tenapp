import { apiClient } from '../api/api-client.ts';
import { type SortDirection } from '../sort/sort.service.ts';

export interface Tenant {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    createdAt: string;
    propertyCount: number;
    assignedProperties: string[];
    properties: Array<{
        id: string;
        name: string;
        address: string;
    }>;
}

export interface TenantSelect {
    id: string;
    name: string;
}

export interface TenantDailyStats {
    date: string;
    count: number;
    accumulatedCount: number;
}

export interface TenantDailyStatsQuery {
    startDate?: string;
    endDate?: string;
}

export interface TenantSelectQuery {
    search?: string;
    limit?: number;
    selectedTenantId?: string | null;
}

export interface CreateTenantPayload {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export type TenantSortField = 'firstName' | 'lastName';

export const tenantService = {
    getAll: async (
        page = 1,
        pageSize = 20,
        sortBy: TenantSortField = 'firstName',
        sortDir: SortDirection = 'asc',
        signal?: AbortSignal,
    ): Promise<PagedResponse<Tenant>> => {
        const response = await apiClient.get('/tenants', {
            signal,
            params: { page, pageSize, sortBy, sortDir },
        });
        return response.data;
    },

    getById: async (id: string): Promise<Tenant> => {
        const response = await apiClient.get(`/tenants/${id}`);
        return response.data;
    },

    add: async (payload: CreateTenantPayload): Promise<Tenant> => {
        const response = await apiClient.post('/tenants', payload);
        return response.data;
    },

    getForSelect: async (query: TenantSelectQuery = {}, signal?: AbortSignal): Promise<TenantSelect[]> => {
        const response = await apiClient.get('/tenants/select', {
            signal,
            params: {
                search: query.search || undefined,
                limit: query.limit,
                selectedTenantId: query.selectedTenantId || undefined,
            },
        });
        return response.data;
    },

    getDailyStats: async (query: TenantDailyStatsQuery = {}, signal?: AbortSignal): Promise<TenantDailyStats[]> => {
        const response = await apiClient.get('/tenants/daily-stats', {
            signal,
            params: {
                startDate: query.startDate || undefined,
                endDate: query.endDate || undefined,
            },
        });
        return response.data;
    },

    update: async (id: string, payload: CreateTenantPayload): Promise<Tenant> => {
        const response = await apiClient.put(`/tenants/${id}`, payload);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tenants/${id}`);
    },
};
