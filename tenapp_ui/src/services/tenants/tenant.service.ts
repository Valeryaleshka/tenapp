import { apiClient } from '../api/api-client.ts';

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

export const tenantService = {
    getAll: async (page = 1, pageSize = 20): Promise<PagedResponse<Tenant>> => {
        const response = await apiClient.get('/tenants', {
            params: { page, pageSize },
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

    getForSelect: async (): Promise<TenantSelect[]> => {
        const response = await apiClient.get('/tenants/select');
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
