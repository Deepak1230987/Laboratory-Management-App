import api from './api';
import type { Instrument, InstrumentsPaginatedResponse } from '../types';

export const instrumentsApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        category?: string;
        status?: string;
        search?: string;
    }): Promise<InstrumentsPaginatedResponse> => {
        const response = await api.get('/instruments', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Instrument> => {
        const response = await api.get(`/instruments/${id}`);
        return response.data;
    },

    create: async (data: FormData): Promise<{ message: string; instrument: Instrument }> => {
        const response = await api.post('/instruments', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id: string, data: FormData): Promise<{ message: string; instrument: Instrument }> => {
        const response = await api.put(`/instruments/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/instruments/${id}`);
        return response.data;
    },

    getStats: async (id: string) => {
        const response = await api.get(`/instruments/${id}/stats`);
        return response.data;
    },
};
