import React from 'react';
import { industryService } from '../../services/industryService';

interface VerificationData {
  verification_result: string;
  data: {
    product: {
      product_id: string;
      product_name: string;
      brand_name: string;
      model_number?: string;
      industry_type: string;
      category: {
        category_name: string;
        industry_type: string;
      };
      attributes: Array<{
        attribute_name: string;
        attribute_value: string;
        attribute_type: string;
      }>;
      certifications: Array<{
        certification_name: string;
        issuing_authority: string;
        status: string;
      }>;
    };
    pack: {
      pack_id: string;
      batch_number: string;
      manufacturing_date: string;
      expiry_date?: string;
    };
    blockchain_hash: string;
  };
  enhanced_verification?: any;
  industry_specific_data?: any;
}

interface IndustryVerificationResultProps {
  result: VerificationData;
}

const IndustryVerificationResult: React.FC<IndustryVerificationResultProps> = ({ result }) => {
  const { product } = result.data;
  const industryFeatures = industryService.getVerificationFeatures(product.industry_type);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AUTHENTIC':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'COUNTERFEIT':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'SUSPICIOUS':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIndustryIcon = (industryType: string) => {
    switch (industryType) {
      case 'Technology':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'Fashion':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
      case 'Consumer Goods':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5-5m0 0L4 3H2m16 16a2 2 0 11-4 0 2 2 0 014 0zm-10 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Automotive':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'Personal Care':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
          </svg>
        );
    }
  };

  const renderIndustrySpecificInfo = () => {
    if (!result.industry_specific_data) return null;

    switch (product.industry_type) {
      case 'Technology':
        return (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Electronics Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {result.industry_specific_data.processor && (
                <div>
                  <span className="text-blue-700 font-medium">Processor:</span>
                  <span className="ml-2 text-blue-600">{result.industry_specific_data.processor}</span>
                </div>
              )}
              {result.industry_specific_data.memory_gb && (
                <div>
                  <span className="text-blue-700 font-medium">Memory:</span>
                  <span className="ml-2 text-blue-600">{result.industry_specific_data.memory_gb}GB</span>
                </div>
              )}
              {result.industry_specific_data.warranty_status && (
                <div className="col-span-2">
                  <span className="text-blue-700 font-medium">Warranty Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    result.industry_specific_data.warranty_status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.industry_specific_data.warranty_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'Fashion':
        return (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-900 mb-2">Luxury Item Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {result.industry_specific_data.material && (
                <div>
                  <span className="text-purple-700 font-medium">Material:</span>
                  <span className="ml-2 text-purple-600">{result.industry_specific_data.material}</span>
                </div>
              )}
              {result.industry_specific_data.limited_edition && (
                <div>
                  <span className="text-purple-700 font-medium">Edition:</span>
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    Limited Edition
                  </span>
                </div>
              )}
              {result.industry_specific_data.authenticity_score && (
                <div className="col-span-2">
                  <span className="text-purple-700 font-medium">Authenticity Score:</span>
                  <div className="ml-2 w-full bg-purple-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${result.industry_specific_data.authenticity_score}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-purple-600 ml-2">
                    {result.industry_specific_data.authenticity_score}%
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'Consumer Goods':
        return (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Food Safety Information</h4>
            <div className="space-y-2 text-sm">
              {result.industry_specific_data.allergens && (
                <div>
                  <span className="text-green-700 font-medium">Allergens:</span>
                  <div className="ml-2 flex flex-wrap gap-1 mt-1">
                    {result.industry_specific_data.allergens.map((allergen: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.industry_specific_data.organic_certified && (
                <div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    Organic Certified
                  </span>
                </div>
              )}
              {result.industry_specific_data.expiry_status && (
                <div>
                  <span className="text-green-700 font-medium">Expiry Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    result.industry_specific_data.expiry_status === 'fresh' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.industry_specific_data.expiry_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'Automotive':
        return (
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-900 mb-2">Automotive Part Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {result.industry_specific_data.safety_critical && (
                <div className="col-span-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                    ⚠️ Safety Critical Component
                  </span>
                </div>
              )}
              {result.industry_specific_data.oem_part_number && (
                <div>
                  <span className="text-red-700 font-medium">OEM Part #:</span>
                  <span className="ml-2 text-red-600">{result.industry_specific_data.oem_part_number}</span>
                </div>
              )}
              {result.industry_specific_data.compatibility_status && (
                <div>
                  <span className="text-red-700 font-medium">Compatibility:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    result.industry_specific_data.compatibility_status === 'compatible' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.industry_specific_data.compatibility_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'Personal Care':
        return (
          <div className="bg-pink-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-pink-900 mb-2">Cosmetics Information</h4>
            <div className="space-y-2 text-sm">
              {result.industry_specific_data.skin_compatibility && (
                <div>
                  <span className="text-pink-700 font-medium">Skin Compatibility:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    result.industry_specific_data.skin_compatibility === 'suitable' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.industry_specific_data.skin_compatibility}
                  </span>
                </div>
              )}
              {result.industry_specific_data.cruelty_free && (
                <div>
                  <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">
                    Cruelty Free
                  </span>
                </div>
              )}
              {result.industry_specific_data.natural_percentage && (
                <div>
                  <span className="text-pink-700 font-medium">Natural Content:</span>
                  <span className="ml-2 text-pink-600">{result.industry_specific_data.natural_percentage}%</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-l-4 ${getStatusColor(result.verification_result)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getIndustryIcon(product.industry_type)}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium">
                {product.product_name}
              </h3>
              <p className="text-sm opacity-75">
                {product.brand_name} • {product.category.category_name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.verification_result)}`}>
              {result.verification_result === 'AUTHENTIC' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {result.verification_result}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-6">
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Product Information</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Product ID:</dt>
                <dd className="text-gray-900 font-mono">{product.product_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Brand:</dt>
                <dd className="text-gray-900">{product.brand_name}</dd>
              </div>
              {product.model_number && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Model:</dt>
                  <dd className="text-gray-900">{product.model_number}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Industry:</dt>
                <dd className="text-gray-900">{product.industry_type}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Pack Information</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Pack ID:</dt>
                <dd className="text-gray-900 font-mono">{result.data.pack.pack_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Batch:</dt>
                <dd className="text-gray-900">{result.data.pack.batch_number}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Manufactured:</dt>
                <dd className="text-gray-900">
                  {new Date(result.data.pack.manufacturing_date).toLocaleDateString()}
                </dd>
              </div>
              {result.data.pack.expiry_date && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Expires:</dt>
                  <dd className="text-gray-900">
                    {new Date(result.data.pack.expiry_date).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Industry-Specific Information */}
        {renderIndustrySpecificInfo()}

        {/* Available Features */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {industryFeatures.map((feature, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        {product.certifications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Certifications</h4>
            <div className="space-y-2">
              {product.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{cert.certification_name}</div>
                    <div className="text-xs text-gray-500">{cert.issuing_authority}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    cert.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blockchain Verification */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Blockchain Verified</span>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {result.data.blockchain_hash.substring(0, 16)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryVerificationResult;