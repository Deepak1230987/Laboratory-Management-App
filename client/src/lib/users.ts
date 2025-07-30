import api from './api';
import type { User, UsersPaginatedResponse } from '../types';

export const usersApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        isActive?: boolean;
    }): Promise<UsersPaginatedResponse> => {
        const response = await api.get('/users/all', { params });
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: {
        name?: string;
        email?: string;
    }): Promise<{ message: string; user: User }> => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    toggleUserStatus: async (id: string): Promise<{ message: string; user: User }> => {
        const response = await api.patch(`/users/${id}/status`);
        return response.data;
    },
};
