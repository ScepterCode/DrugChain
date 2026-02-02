import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, Product } from '../../services/productService';

interface ProductListProps {
    showArchived?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ showArchived = false }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reactivating, setReactivating] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, [showArchived]);

    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts();
            
            // Filter based on showArchived prop
            const filteredData = showArchived 
                ? data.filter(p => !p.is_active)  // Show only archived products (is_active = false)
                : data.filter(p => p.is_active);  // Show only active products (is_active = true)
            
            setProducts(filteredData);
            setError(null);
            
            console.log(`Successfully loaded ${filteredData.length} products (showArchived: ${showArchived})`);
        } catch (err: any) {
            console.error('Failed to fetch products:', err);
            
            if (err.response?.status === 401) {
                setError('Authentication required. Please log in to view products.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view products.');
            } else if (err.response?.status === 500) {
                setError('Server error. The products service is temporarily unavailable.');
            } else {
                setError('Failed to load products. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async (productId: string) => {
        setReactivating(productId);
        try {
            await productService.reactivateProduct(productId);
            // Refresh the product list after reactivation
            await fetchProducts();
        } catch (err: any) {
            console.error('Failed to reactivate product:', err);
            setError('Failed to reactivate product. Please try again.');
        } finally {
            setReactivating(null);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading products...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button 
                    onClick={fetchProducts}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dosage/Form
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NAFDAC No.
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="text-gray-400 text-6xl mb-4">
                                                    {showArchived ? '📁' : '📦'}
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    {showArchived ? 'No archived products' : 'No products in your catalog'}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    {showArchived 
                                                        ? 'You haven\'t archived any products yet.' 
                                                        : 'Get started by adding your first product to the system.'
                                                    }
                                                </p>
                                                {!showArchived && (
                                                    <Link
                                                        to="/portal/products/new"
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                    >
                                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        Add Your First Product
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.product_id} className={!product.is_active ? 'bg-gray-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`text-sm font-medium ${product.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                                                        {product.product_name}
                                                        {!product.is_active && (
                                                            <span className="ml-2 text-xs text-gray-400">(Archived)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${product.is_active ? 'text-gray-900' : 'text-gray-500'}`}>{product.product_code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm ${product.is_active ? 'text-gray-900' : 'text-gray-500'}`}>{product.dosage}</div>
                                                <div className="text-sm text-gray-500">{product.form}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.nafdac_registration_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {product.is_active ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link to={`/portal/products/${product.product_id}`} className="text-primary-600 hover:text-primary-900">
                                                        View
                                                    </Link>
                                                    {showArchived && !product.is_active && (
                                                        <button
                                                            onClick={() => handleReactivate(product.product_id)}
                                                            disabled={reactivating === product.product_id}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                        >
                                                            {reactivating === product.product_id ? (
                                                                <>
                                                                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Reactivating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                    </svg>
                                                                    Reactivate
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
