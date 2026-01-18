import React, { useState, useEffect } from 'react';
import { industryService, ProductCategory, IndustrySpecificData } from '../../services/industryService';

interface UniversalProductFormProps {
  onSubmit: (productData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const UniversalProductForm: React.FC<UniversalProductFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    // Base product fields
    product_code: '',
    product_name: '',
    description: '',
    category_id: '',
    industry_type: 'Healthcare',
    brand_name: '',
    model_number: '',
    country_of_origin: '',
    warranty_period_months: '',
    risk_level: 'medium',
    verification_complexity: 'standard',

    // Industry-specific data (pharmaceutical fields moved here)
    industry_data: {} as IndustrySpecificData,

    // Attributes and certifications
    attributes: [],
    certifications: []
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadIndustries();
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, []);

  useEffect(() => {
    if (formData.industry_type) {
      loadCategories(formData.industry_type);
    }
  }, [formData.industry_type]);

  const loadIndustries = async () => {
    try {
      const industriesData = await industryService.getIndustries();
      setIndustries(industriesData);
    } catch (error) {
      console.error('Failed to load industries:', error);
    }
  };

  const loadCategories = async (industryType: string) => {
    try {
      const categoriesData = await industryService.getCategoriesByIndustry(industryType);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIndustryDataChange = (field: string, value: any) => {
    const industryKey = getIndustryDataKey(formData.industry_type);
    setFormData(prev => ({
      ...prev,
      industry_data: {
        ...prev.industry_data,
        [industryKey]: {
          ...prev.industry_data[industryKey as keyof IndustrySpecificData],
          [field]: value
        }
      }
    }));
  };

  const getIndustryDataKey = (industryType: string): keyof IndustrySpecificData => {
    switch (industryType) {
      case 'Technology': return 'electronics';
      case 'Fashion': return 'luxury';
      case 'Consumer Goods': return 'food';
      case 'Automotive': return 'automotive';
      case 'Personal Care': return 'cosmetics';
      default: return 'electronics';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_code.trim()) {
      newErrors.product_code = 'Product code is required';
    }
    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    if (!formData.brand_name.trim()) {
      newErrors.brand_name = 'Brand name is required';
    }

    // Industry-specific validation
    const industryKey = getIndustryDataKey(formData.industry_type);
    const industryData = formData.industry_data[industryKey];
    if (industryData) {
      const validation = industryService.validateIndustryData(formData.industry_type, formData.industry_data);
      if (!validation.valid) {
        validation.errors.forEach((error, index) => {
          newErrors[`industry_${index}`] = error;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBaseFields = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Product Code *
        </label>
        <input
          type="text"
          value={formData.product_code}
          onChange={(e) => handleInputChange('product_code', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors.product_code ? 'border-red-300' : ''
            }`}
          placeholder="Enter unique product code"
        />
        {errors.product_code && (
          <p className="mt-1 text-sm text-red-600">{errors.product_code}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Product Name *
        </label>
        <input
          type="text"
          value={formData.product_name}
          onChange={(e) => handleInputChange('product_name', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors.product_name ? 'border-red-300' : ''
            }`}
          placeholder="Enter product name"
        />
        {errors.product_name && (
          <p className="mt-1 text-sm text-red-600">{errors.product_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Industry Type *
        </label>
        <select
          value={formData.industry_type}
          onChange={(e) => handleInputChange('industry_type', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <select
          value={formData.category_id}
          onChange={(e) => handleInputChange('category_id', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors.category_id ? 'border-red-300' : ''
            }`}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Brand Name *
        </label>
        <input
          type="text"
          value={formData.brand_name}
          onChange={(e) => handleInputChange('brand_name', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors.brand_name ? 'border-red-300' : ''
            }`}
          placeholder="Enter brand name"
        />
        {errors.brand_name && (
          <p className="mt-1 text-sm text-red-600">{errors.brand_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Model Number
        </label>
        <input
          type="text"
          value={formData.model_number}
          onChange={(e) => handleInputChange('model_number', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter model number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Country of Origin
        </label>
        <input
          type="text"
          value={formData.country_of_origin}
          onChange={(e) => handleInputChange('country_of_origin', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter country of origin"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Warranty Period (Months)
        </label>
        <input
          type="number"
          value={formData.warranty_period_months}
          onChange={(e) => handleInputChange('warranty_period_months', parseInt(e.target.value) || '')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter warranty period in months"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter product description"
        />
      </div>
    </div>
  );

  const renderIndustrySpecificFields = () => {
    const industryKey = getIndustryDataKey(formData.industry_type);
    const industryData = formData.industry_data[industryKey] || {};

    switch (formData.industry_type) {
      case 'Technology':
        return (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Processor</label>
              <input
                type="text"
                value={(industryData as any).processor || ''}
                onChange={(e) => handleIndustryDataChange('processor', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., Intel Core i7"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Memory (GB)</label>
              <input
                type="number"
                value={(industryData as any).memory_gb || ''}
                onChange={(e) => handleIndustryDataChange('memory_gb', parseInt(e.target.value) || '')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., 16"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Storage (GB)</label>
              <input
                type="number"
                value={(industryData as any).storage_gb || ''}
                onChange={(e) => handleIndustryDataChange('storage_gb', parseInt(e.target.value) || '')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., 512"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Operating System</label>
              <input
                type="text"
                value={(industryData as any).operating_system || ''}
                onChange={(e) => handleIndustryDataChange('operating_system', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., Windows 11"
              />
            </div>
          </div>
        );

      case 'Fashion':
        return (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Material</label>
              <input
                type="text"
                value={(industryData as any).material || ''}
                onChange={(e) => handleIndustryDataChange('material', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., Genuine Leather"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Designer</label>
              <input
                type="text"
                value={(industryData as any).designer || ''}
                onChange={(e) => handleIndustryDataChange('designer', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Designer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Collection</label>
              <input
                type="text"
                value={(industryData as any).collection_name || ''}
                onChange={(e) => handleIndustryDataChange('collection_name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Collection name"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={(industryData as any).limited_edition || false}
                onChange={(e) => handleIndustryDataChange('limited_edition', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Limited Edition</label>
            </div>
          </div>
        );

      case 'Healthcare':
        return (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dosage</label>
              <input
                type="text"
                value={(industryData as any).dosage || ''}
                onChange={(e) => handleIndustryDataChange('dosage', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Form</label>
              <select
                value={(industryData as any).form || ''}
                onChange={(e) => handleIndustryDataChange('form', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select form</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Cream">Cream</option>
                <option value="Ointment">Ointment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Therapeutic Category</label>
              <input
                type="text"
                value={(industryData as any).therapeutic_category || ''}
                onChange={(e) => handleIndustryDataChange('therapeutic_category', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., Antibiotic"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={(industryData as any).requires_prescription || false}
                onChange={(e) => handleIndustryDataChange('requires_prescription', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Requires Prescription</label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Base Product Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        {renderBaseFields()}
      </div>

      {/* Industry-Specific Fields */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {formData.industry_type} Specifications
        </h3>
        {renderIndustrySpecificFields()}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default UniversalProductForm;