import api from './api';

export interface VerificationLocation {
    id: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    count: number;
    recent_verifications: Array<{
        pack_id: string;
        verified_at: string;
        result: string;
    }>;
}

export interface VolumeData {
    volumeData: Array<{
        period: string;
        produced: number;
        distributed: number;
        verified: number;
        counterfeit: number;
    }>;
    stateVolumeData: Array<{
        state: string;
        volume: number;
        verifications: number;
        counterfeit_rate: number;
    }>;
}

export interface DashboardStats {
    total_products?: number;
    total_batches?: number;
    total_verifications?: number;
    total_manufacturers?: number;
    total_verifications_nationwide?: number;
    verification_rate?: number;
    total_inventory_cartons?: number;
    total_inventory_packs?: number;
    counterfeit_alerts?: number;
    verification_trends?: { date: string; verifications: number }[];
    geographic_distribution?: { state: string; verifications: number }[];
    recent_alerts?: {
        id: string;
        type: 'COUNTERFEIT' | 'SUSPICIOUS';
        product_name: string;
        location: string;
        timestamp: string;
    }[];
    pending_transfers?: number;
    completed_transfers?: number;
    low_stock_alerts?: number;
    recent_transfers?: {
        id: string;
        type: 'RECEIVED' | 'DISPATCHED';
        product_name: string;
        quantity: number;
        from_to: string;
        timestamp: string;
    }[];
    inventory_by_product?: {
        product_name: string;
        cartons: number;
        packs: number;
        status: 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';
    }[];
}

export interface ProductPerformance {
    product_name: string;
    product_code: string;
    total_verifications: number;
    total_packs: number;
    verification_rate: number;
}

export const analyticsService = {
    getManufacturerStats: async () => {
        const response = await api.get<{ data: DashboardStats }>('/analytics/manufacturer/dashboard');
        return response.data.data;
    },

    getManufacturerBatches: async () => {
        const response = await api.get<{ data: any[] }>('/analytics/supply-chain/manufacturer-batches');
        return response.data.data;
    },

    getRegulatorStats: async () => {
        const response = await api.get<{ data: DashboardStats }>('/analytics/regulator/dashboard');
        return response.data.data;
    },

    getDistributorStats: async () => {
        const response = await api.get<{ data: DashboardStats }>('/analytics/distributor/dashboard');
        return response.data.data;
    },

    getVerificationTrends: async (days: number = 30) => {
        const response = await api.get<{ data: { date: string; verifications: number }[] }>(`/analytics/verification-trends?days=${days}`);
        return response.data.data;
    },

    getGeographicDistribution: async () => {
        const response = await api.get<{ data: { state: string; verifications: number }[] }>('/analytics/geographic-distribution');
        return response.data.data;
    },

    getProductPerformance: async () => {
        const response = await api.get<{ data: ProductPerformance[] }>('/analytics/product-performance');
        return response.data.data;
    },

    getRecentAlerts: async (limit: number = 10) => {
        const response = await api.get<{ data: any[] }>(`/analytics/recent-alerts?limit=${limit}`);
        return response.data.data;
    },

    // New enhanced analytics methods
    getVerificationLocations: async (days: number = 30): Promise<VerificationLocation[]> => {
        const response = await api.get(`/analytics/verification-locations?days=${days}`);
        return response.data.data;
    },

    getVolumeData: async (days: number = 30): Promise<VolumeData> => {
        const response = await api.get(`/analytics/volume-data?days=${days}`);
        return response.data.data;
    },

    exportAnalytics: async (format: 'csv' | 'xlsx' = 'csv', days: number = 30) => {
        const response = await api.get(`/analytics/export?format=${format}&days=${days}`, {
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
