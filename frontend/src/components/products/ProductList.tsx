import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, Product } from '../../services/productService';

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
            setError(null);
            
            // If no products were returned, show a helpful message
            if (data.length === 0) {
                setError("No products available. This could be due to server issues or you may need to add products to your catalog.");
            }
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
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No products found. Start by adding one to your catalog.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.product_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.product_name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{product.product_code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{product.dosage}</div>
                                                <div className="text-sm text-gray-500">{product.form}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.nafdac_registration_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/products/${product.product_id}`} className="text-primary-600 hover:text-primary-900">
                                                    View
                                                </Link>
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
