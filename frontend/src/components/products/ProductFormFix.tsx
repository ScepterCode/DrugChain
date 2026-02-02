import React, { useState, useEffect } from 'react';
import { COUNTRIES } from '../../constants/countries';

interface ProductFormProps {
  onSubmit: (productData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    // Core required fields
    product_code: '',
    product_name: '',
    description: '',
    
    // Industry and categorization
    industry_type: 'Healthcare',
    category_id: '',
    
    // Product details
    brand_name: '',
    model_number: '',
    country_of_origin: '',
    warranty_period_months: '',
    risk_level: 'medium',
    verification_complexity: 'standard',
    
    // Healthcare-specific fields (direct fields, not in industry_data)
    dosage: '',
    form: '',
    therapeutic_category: '',
    requires_prescription: false,
    nafdac_registration_number: '',
    regulatory_registration: '',
    active_ingredients: [] as string[],
    
    // Industry data for non-healthcare products
    industry_data: {}
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_code.trim()) {
      newErrors.product_code = 'Product code is required';
    }
    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }
    if (!formData.brand_name.trim()) {
      newErrors.brand_name = 'Brand name is required';
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
      // Clean up the data before submission
      const submitData = { ...formData };
      
      // Convert warranty period to number if provided
      if (submitData.warranty_period_months && submitData.warranty_period_months !== '') {
        (submitData as any).warranty_period_months = parseInt(submitData.warranty_period_months);
      } else {
        delete (submitData as any).warranty_period_months;
      }
      
      // Ensure industry_data is an object
      if (!submitData.industry_data || typeof submitData.industry_data !== 'object') {
        submitData.industry_data = {};
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Product Information */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Basic Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Core product details and identification.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Product Code *
                </label>
                <input
                  type="text"
                  value={formData.product_code}
                  onChange={(e) => handleInputChange('product_code', e.target.value)}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.product_code ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter unique product code"
                />
                {errors.product_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_code}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => handleInputChange('product_name', e.target.value)}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.product_name ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter product name"
                />
                {errors.product_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_name}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => handleInputChange('brand_name', e.target.value)}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.brand_name ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter brand name"
                />
                {errors.brand_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.brand_name}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Industry Type
                </label>
                <select
                  value={formData.industry_type}
                  onChange={(e) => handleInputChange('industry_type', e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Healthcare">Healthcare</option>
                  <option value="Technology">Technology</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Consumer Goods">Consumer Goods</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Country of Origin
                </label>
                <select
                  value={formData.country_of_origin}
                  onChange={(e) => handleInputChange('country_of_origin', e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Model Number
                </label>
                <input
                  type="text"
                  value={formData.model_number}
                  onChange={(e) => handleInputChange('model_number', e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter model number"
                />
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Healthcare-specific fields */}
      {formData.industry_type === 'Healthcare' && (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Healthcare Details
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Pharmaceutical and medical device specific information.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => handleInputChange('dosage', e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Form
                  </label>
                  <input
                    type="text"
                    value={formData.form}
                    onChange={(e) => handleInputChange('form', e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., Tablet, Capsule, Syrup"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Therapeutic Category
                  </label>
                  <input
                    type="text"
                    value={formData.therapeutic_category}
                    onChange={(e) => handleInputChange('therapeutic_category', e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., Antibiotic, Analgesic"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    NAFDAC Registration
                  </label>
                  <input
                    type="text"
                    value={formData.nafdac_registration_number}
                    onChange={(e) => handleInputChange('nafdac_registration_number', e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="NAFDAC registration number"
                  />
                </div>

                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={formData.requires_prescription}
                        onChange={(e) => handleInputChange('requires_prescription', e.target.checked)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700">
                        Requires Prescription
                      </label>
                      <p className="text-gray-500">
                        Check if this product requires a prescription to purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;