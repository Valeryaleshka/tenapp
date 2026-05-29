import { apiClient } from '../api/api-client.ts';
import { type SortDirection } from '../sort/sort.service.ts';

export interface Property {
    id: string;
    name: string;
    type: string;
    address: string;
    price: number;
    level: number;
    createdAt: string;
    startDate?: string | null;
    endDate?: string | null;
    tenantId?: string | null;
    tenantFullName?: string | null;
}

export interface PropertyUpsertPayload {
    name: string;
    type: string;
    address: string;
    price: number;
    level: number;
    tenantId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
}

export interface PropertyDailyStats {
    date: string;
    activeLeaseCount: number;
    accumulatedStartedLeaseCount: number;
}

export interface PropertyDailyStatsQuery {
    startDate?: string;
    endDate?: string;
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export type PropertySortField = 'name' | 'type' | 'level';

export const propertyService = {
    getAll: async (
        page = 1,
        pageSize = 20,
        sortBy: PropertySortField = 'name',
        sortDir: SortDirection = 'asc',
        signal?: AbortSignal,
    ): Promise<PagedResponse<Property>> => {
        const response = await apiClient.get('/properties', {
            signal,
            params: { page, pageSize, sortBy, sortDir },
        });
        return response.data;
    },

    getById: async (id: string): Promise<Property> => {
        const response = await apiClient.get(`/properties/${id}`);
        return response.data;
    },

    add: async (property: PropertyUpsertPayload): Promise<Property> => {
        const response = await apiClient.post('/properties', property);
        return response.data;
    },

    getDailyStats: async (
        query: PropertyDailyStatsQuery = {},
        signal?: AbortSignal,
    ): Promise<PropertyDailyStats[]> => {
        const response = await apiClient.get('/properties/daily-stats', {
            signal,
            params: {
                startDate: query.startDate || undefined,
                endDate: query.endDate || undefined,
            },
        });
        return response.data;
    },

    update: async (id: string, property: PropertyUpsertPayload): Promise<Property> => {
        const response = await apiClient.put(`/properties/${id}`, property);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/properties/${id}`);
    },
};
