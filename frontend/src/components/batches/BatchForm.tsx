import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchService } from '../../services/batchService';
import { productService, Product } from '../../services/productService';

const BatchForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        product_id: '',
        production_date: new Date().toISOString().split('T')[0], // Today
        expiry_date: '',
        batch_size: 1000,
        packs_per_carton: 50
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, product_id: data[0].product_id }));
            }
        } catch (err) {
            console.error("Failed to load products for batch form");
            setError("Could not load products. Please ensure you have products in your catalog.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const batchSize = Number(formData.batch_size);
            const packsPerCarton = Number(formData.packs_per_carton);
            const numberOfCartons = Math.ceil(batchSize / packsPerCarton);

            await batchService.createBatch({
                product_id: formData.product_id,
                production_date: formData.production_date,
                expiry_date: formData.expiry_date,
                batch_size: batchSize,
                number_of_cartons: numberOfCartons,
                packs_per_carton: packsPerCarton
            });
            // Redirect to batches list or download page
            navigate('/batches');
        } catch (err: any) {
            console.error('Failed to create batch:', err);
            let errorMessage = 'Failed to create batch and generate IDs. Please try again.';
            
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    // Handle validation errors array
                    errorMessage = err.response.data.detail.map((e: any) => e.msg || e.message || String(e)).join(', ');
                } else if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                } else {
                    errorMessage = 'Validation error occurred';
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Batch Configuration</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Define production batch parameters. ID generation starts automatically upon submission.
                    </p>
                </div>

                <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        {typeof error === 'string' ? error : 'An error occurred'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-4">
                            <label htmlFor="product_id" className="block text-sm font-medium text-gray-700">
                                Select Product
                            </label>
                            <select
                                id="product_id"
                                name="product_id"
                                required
                                value={formData.product_id}
                                onChange={handleChange}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="" disabled>Select a product</option>
                                {products.map(p => (
                                    <option key={p.product_id} value={p.product_id}>
                                        {p.product_name} ({p.product_code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="production_date" className="block text-sm font-medium text-gray-700">
                                Production Date
                            </label>
                            <input
                                type="date"
                                name="production_date"
                                id="production_date"
                                required
                                value={formData.production_date}
                                onChange={handleChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                name="expiry_date"
                                id="expiry_date"
                                required
                                value={formData.expiry_date}
                                onChange={handleChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="batch_size" className="block text-sm font-medium text-gray-700">
                                Batch Size (Total Packs)
                            </label>
                            <input
                                type="number"
                                name="batch_size"
                                id="batch_size"
                                min="1"
                                max="100000"
                                required
                                value={formData.batch_size}
                                onChange={handleChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                            <p className="mt-1 text-xs text-gray-500">Max 100,000 packs per batch.</p>
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="packs_per_carton" className="block text-sm font-medium text-gray-700">
                                Packs Per Carton
                            </label>
                            <input
                                type="number"
                                name="packs_per_carton"
                                id="packs_per_carton"
                                min="1"
                                required
                                value={formData.packs_per_carton}
                                onChange={handleChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => navigate('/batches')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {loading ? 'Generating IDs...' : 'Create Batch'}
                </button>
            </div>
        </form>
    );
};

export default BatchForm;
