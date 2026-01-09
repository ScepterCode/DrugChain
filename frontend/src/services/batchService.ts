import api from './api';

export interface Batch {
    batch_id: string;
    product_id: string;
    product_name?: string;
    manufacturer_id: string;
    production_date: string;
    expiry_date: string;
    batch_size: number;
    total_packs: number;
    packs_per_carton: number;
    status: 'ACTIVE' | 'COMPLETED' | 'RECALLED';
    created_at: string;
    total_verifications?: number;
}

export interface BatchCreateData {
    product_id: string;
    production_date: string;
    expiry_date: string;
    batch_size: number;
    number_of_cartons: number;
    packs_per_carton: number;
    quality_certificate_url?: string;
}

export const batchService = {
    // Get all batches
    getBatches: async () => {
        const response = await api.get<{ data: Batch[] }>('/ids/batches');
        return response.data.data;
    },

    // Get single batch
    getBatch: async (id: string) => {
        const response = await api.get<{ data: Batch }>(`/ids/batch/${id}`);
        return response.data.data;
    },

    // Create new batch
    createBatch: async (data: BatchCreateData) => {
        const response = await api.post<{ data: Batch }>('/ids/batch', data);
        return response.data.data;
    },

    // Download QR codes for a batch
    downloadQRCodes: async (batchId: string) => {
        const response = await api.get(`/ids/batch/${batchId}/qr-codes`, {
            responseType: 'blob'
        });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `batch-${batchId}-qr-codes.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
