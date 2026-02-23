import { apiClient } from '../api/api-client.ts';

export interface Property {
    id: string;
    name: string;
    type: string;
    address: string;
    price: number;
    level: number;
    createdAt: string;
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
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export const propertyService = {
    getAll: async (page = 1, pageSize = 20): Promise<PagedResponse<Property>> => {
        const response = await apiClient.get('/properties', {
            params: { page, pageSize },
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

    update: async (id: string, property: PropertyUpsertPayload): Promise<Property> => {
        const response = await apiClient.put(`/properties/${id}`, property);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/properties/${id}`);
    },
};
