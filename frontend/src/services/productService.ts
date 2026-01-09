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
    manufacturer_id: string;
    is_active: boolean;
    created_at: string;
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
}

export const productService = {
    // Get all products (optionally filter by manufacturer via backend logic)
    getProducts: async () => {
        const response = await api.get<Product[]>('/products');
        return response.data;
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
    }
};
