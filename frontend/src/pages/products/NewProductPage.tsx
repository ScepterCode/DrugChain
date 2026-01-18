import React from 'react';
import UniversalProductForm from '../../components/products/UniversalProductForm';
import { productService } from '../../services/productService';
import { useNavigate } from 'react-router-dom';

const NewProductPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = async (productData: any) => {
        try {
            await productService.createProduct(productData);
            navigate('/portal/products');
        } catch (error) {
            console.error('Failed to create product:', error);
            // Error handling is done within UniversalProductForm
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Register New Product
                    </h2>
                </div>
            </div>

            <UniversalProductForm onSubmit={handleSubmit} />
        </div>
    );
};

export default NewProductPage;
