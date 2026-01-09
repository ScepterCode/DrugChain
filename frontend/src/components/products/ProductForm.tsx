import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, ProductCreateData } from '../../services/productService';

const ProductForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<ProductCreateData>({
        product_code: '',
        product_name: '',
        dosage: '',
        form: '',
        active_ingredients: [],
        therapeutic_category: '',
        requires_prescription: true,
        nafdac_registration_number: ''
    });

    const [ingredientInput, setIngredientInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let checked = false;
        if (e.target instanceof HTMLInputElement && type === 'checkbox') {
            checked = e.target.checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddIngredient = () => {
        if (ingredientInput.trim()) {
            setFormData(prev => ({
                ...prev,
                active_ingredients: [...(prev.active_ingredients || []), ingredientInput.trim()]
            }));
            setIngredientInput('');
        }
    };

    const removeIngredient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            active_ingredients: (prev.active_ingredients || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await productService.createProduct(formData);
            navigate('/products');
        } catch (err: any) {
            console.error('Failed to create product:', err);
            setError(err.response?.data?.detail || 'Failed to create product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Product Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Enter the details of the pharmaceutical product you wish to register.
                    </p>
                </div>

                <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">
                                Product Name
                            </label>
                            <input
                                type="text"
                                name="product_name"
                                id="product_name"
                                required
                                value={formData.product_name}
                                onChange={handleChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="product_code" className="block text-sm font-medium text-gray-700">
                                Product Code (SKU)
                            </label>
                            <input
                                type="text"
                                name="product_code"
                                id="product_code"
                                required
                                value={formData.product_code}
                                onChange={handleChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">
                                Dosage Strength
                            </label>
                            <input
                                type="text"
                                name="dosage"
                                id="dosage"
                                placeholder="e.g. 500mg"
                                value={formData.dosage}
                                onChange={handleChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="form" className="block text-sm font-medium text-gray-700">
                                Form
                            </label>
                            <select
                                id="form"
                                name="form"
                                value={formData.form}
                                onChange={handleChange}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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

                        <div className="col-span-6">
                            <label htmlFor="active_ingredients" className="block text-sm font-medium text-gray-700">
                                Active Ingredients
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    value={ingredientInput}
                                    onChange={(e) => setIngredientInput(e.target.value)}
                                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                                    placeholder="Add ingredient"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddIngredient}
                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.active_ingredients?.map((ing, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {ing}
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(idx)}
                                            className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="nafdac_registration_number" className="block text-sm font-medium text-gray-700">
                                NAFDAC Reg Number
                            </label>
                            <input
                                type="text"
                                name="nafdac_registration_number"
                                id="nafdac_registration_number"
                                value={formData.nafdac_registration_number}
                                onChange={handleChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <div className="flex items-start h-full pt-6">
                                <div className="flex items-center h-5">
                                    <input
                                        id="requires_prescription"
                                        name="requires_prescription"
                                        type="checkbox"
                                        checked={formData.requires_prescription}
                                        onChange={handleChange}
                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="requires_prescription" className="font-medium text-gray-700">
                                        Requires Prescription
                                    </label>
                                    <p className="text-gray-500">Check if this drug requires a doctor's prescription.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
