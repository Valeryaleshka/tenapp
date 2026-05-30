import { apiClient } from '../api/api-client.ts';

export interface User {
    id: string;
    email: string;
    firstName: string;
    secondName?: string;
    lastName?: string;
    login?: string;
    phoneNumber?: string | null;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload extends LoginPayload {
    firstName: string;
    secondName: string;
}

export interface ResetPasswordPayload {
    email: string;
    token: string;
    newPassword: string;
}

export interface UpdateAccountPayload {
    firstName: string;
    secondName: string;
    email: string;
    phoneNumber?: string | null;
}

const extractUser = (data: unknown): User | null => {
    if (typeof data !== 'object' || data === null) {
        return null;
    }

    if ('user' in data) {
        return (data as { user: User }).user;
    }

    return data as User;
};

export const authService = {
    async register(payload: RegisterPayload): Promise<User | null> {
        const response = await apiClient.post<unknown>('/auth/register', payload);
        return extractUser(response.data);
    },

    async login(payload: LoginPayload): Promise<User | null> {
        const response = await apiClient.post<unknown>('/auth/login', payload);
        return extractUser(response.data);
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
    },

    async refresh(): Promise<void> {
        await apiClient.post('/auth/refresh');
    },

    async me(): Promise<User> {
        const response = await apiClient.get<unknown>('/auth/me');
        const user = extractUser(response.data);

        if (!user) {
            throw new Error('Failed to load current user');
        }

        return user;
    },

    async updateAccount(payload: UpdateAccountPayload): Promise<User> {
        const response = await apiClient.put<unknown>('/auth/account', payload);
        const user = extractUser(response.data);

        if (!user) {
            throw new Error('Failed to update account');
        }

        return user;
    },

    async forgotPassword(email: string): Promise<void> {
        await apiClient.post('/auth/forgot-password', { email });
    },

    async resetPassword(payload: ResetPasswordPayload): Promise<void> {
        await apiClient.post('/auth/reset-password', payload);
    },
};
