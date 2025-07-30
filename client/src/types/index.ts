export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    isActive: boolean;
    currentlyUsing: Array<{
        instrument: {
            _id: string;
            name: string;
            category: string;
            image?: string;
        };
        startTime: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface Instrument {
    _id: string;
    name: string;
    description: string;
    image?: string;
    quantity: number;
    availableQuantity: number;
    manualGuide?: string;
    status: 'available' | 'unavailable' | 'maintenance';
    specifications: Record<string, string>;
    category: string;
    location?: string;
    currentUsers: Array<{
        user: {
            _id: string;
            name: string;
            email: string;
        };
        startTime: string;
        quantity: number;
    }>;
    totalUsageTime: number;
    usageCount: number;
    isFullyOccupied: boolean;
    currentlyAvailable: number;
    createdAt: string;
    updatedAt: string;
}

export interface UsageHistory {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    instrument: {
        _id: string;
        name: string;
        category: string;
        image?: string;
    };
    startTime: string;
    endTime?: string;
    duration: number;
    quantity: number;
    status: 'active' | 'completed' | 'terminated';
    notes?: string;
    terminatedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    terminationReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface ApiResponse<T> {
    message?: string;
    data?: T;
    error?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface InstrumentsPaginatedResponse {
    instruments: Instrument[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface UsersPaginatedResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface UsageHistoryPaginatedResponse {
    usageHistory: UsageHistory[];
    totalUsageTime?: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}