import api from './api';

export interface Product {
    product_id: string;
    product_code: string;
    product_name: string;
    dosage?: string;
    form?: string;
    active_ingredients?: string[];
    therapeutic_category?: string;
    requires_prescription: boolean;
    description?: string;
    nafdac_registration_number?: string;
    brand_name?: string;
    country_of_origin?: string;
    manufacturer_id: string;
    is_active: boolean;
    created_at: string;
    // New fields from UniversalProductForm
    industry_type?: string;
    industry_data?: any;
    category_id?: string;
    model_number?: string;
    warranty_period_months?: number;
    risk_level?: string;
    verification_complexity?: string;
}

export interface ProductCreateData {
    product_code: string;
    product_name: string;
    dosage?: string;
    form?: string;
    active_ingredients?: string[];
    therapeutic_category?: string;
    requires_prescription?: boolean;
    description?: string;
    nafdac_registration_number?: string;
    brand_name?: string;
    country_of_origin?: string;
    // New fields from UniversalProductForm
    industry_type?: string;
    industry_data?: any;
    category_id?: string;
    model_number?: string;
    warranty_period_months?: number;
    risk_level?: string;
    verification_complexity?: string;
}
}

export const productService = {
    // Get all products (tries authenticated endpoint first, falls back to empty array if all fail)
    getProducts: async () => {
        try {
            // Try authenticated endpoint first
            const response = await api.get<Product[]>('/products');
            return response.data;
        } catch (error: any) {
            console.warn('Authenticated products endpoint failed:', error.response?.status);
            
            // Try public endpoint if authentication fails
            if (error.response?.status === 401 || error.response?.status === 403) {
                try {
                    const response = await api.get<Product[]>('/products/public');
                    return response.data;
                } catch (publicError: any) {
                    console.warn('Public products endpoint also failed:', publicError.response?.status);
                }
            }
            
            // If both endpoints fail, return empty array to prevent app crashes
            // This allows the app to continue functioning without products
            console.warn('All products endpoints failed, returning empty array');
            return [];
        }
    },

    // Get single product
    getProduct: async (id: string) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    // Create new product
    createProduct: async (data: ProductCreateData) => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    // Update existing product
    updateProduct: async (id: string, data: Partial<ProductCreateData>) => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    // Archive product
    archiveProduct: async (id: string) => {
        const response = await api.patch<Product>(`/products/${id}/archive`);
        return response.data;
    },

    // Reactivate product
    reactivateProduct: async (id: string) => {
        const response = await api.patch<Product>(`/products/${id}/reactivate`);
        return response.data;
    }
};
