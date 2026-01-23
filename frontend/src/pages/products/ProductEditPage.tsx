import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, Product } from '../../services/productService';
import UniversalProductForm from '../../components/products/UniversalProductForm';

const ProductEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            const data = await productService.getProduct(productId);
            setProduct(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch product:', err);
            setError('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (productData: any) => {
        try {
            if (!id) return;
            await productService.updateProduct(id, productData);
            navigate(`/portal/products/${id}`);
        } catch (error) {
            console.error('Failed to update product:', error);
            throw error;
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading product...</div>;
    }

    if (error || !product) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error || 'Product not found'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Edit Product
                    </h2>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <UniversalProductForm
                        onSubmit={handleSubmit}
                        initialData={product}
                        isEditing={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductEditPage;
