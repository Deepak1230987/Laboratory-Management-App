import api from './api';
import type { UsageHistory, UsageHistoryPaginatedResponse, Instrument } from '../types';

export const usageApi = {
    start: async (instrumentId: string, quantity?: number): Promise<{
        message: string;
        instrument: Instrument;
        usageHistory: string;
    }> => {
        const response = await api.post('/usage/start', { instrumentId, quantity });
        return response.data;
    },

    stop: async (instrumentId: string, notes?: string): Promise<{
        message: string;
        instrument: Instrument;
        usageHistory: UsageHistory;
        duration: number;
    }> => {
        const response = await api.post('/usage/stop', { instrumentId, notes });
        return response.data;
    },

    forceStop: async (instrumentId: string, userId: string, reason?: string): Promise<{
        message: string;
        instrument: Instrument;
        usageHistory: UsageHistory;
        duration: number;
    }> => {
        const response = await api.post('/usage/force-stop', { instrumentId, userId, reason });
        return response.data;
    },

    getMyHistory: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        usageHistory: UsageHistory[];
        totalUsageTime: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> => {
        const response = await api.get('/usage/history/me', { params });
        return response.data;
    },

    getAllHistory: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        instrumentId?: string;
        userId?: string;
    }): Promise<UsageHistoryPaginatedResponse> => {
        const response = await api.get('/usage/history/all', { params });
        return response.data;
    },

    getActive: async (): Promise<UsageHistory[]> => {
        const response = await api.get('/usage/active');
        return response.data;
    },

    getMyActive: async (): Promise<UsageHistory[]> => {
        const response = await api.get('/usage/active/me');
        return response.data;
    },
};
