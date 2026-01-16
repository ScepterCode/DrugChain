import api from './api';

export interface BatchDistributionFlow {
    batch_info: {
        batch_id: string;
        product_name: string;
        total_cartons: number;
        production_date: string;
        expiry_date: string;
        batch_size: number;
    };
    distribution_summary: Record<string, {
        entity_name: string;
        entity_type: string;
        cartons_received: number;
        first_scan: string;
        last_scan: string;
        location: string;
    }>;
    flow_visualization: Array<{
        step: number;
        entity_name: string;
        entity_type: string;
        cartons_count: number;
        timestamp: string;
        location: string;
        is_current: boolean;
    }>;
    blockchain_status: {
        network_healthy: boolean;
        total_blockchain_events: number;
        verified_on_blockchain: boolean;
    };
}

export interface ManufacturerBatch {
    batch_id: string;
    product_name: string;
    batch_size: number;
    total_cartons: number;
    distributed_cartons: number;
    created_at: string;
    production_date: string;
    expiry_date: string;
    status: string;
}

export const supplyChainService = {
    // Get batch distribution flow for manufacturers
    getBatchDistributionFlow: async (batchId: string): Promise<BatchDistributionFlow> => {
        const response = await api.get(`/analytics/supply-chain/batch-flow/${batchId}`);
        return response.data.data;
    },

    // Get manufacturer batches with distribution summary
    getManufacturerBatches: async (): Promise<ManufacturerBatch[]> => {
        const response = await api.get('/analytics/supply-chain/manufacturer-batches');
        return response.data.data;
    },

    // Receive stock (for distributors/pharmacies)
    receiveStock: async (cartonIds: string[], receivedFrom: string, notes?: string) => {
        const response = await api.post('/supply-chain/receive-stock', {
            carton_ids: cartonIds,
            received_from: receivedFrom,
            notes
        });
        return response.data;
    },

    // Transfer stock out (for distributors/pharmacies)
    transferStock: async (cartonIds: string[], transferTo: string, transferType: string, notes?: string) => {
        const response = await api.post('/supply-chain/transfer-out', {
            carton_ids: cartonIds,
            transfer_to: transferTo,
            transfer_type: transferType,
            notes
        });
        return response.data;
    },

    // Get inventory for distributors/pharmacies
    getInventory: async () => {
        const response = await api.get('/supply-chain/inventory');
        return response.data.data;
    },

    // Verify entity authorization for carton scanning
    verifyEntityAuthorization: async (phoneNumber: string) => {
        const response = await api.post('/analytics/supply-chain/verify-entity', null, {
            params: { phone_number: phoneNumber }
        });
        return response.data.data;
    }
};