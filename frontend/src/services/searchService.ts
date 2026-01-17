import api from './api';

export interface ProductSearchResult {
    product_id: string;
    product_name: string;
    product_code: string;
    manufacturer_name: string;
    manufacturer_id: string;
    dosage: string;
    form: string;
    therapeutic_category: string;
    active_ingredients: string[];
    nafdac_registration_number: string;
    batch_count: number;
    created_at: string;
}

export interface BatchSearchResult {
    batch_id: string;
    product_id: string;
    product_name: string;
    manufacturer_name: string;
    production_date: string;
    expiry_date: string;
    batch_size: number;
    status: string;
    verification_count: number;
    created_at: string;
}

export interface PackSearchResult {
    pack_id: string;
    batch_id: string;
    carton_id: string;
    product_name: string;
    status: string;
    verification_count: number;
    last_verification: string | null;
    created_at: string;
}

export interface ManufacturerSearchResult {
    organization_id: string;
    organization_name: string;
    registration_number: string;
    nafdac_license_number: string;
    license_status: string;
    license_expiry_date: string | null;
    product_count: number;
    batch_count: number;
    created_at: string;
}

export interface UnifiedSearchResult {
    id: string;
    type: 'product' | 'batch' | 'pack' | 'manufacturer';
    title: string;
    description: string;
    metadata: Record<string, any>;
    created_at: string;
}

export interface SearchResponse<T> {
    data: {
        products?: T[];
        batches?: T[];
        packs?: T[];
        manufacturers?: T[];
        total_count: number;
        limit: number;
        offset: number;
    };
}

class SearchService {
    // Search products (Regulator only)
    async searchProducts(
        query: string,
        manufacturerId?: string,
        category?: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<{ products: ProductSearchResult[]; totalCount: number }> {
        try {
            const params = new URLSearchParams({ q: query, limit: limit.toString(), offset: offset.toString() });
            if (manufacturerId) params.append('manufacturer_id', manufacturerId);
            if (category) params.append('category', category);

            const response = await api.get<SearchResponse<ProductSearchResult>>(`/search/products?${params}`);
            return {
                products: response.data.data.products || [],
                totalCount: response.data.data.total_count
            };
        } catch (error) {
            console.error('Failed to search products:', error);
            return { products: [], totalCount: 0 };
        }
    }

    // Search batches
    async searchBatches(
        query?: string,
        productId?: string,
        manufacturerId?: string,
        status?: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<{ batches: BatchSearchResult[]; totalCount: number }> {
        try {
            const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
            if (query) params.append('q', query);
            if (productId) params.append('product_id', productId);
            if (manufacturerId) params.append('manufacturer_id', manufacturerId);
            if (status) params.append('status', status);

            const response = await api.get<SearchResponse<BatchSearchResult>>(`/search/batches?${params}`);
            return {
                batches: response.data.data.batches || [],
                totalCount: response.data.data.total_count
            };
        } catch (error) {
            console.error('Failed to search batches:', error);
            return { batches: [], totalCount: 0 };
        }
    }

    // Search packs (Regulator only)
    async searchPacks(
        packId?: string,
        batchId?: string,
        status?: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<{ packs: PackSearchResult[]; totalCount: number }> {
        try {
            const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
            if (packId) params.append('pack_id', packId);
            if (batchId) params.append('batch_id', batchId);
            if (status) params.append('status', status);

            const response = await api.get<SearchResponse<PackSearchResult>>(`/search/packs?${params}`);
            return {
                packs: response.data.data.packs || [],
                totalCount: response.data.data.total_count
            };
        } catch (error) {
            console.error('Failed to search packs:', error);
            return { packs: [], totalCount: 0 };
        }
    }

    // Search manufacturers (Regulator only)
    async searchManufacturers(
        query?: string,
        licenseStatus?: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<{ manufacturers: ManufacturerSearchResult[]; totalCount: number }> {
        try {
            const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
            if (query) params.append('q', query);
            if (licenseStatus) params.append('license_status', licenseStatus);

            const response = await api.get<SearchResponse<ManufacturerSearchResult>>(`/search/manufacturers?${params}`);
            return {
                manufacturers: response.data.data.manufacturers || [],
                totalCount: response.data.data.total_count
            };
        } catch (error) {
            console.error('Failed to search manufacturers:', error);
            return { manufacturers: [], totalCount: 0 };
        }
    }

    // Unified search across all types
    async unifiedSearch(
        query: string,
        searchType: 'all' | 'product' | 'batch' | 'pack' | 'manufacturer' = 'all',
        limit: number = 20
    ): Promise<UnifiedSearchResult[]> {
        const results: UnifiedSearchResult[] = [];

        try {
            // Run parallel searches based on type
            const promises: Promise<void>[] = [];

            if (searchType === 'all' || searchType === 'product') {
                promises.push(
                    this.searchProducts(query, undefined, undefined, limit).then(({ products }) => {
                        products.forEach(p => {
                            results.push({
                                id: p.product_id,
                                type: 'product',
                                title: p.product_name,
                                description: `${p.product_code} - ${p.therapeutic_category || 'General'} by ${p.manufacturer_name}`,
                                metadata: {
                                    manufacturer: p.manufacturer_name,
                                    dosage: p.dosage,
                                    form: p.form,
                                    batch_count: p.batch_count,
                                    nafdac: p.nafdac_registration_number
                                },
                                created_at: p.created_at
                            });
                        });
                    })
                );
            }

            if (searchType === 'all' || searchType === 'batch') {
                promises.push(
                    this.searchBatches(query, undefined, undefined, undefined, limit).then(({ batches }) => {
                        batches.forEach(b => {
                            results.push({
                                id: b.batch_id,
                                type: 'batch',
                                title: `Batch: ${b.batch_id}`,
                                description: `${b.product_name} - ${b.batch_size} units`,
                                metadata: {
                                    product: b.product_name,
                                    manufacturer: b.manufacturer_name,
                                    status: b.status,
                                    production_date: b.production_date,
                                    expiry_date: b.expiry_date,
                                    verification_count: b.verification_count
                                },
                                created_at: b.created_at
                            });
                        });
                    })
                );
            }

            if (searchType === 'all' || searchType === 'pack') {
                promises.push(
                    this.searchPacks(query, undefined, undefined, limit).then(({ packs }) => {
                        packs.forEach(p => {
                            results.push({
                                id: p.pack_id,
                                type: 'pack',
                                title: `Pack: ${p.pack_id}`,
                                description: `${p.product_name} - ${p.status}`,
                                metadata: {
                                    batch_id: p.batch_id,
                                    carton_id: p.carton_id,
                                    status: p.status,
                                    verification_count: p.verification_count,
                                    last_verification: p.last_verification
                                },
                                created_at: p.created_at
                            });
                        });
                    })
                );
            }

            if (searchType === 'all' || searchType === 'manufacturer') {
                promises.push(
                    this.searchManufacturers(query, undefined, limit).then(({ manufacturers }) => {
                        manufacturers.forEach(m => {
                            results.push({
                                id: m.organization_id,
                                type: 'manufacturer',
                                title: m.organization_name,
                                description: `License: ${m.nafdac_license_number} - ${m.license_status}`,
                                metadata: {
                                    license: m.nafdac_license_number,
                                    license_status: m.license_status,
                                    registration: m.registration_number,
                                    product_count: m.product_count,
                                    batch_count: m.batch_count
                                },
                                created_at: m.created_at || new Date().toISOString()
                            });
                        });
                    })
                );
            }

            await Promise.allSettled(promises);

            // Sort by created_at descending
            results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return results.slice(0, limit);
        } catch (error) {
            console.error('Unified search failed:', error);
            return [];
        }
    }
}

export const searchService = new SearchService();
