import { apiClient } from '../api/api-client.ts';

export interface Property {
    id: string;
    name: string;
    type: string;
    address: string;
    price: number;
    level: number;
    createdAt: string;
}

export const propertyService = {
    getAll: async (): Promise<Property[]> => {
        const response = await apiClient.get('/properties');
        return response.data;
    },

    add: async (property: Omit<Property, 'id' | 'createdAt'>): Promise<Property> => {
        const response = await apiClient.post('/properties', property);
        return response.data;
    },

    update: async (id: string, property: Omit<Property, 'id' | 'createdAt'>): Promise<Property> => {
        const response = await apiClient.put(`/properties/${id}`, property);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/properties/${id}`);
    },
};
