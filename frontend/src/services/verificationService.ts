import api from './api';

export interface VerificationData {
    product_name?: string;
    manufacturer?: string;
    batch_id?: string;
    expiry_date?: string;
    verification_count?: number;
    pack_id?: string;
    first_scanned_at?: string;
    alert_type?: string;
    nafdac_reg?: string;
    product_code?: string;
    production_date?: string;
    first_verified_at?: string;
}

export interface VerificationResponse {
    success: boolean;
    verification_result: 'GENUINE' | 'COUNTERFEIT' | 'INVALID' | 'EXPIRED' | 'RECALLED' | 'SUSPICIOUS' | 'UNAUTHORIZED';
    message: string;
    data?: VerificationData & {
        error_type?: string;
        reason?: string;
        allowed_action?: string;
        contact_info?: string;
    };
}

export interface CartonVerificationResponse {
    success: boolean;
    verification_result: 'GENUINE' | 'INVALID' | 'EXPIRED' | 'RECALLED' | 'UNAUTHORIZED';
    message: string;
    data?: {
        carton_id: string;
        batch_id: string;
        product_name: string;
        product_code: string;
        packs_per_carton: number;
        production_date: string;
        expiry_date: string;
        current_holder: string;
        error_type?: string;
        reason?: string;
        allowed_action?: string;
        contact_info?: string;
    };
}

export const verificationService = {
    // Verify pack ID (One-time scan enforcement)
    // Works for both authenticated and anonymous users
    verifyPack: async (packId: string, location?: string, phoneNumber?: string) => {
        // remove any "PK-" prefix or spaces user might type
        const cleanId = packId.trim().toUpperCase();

        try {
            const response = await api.post<VerificationResponse>('/verify/pack', {
                pack_id: cleanId,
                verification_method: 'WEB',
                location: location,
                phone_number: phoneNumber
            });
            return response.data;
        } catch (error: any) {
            // Handle 404/400 explicitly if needed, but backend usually returns 200 with success=False
            // If backend throws generic error
            if (error.response && error.response.data) {
                return error.response.data as VerificationResponse;
            }
            throw error;
        }
    },

    // Verify carton ID (Supply chain tracking)
    // Requires authentication - JWT token automatically included by api.ts interceptor
    // Only authorized roles (MANUFACTURER, DISTRIBUTOR, RETAILER, PHARMACY, REGULATOR) can verify cartons
    verifyCarton: async (cartonId: string, location?: string, phoneNumber?: string) => {
        const cleanId = cartonId.trim().toUpperCase();

        try {
            const response = await api.post<CartonVerificationResponse>('/verify/carton', {
                carton_id: cleanId,
                verification_method: 'WEB',
                location: location,
                phone_number: phoneNumber
            });
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data as CartonVerificationResponse;
            }
            throw error;
        }
    },

    // Legacy endpoint for backward compatibility
    verifyProduct: async (packId: string) => {
        return await verificationService.verifyPack(packId);
    }
};
