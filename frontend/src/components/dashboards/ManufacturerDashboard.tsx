import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { analyticsService } from '../../services/analyticsService';
import { supplyChainService, ManufacturerBatch } from '../../services/supplyChainService';
import { verificationService, VerificationResponse } from '../../services/verificationService';
import VerificationResult from '../verification/VerificationResult';
import QRScanner from '../QRScanner';
import BatchFlowVisualization from '../supply-chain/BatchFlowVisualization';
import { detectIDType, extractIDFromQR } from '../../utils/idDetector';

// Manufacturer Dashboard with verification widget
const ManufacturerDashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [stats, setStats] = useState({
        total_products: 0,
        total_batches: 0,
        total_verifications: 0,
        verification_rate: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentBatches, setRecentBatches] = useState<ManufacturerBatch[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    
    // Verification state
    const [packId, setPackId] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<VerificationResponse | null>(null);
    const [showScanner, setShowScanner] = useState(false);

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
                // FIXED: Use supply chain service instead of analytics service
                const response = await supplyChainService.getManufacturerBatches();
                setRecentBatches(response.slice(0, 5)); // Show only 5 most recent
            } catch (error) {
                console.error('Failed to load recent batches:', error);
                // Fallback to empty array to prevent UI crash
                setRecentBatches([]);
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

    // Verification functions
    const verify = async (id: string) => {
        if (!id.trim()) return;
        setVerifying(true);
        setShowScanner(false);
        
        try {
            // Use centralized ID detection
            const detection = detectIDType(id);
            const cleanId = detection.cleanId;
            
            console.log('[ManufacturerDashboard] Original ID:', id);
            console.log('[ManufacturerDashboard] Detected type:', detection.type);
            console.log('[ManufacturerDashboard] Clean ID:', cleanId);
            
            // Route based on detected type
            if (detection.type === 'CARTON') {
                console.log('[ManufacturerDashboard] Calling verifyCarton()');
                const data = await verificationService.verifyCarton(cleanId);
                console.log('[ManufacturerDashboard] Carton verification response:', data);
                // Convert CartonVerificationResponse to VerificationResponse format
                setResult({
                    success: data.success,
                    verification_result: data.verification_result as any,
                    message: data.message,
                    data: data.data as any
                });
            } else {
                // Default to pack verification for PACK, BATCH, or UNKNOWN types
                console.log('[ManufacturerDashboard] Calling verifyPack()');
                const data = await verificationService.verifyPack(cleanId);
                console.log('[ManufacturerDashboard] Pack verification response:', data);
                setResult(data);
            }
        } catch (error) {
            console.error('[ManufacturerDashboard] Verification error:', error);
            setResult({
                success: false,
                verification_result: 'INVALID',
                message: 'An error occurred while connecting to the server. Please try again.',
            });
        } finally {
            setVerifying(false);
        }
    };

    const handleScan = (text: string) => {
        if (text) {
            // Extract ID from QR code (handles URLs with id= parameter)
            const scannedId = extractIDFromQR(text);
            console.log('[ManufacturerDashboard] QR scanned:', text);
            console.log('[ManufacturerDashboard] Extracted ID:', scannedId);
            setPackId(scannedId);
            verify(scannedId);
            // Close scanner after successful scan
            setShowScanner(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        await verify(packId);
    };

    const handleReset = () => {
        setResult(null);
        setPackId('');
        setShowScanner(false);
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Manufacturer Dashboard
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
                            to="/portal/verify"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-primary-500"
                        >
                            <div>
                                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 group-hover:bg-green-100">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Verify Product
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Verify product authenticity and track verifications
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
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Verification</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Verify the authenticity of any product by scanning the QR code or entering the Pack ID manually.
                </p>

                {!result ? (
                    <div>
                        {showScanner ? (
                            <div className="mb-6">
                                <QRScanner
                                    isVisible={showScanner}
                                    onScan={handleScan}
                                    onClose={() => setShowScanner(false)}
                                />
                            </div>
                        ) : (
                            <div className="mb-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    Scan QR Code
                                </button>
                                <div className="mt-6 relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-2 bg-white text-sm text-gray-500">Or enter manually</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label htmlFor="pack-id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pack ID
                                </label>
                                <input
                                    id="pack-id"
                                    name="pack-id"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Enter Pack ID (e.g. PK-ABC123XYZ)"
                                    value={packId}
                                    onChange={(e) => setPackId(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={verifying}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {verifying ? 'Verifying...' : 'Verify Now'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <VerificationResult
                            result={result.verification_result as any}
                            message={result.message}
                            data={result.data}
                            onScanAnother={handleReset}
                            onMarkAsUsed={async (packId) => {
                                await verificationService.markPackAsUsed(packId);
                            }}
                        />
                    </div>
                )}
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