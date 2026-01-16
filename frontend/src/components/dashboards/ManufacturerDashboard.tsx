import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { analyticsService } from '../../services/analyticsService';
import VerificationChart from '../analytics/VerificationChart';
import GeographicDistribution from '../analytics/GeographicDistribution';
import BatchFlowVisualization from '../supply-chain/BatchFlowVisualization';

const ManufacturerDashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [stats, setStats] = useState({
        total_products: 0,
        total_batches: 0,
        total_verifications: 0,
        verification_rate: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentBatches, setRecentBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await analyticsService.getManufacturerStats();
                setStats({
                    total_products: data.total_products || 0,
                    total_batches: data.total_batches || 0,
                    total_verifications: data.total_verifications || 0,
                    verification_rate: data.verification_rate || 0
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };

        const loadRecentBatches = async () => {
            try {
                const response = await analyticsService.getManufacturerBatches();
                setRecentBatches(response.slice(0, 5)); // Show only 5 most recent
            } catch (error) {
                console.error('Failed to load recent batches:', error);
            }
        };

        loadStats();
        loadRecentBatches();
    }, []);

    const getIndustryType = (role: string) => {
        switch (role) {
            case 'ELECTRONICS_MANUFACTURER': return 'Electronics';
            case 'LUXURY_BRAND': return 'Luxury Goods';
            case 'FOOD_PRODUCER': return 'Food & Beverages';
            case 'AUTOMOTIVE_OEM': return 'Automotive';
            case 'COSMETICS_MANUFACTURER': return 'Cosmetics';
            default: return 'Healthcare';
        }
    };

    const industryType = getIndustryType(user?.role || 'MANUFACTURER');

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {industryType} Manufacturer Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                    Manage your products, track verifications, and monitor supply chain security.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {loading ? '...' : stats.total_products.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Batches</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {loading ? '...' : stats.total_batches.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Verifications</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {loading ? '...' : stats.total_verifications.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {loading ? '...' : `${stats.verification_rate.toFixed(1)}%`}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            to="/portal/products/new"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-primary-500"
                        >
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Add Product
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Register a new product in the system
                                </p>
                            </div>
                        </Link>

                        <Link
                            to="/portal/batches/new"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-primary-500"
                        >
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 group-hover:bg-green-100">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Create Batch
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Generate new batch IDs for production
                                </p>
                            </div>
                        </Link>

                        <Link
                            to="/portal/analytics"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-primary-500"
                        >
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    View Analytics
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Monitor verification trends and performance
                                </p>
                            </div>
                        </Link>

                        <Link
                            to="/portal/products"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-primary-500"
                        >
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Manage Products
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    View and edit your product catalog
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Supply Chain Flow Section */}
            <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Batch Distribution</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Track how your products move through the supply chain from production to end consumers.
                    </p>
                    
                    {recentBatches.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">📦</div>
                            <p className="text-gray-600">No batches created yet</p>
                            <p className="text-sm text-gray-500">Create your first batch to start tracking distribution</p>
                            <Link
                                to="/portal/batches/new"
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
                            >
                                Create First Batch
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentBatches.map((batch) => (
                                <div key={batch.batch_id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {batch.product_name || 'Unknown Product'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Batch: {batch.batch_id} • {batch.batch_size?.toLocaleString() || 0} units
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-900">
                                                        {batch.distributed_cartons || 0} / {batch.total_cartons || 0} cartons distributed
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Created: {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <button
                                                onClick={() => setSelectedBatchId(batch.batch_id)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                                View Flow
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="text-center pt-4">
                                <Link
                                    to="/portal/batches"
                                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                                >
                                    View All Batches →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Trends</h3>
                    <VerificationChart data={[
                        { date: '2024-01-01', verifications: 12 },
                        { date: '2024-02-01', verifications: 19 },
                        { date: '2024-03-01', verifications: 3 },
                        { date: '2024-04-01', verifications: 5 },
                        { date: '2024-05-01', verifications: 2 },
                        { date: '2024-06-01', verifications: 3 }
                    ]} />
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
                    <GeographicDistribution data={[
                        { state: 'Lagos', verifications: 45 },
                        { state: 'Abuja', verifications: 30 },
                        { state: 'Kano', verifications: 25 }
                    ]} />
                </div>
            </div>

            {/* Batch Flow Visualization Modal */}
            {selectedBatchId && (
                <BatchFlowVisualization
                    batchId={selectedBatchId}
                    onClose={() => setSelectedBatchId(null)}
                />
            )}
        </div>
    );
};

export default ManufacturerDashboard;