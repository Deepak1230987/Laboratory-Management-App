import api from './api';
import type { AuthResponse, User } from '../types';

export const authApi = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (data: {
        name: string;
        email: string;
        password: string;
        role?: 'admin' | 'user';
    }): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    verify: async (): Promise<{ user: User }> => {
        const response = await api.get('/auth/verify');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};
