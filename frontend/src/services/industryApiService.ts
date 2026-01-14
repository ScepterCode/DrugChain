import api from './api';

export interface CompatibilityResult {
  compatible: boolean;
  compatibility_score: number;
  issues: string[];
  recommendations: string[];
}

export interface AuthenticityCard {
  certificate_id: string;
  product_id: string;
  pack_id: string;
  authenticity_verified: boolean;
  verification_date: string;
  verifier: string;
  product_details: {
    brand: string;
    model: string;
    material?: string;
    limited_edition?: boolean;
  };
  blockchain_hash: string;
}

export interface NutritionalInfo {
  nutritional_info: Record<string, any>;
  allergens: string[];
  dietary_restrictions: string[];
  organic_certified: boolean;
  fair_trade_certified: boolean;
}

export interface VehicleCompatibility {
  compatible: boolean;
  part_category: string;
  oem_part_number: string;
  safety_critical: boolean;
  installation_complexity: string;
}

export interface IngredientAnalysis {
  ingredients: Record<string, any>;
  skin_type_suitability: string[];
  safety_warnings: string;
  dermatologically_tested: boolean;
  cruelty_free: boolean;
  natural_percentage: number;
  suitable_for_skin_type?: boolean;
}

class IndustryApiService {
  // Electronics API
  async checkElectronicsCompatibility(productId: string, targetProductId: string): Promise<CompatibilityResult> {
    try {
      const response = await api.post('/electronics/compatibility-check', {
        product_id: productId,
        target_product_id: targetProductId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check electronics compatibility:', error);
      throw error;
    }
  }

  async getWarrantyStatus(productId: string, serialNumber: string): Promise<any> {
    try {
      const response = await api.get(`/electronics/${productId}/warranty-status`, {
        params: { serial_number: serialNumber }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get warranty status:', error);
      throw error;
    }
  }

  // Luxury Goods API
  async generateAuthenticityCard(productId: string, packId: string): Promise<AuthenticityCard> {
    try {
      const response = await api.post('/luxury/authenticity-certificate', {
        product_id: productId,
        pack_id: packId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate authenticity card:', error);
      throw error;
    }
  }

  async estimateResaleValue(productId: string, condition: string, marketLocation: string = 'US'): Promise<any> {
    try {
      const response = await api.get(`/luxury/${productId}/resale-value`, {
        params: { condition, market_location: marketLocation }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to estimate resale value:', error);
      throw error;
    }
  }

  // Food & Beverage API
  async getNutritionalInfo(productId: string): Promise<NutritionalInfo> {
    try {
      const response = await api.get(`/food/${productId}/nutritional-info`);
      return response.data;
    } catch (error) {
      console.error('Failed to get nutritional info:', error);
      throw error;
    }
  }

  async checkFoodRecalls(packId: string): Promise<any> {
    try {
      const response = await api.post('/food/recall-check', {
        pack_id: packId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check food recalls:', error);
      throw error;
    }
  }

  // Automotive API
  async getVehicleCompatibility(
    productId: string, 
    vehicleMake: string, 
    vehicleModel: string, 
    vehicleYear: number
  ): Promise<VehicleCompatibility> {
    try {
      const response = await api.get(`/automotive/${productId}/compatibility`, {
        params: {
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get vehicle compatibility:', error);
      throw error;
    }
  }

  async getAutomotiveRecalls(productId?: string, oemPartNumber?: string): Promise<any> {
    try {
      const params: Record<string, any> = {};
      if (productId) params.product_id = productId;
      if (oemPartNumber) params.oem_part_number = oemPartNumber;

      const response = await api.get('/automotive/recalls', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get automotive recalls:', error);
      throw error;
    }
  }

  // Cosmetics API
  async getIngredientAnalysis(productId: string, skinType?: string): Promise<IngredientAnalysis> {
    try {
      const params: Record<string, any> = {};
      if (skinType) params.skin_type = skinType;

      const response = await api.get(`/cosmetics/${productId}/ingredients`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get ingredient analysis:', error);
      throw error;
    }
  }

  // Enhanced Verification API
  async performEnhancedVerification(
    packId: string, 
    verificationType: string = 'standard',
    additionalData?: Record<string, any>
  ): Promise<any> {
    try {
      const response = await api.post('/verify/enhanced', {
        pack_id: packId,
        verification_type: verificationType,
        additional_data: additionalData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform enhanced verification:', error);
      throw error;
    }
  }

  // Industry-specific product creation
  async createElectronicsProduct(productData: any): Promise<any> {
    try {
      const response = await api.post('/electronics/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create electronics product:', error);
      throw error;
    }
  }

  async createLuxuryProduct(productData: any): Promise<any> {
    try {
      const response = await api.post('/luxury/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create luxury product:', error);
      throw error;
    }
  }

  async createFoodProduct(productData: any): Promise<any> {
    try {
      const response = await api.post('/food/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create food product:', error);
      throw error;
    }
  }

  async createAutomotiveProduct(productData: any): Promise<any> {
    try {
      const response = await api.post('/automotive/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create automotive product:', error);
      throw error;
    }
  }

  async createCosmeticsProduct(productData: any): Promise<any> {
    try {
      const response = await api.post('/cosmetics/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create cosmetics product:', error);
      throw error;
    }
  }
}

export const industryApiService = new IndustryApiService();
export default industryApiService;