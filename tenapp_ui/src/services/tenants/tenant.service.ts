import { apiClient } from '../api/api-client.ts';

export interface Tenant {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    createdAt: string;
    propertyId?: string | null;
    propertyName?: string | null;
    propertyAddress?: string | null;
    assignedProperty?: string | null;
}

export interface CreateTenantPayload {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    propertyId?: string | null;
}

export const tenantService = {
    getAll: async (): Promise<Tenant[]> => {
        const response = await apiClient.get('/tenants');
        return response.data;
    },

    add: async (payload: CreateTenantPayload): Promise<Tenant> => {
        const response = await apiClient.post('/tenants', payload);
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
