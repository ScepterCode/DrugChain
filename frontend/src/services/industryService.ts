import api from './api';

export interface Industry {
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
}

export interface ProductCategory {
  category_id: string;
  category_name: string;
  category_code: string;
  parent_category_id?: string;
  industry_type: string;
  description?: string;
  regulatory_requirements: Record<string, any>;
  verification_rules: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndustrySpecificData {
  electronics?: {
    processor?: string;
    memory_gb?: number;
    storage_gb?: number;
    display_size?: number;
    battery_capacity?: number;
    operating_system?: string;
    connectivity?: Record<string, any>;
    dimensions?: Record<string, any>;
    compatibility_matrix?: Record<string, any>;
  };
  luxury?: {
    material?: string;
    craftsmanship_level?: string;
    limited_edition?: boolean;
    edition_number?: number;
    total_edition_size?: number;
    designer?: string;
    collection_name?: string;
    authentication_features?: Record<string, any>;
    estimated_value?: number;
  };
  food?: {
    nutritional_info?: Record<string, any>;
    allergens?: string[];
    dietary_restrictions?: string[];
    origin_location?: string;
    harvest_date?: string;
    processing_date?: string;
    storage_requirements?: Record<string, any>;
    shelf_life_days?: number;
    organic_certified?: boolean;
    fair_trade_certified?: boolean;
  };
  automotive?: {
    part_category?: string;
    oem_part_number?: string;
    compatible_vehicles?: Record<string, any>;
    safety_critical?: boolean;
    installation_complexity?: string;
    warranty_terms?: Record<string, any>;
    recall_history?: Record<string, any>;
    performance_specs?: Record<string, any>;
  };
  cosmetics?: {
    ingredients?: Record<string, any>;
    skin_type_suitability?: string[];
    usage_instructions?: string;
    safety_warnings?: string;
    dermatologically_tested?: boolean;
    cruelty_free?: boolean;
    natural_percentage?: number;
    spf_rating?: number;
    color_shade?: string;
  };
}

// Industry definitions
export const INDUSTRIES: Industry[] = [
  {
    name: 'Healthcare',
    code: 'HEALTHCARE',
    description: 'Pharmaceutical products and medical devices',
    icon: 'medical',
    color: 'blue'
  },
  {
    name: 'Technology',
    code: 'TECHNOLOGY',
    description: 'Electronic devices and components',
    icon: 'computer',
    color: 'indigo'
  },
  {
    name: 'Fashion',
    code: 'FASHION',
    description: 'High-end fashion and luxury items',
    icon: 'sparkles',
    color: 'purple'
  },
  {
    name: 'Consumer Goods',
    code: 'CONSUMER_GOODS',
    description: 'Food products and beverages',
    icon: 'shopping-cart',
    color: 'green'
  },
  {
    name: 'Automotive',
    code: 'AUTOMOTIVE',
    description: 'Vehicle parts and accessories',
    icon: 'truck',
    color: 'red'
  },
  {
    name: 'Personal Care',
    code: 'PERSONAL_CARE',
    description: 'Beauty and personal care products',
    icon: 'heart',
    color: 'pink'
  }
];

class IndustryService {
  // Get all available industries
  async getIndustries(): Promise<string[]> {
    try {
      const response = await api.get('/categories/industries');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch industries:', error);
      return INDUSTRIES.map(i => i.name);
    }
  }

  // Get categories for a specific industry
  async getCategoriesByIndustry(industryType: string, includeSubcategories: boolean = true): Promise<ProductCategory[]> {
    try {
      const response = await api.get(`/categories/industry/${industryType}`, {
        params: { include_subcategories: includeSubcategories }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch categories for industry ${industryType}:`, error);
      return [];
    }
  }

  // Get all categories with optional filtering
  async getCategories(industryType?: string, parentId?: string): Promise<ProductCategory[]> {
    try {
      const params: Record<string, any> = {};
      if (industryType) params.industry_type = industryType;
      if (parentId) params.parent_id = parentId;

      const response = await api.get('/categories/', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  // Get industry information by code
  getIndustryInfo(industryCode: string): Industry | undefined {
    return INDUSTRIES.find(industry => industry.code === industryCode);
  }

  // Get industry-specific form fields
  getIndustryFormFields(industryType: string): string[] {
    switch (industryType) {
      case 'Technology':
        return ['processor', 'memory_gb', 'storage_gb', 'display_size', 'battery_capacity', 'operating_system'];
      case 'Fashion':
        return ['material', 'craftsmanship_level', 'limited_edition', 'designer', 'collection_name'];
      case 'Consumer Goods':
        return ['nutritional_info', 'allergens', 'dietary_restrictions', 'origin_location', 'shelf_life_days'];
      case 'Automotive':
        return ['part_category', 'oem_part_number', 'compatible_vehicles', 'safety_critical', 'installation_complexity'];
      case 'Personal Care':
        return ['ingredients', 'skin_type_suitability', 'usage_instructions', 'dermatologically_tested', 'cruelty_free'];
      case 'Healthcare':
      default:
        return ['dosage', 'form', 'active_ingredients', 'therapeutic_category', 'requires_prescription'];
    }
  }

  // Get industry-specific verification features
  getVerificationFeatures(industryType: string): string[] {
    switch (industryType) {
      case 'Technology':
        return ['Compatibility Check', 'Warranty Status', 'Technical Specifications', 'Recall Alerts'];
      case 'Fashion':
        return ['Authenticity Certificate', 'Provenance Tracking', 'Resale Value', 'Limited Edition Verification'];
      case 'Consumer Goods':
        return ['Origin Tracking', 'Expiration Monitoring', 'Allergen Alerts', 'Organic Certification'];
      case 'Automotive':
        return ['Safety Verification', 'Compatibility Check', 'Recall Alerts', 'Installation Guides'];
      case 'Personal Care':
        return ['Ingredient Analysis', 'Skin Compatibility', 'Expiration Tracking', 'Safety Warnings'];
      case 'Healthcare':
      default:
        return ['Drug Verification', 'Prescription Check', 'Expiration Alerts', 'Regulatory Compliance'];
    }
  }

  // Validate industry-specific data
  validateIndustryData(industryType: string, data: IndustrySpecificData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (industryType) {
      case 'Technology':
        if (data.electronics) {
          if (data.electronics.memory_gb && data.electronics.memory_gb < 0) {
            errors.push('Memory GB must be positive');
          }
          if (data.electronics.storage_gb && data.electronics.storage_gb < 0) {
            errors.push('Storage GB must be positive');
          }
        }
        break;
      case 'Fashion':
        if (data.luxury) {
          if (data.luxury.limited_edition && !data.luxury.total_edition_size) {
            errors.push('Total edition size required for limited edition items');
          }
          if (data.luxury.edition_number && data.luxury.total_edition_size && 
              data.luxury.edition_number > data.luxury.total_edition_size) {
            errors.push('Edition number cannot exceed total edition size');
          }
        }
        break;
      case 'Consumer Goods':
        if (data.food) {
          if (data.food.shelf_life_days && data.food.shelf_life_days < 0) {
            errors.push('Shelf life must be positive');
          }
        }
        break;
      case 'Automotive':
        if (data.automotive?.safety_critical && !data.automotive.recall_history) {
          errors.push('Recall history required for safety-critical parts');
        }
        break;
      case 'Personal Care':
        if (data.cosmetics) {
          if (data.cosmetics.spf_rating && (data.cosmetics.spf_rating < 0 || data.cosmetics.spf_rating > 100)) {
            errors.push('SPF rating must be between 0 and 100');
          }
          if (data.cosmetics.natural_percentage && 
              (data.cosmetics.natural_percentage < 0 || data.cosmetics.natural_percentage > 100)) {
            errors.push('Natural percentage must be between 0 and 100');
          }
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }
}

export const industryService = new IndustryService();
export default industryService;