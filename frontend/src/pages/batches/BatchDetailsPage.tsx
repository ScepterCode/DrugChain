import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { batchService, Batch } from '../../services/batchService';

interface BatchDetails extends Batch {
    product_code?: string;
    total_cartons?: number;
    cartons?: Array<{
        carton_id: string;
        pack_count: number;
    }>;
}

interface Pack {
    pack_id: string;
    carton_id: string;
    status: string;
}

const BatchDetailsPage: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const [batch, setBatch] = useState<BatchDetails | null>(null);
    const [packs, setPacks] = useState<Pack[]>([]);
    const [loading, setLoading] = useState(true);
    const [packsLoading, setPacksLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPacks, setShowPacks] = useState(false);

    // Debug logging
    console.log('BatchDetailsPage - batchId:', batchId);

    useEffect(() => {
        if (batchId) {
            console.log('Loading batch details for:', batchId);
            const decodedBatchId = decodeURIComponent(batchId);
            console.log('Decoded batch ID:', decodedBatchId);
            loadBatchDetails();
        } else {
            console.log('No batchId provided');
            setError('No batch ID provided');
            setLoading(false);
        }
    }, [batchId]);

    const loadBatchDetails = async () => {
        try {
            const decodedBatchId = batchId ? decodeURIComponent(batchId) : batchId;
            const data = await batchService.getBatch(decodedBatchId!);
            setBatch(data);
        } catch (err) {
            console.error('Failed to load batch details:', err);
            setError('Failed to load batch details');
        } finally {
            setLoading(false);
        }
    };

    const loadPacks = async () => {
        if (!batchId || packsLoading) return;
        
        setPacksLoading(true);
        try {
            const decodedBatchId = decodeURIComponent(batchId);
            const response = await fetch(`/api/v1/ids/batch/${encodeURIComponent(decodedBatchId)}/packs`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            const data = await response.json();
            setPacks(data.data.packs);
            setShowPacks(true);
        } catch (err) {
            console.error('Failed to load packs:', err);
        } finally {
            setPacksLoading(false);
        }
    };

    const handleDownloadQRCodes = async () => {
        try {
            const decodedBatchId = batchId ? decodeURIComponent(batchId) : batchId;
            await batchService.downloadQRCodes(decodedBatchId!);
        } catch (err) {
            console.error('Failed to download QR codes:', err);
            alert('Failed to download QR codes. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center">Loading batch details...</div>
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center text-red-600">{error || 'Batch not found'}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link to="/portal/batches" className="text-gray-400 hover:text-gray-500">
                                    Batches
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="ml-4 text-sm font-medium text-gray-500">{batch.batch_id}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Batch Details
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                    <button
                        onClick={handleDownloadQRCodes}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download QR Codes
                    </button>
                </div>
            </div>

            {/* Batch Information */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Batch Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Complete details for production batch {batch.batch_id}
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Batch ID</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{batch.batch_id}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Product</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {batch.product_name} {batch.product_code && `(${batch.product_code})`}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Production Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {new Date(batch.production_date).toLocaleDateString()}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {new Date(batch.expiry_date).toLocaleDateString()}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Batch Size</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {batch.batch_size.toLocaleString()} packs
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Packaging</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {batch.total_cartons || Math.ceil(batch.batch_size / batch.packs_per_carton)} cartons × {batch.packs_per_carton} packs each
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    batch.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    batch.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {batch.status}
                                </span>
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Created</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {new Date(batch.created_at).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Cartons Overview */}
            {batch.cartons && batch.cartons.length > 0 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Cartons Overview</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            {batch.total_cartons || batch.cartons.length} cartons generated for this batch
                        </p>
                    </div>
                    <div className="border-t border-gray-200">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Carton ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pack Count
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {batch.cartons.slice(0, 10).map((carton) => (
                                        <tr key={carton.carton_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                                {carton.carton_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {carton.pack_count} packs
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {batch.cartons.length > 10 && (
                                <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
                                    Showing 10 of {batch.cartons.length} cartons
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pack IDs Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Pack IDs</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Individual pack identifiers for verification
                            </p>
                        </div>
                        <button
                            onClick={loadPacks}
                            disabled={packsLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {packsLoading ? 'Loading...' : showPacks ? 'Refresh' : 'Load Pack IDs'}
                        </button>
                    </div>
                </div>
                {showPacks && (
                    <div className="border-t border-gray-200">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pack ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Carton ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {packs.map((pack) => (
                                        <tr key={pack.pack_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                                {pack.pack_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {pack.carton_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    pack.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                    pack.status === 'USED' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {pack.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {packs.length === 100 && (
                                <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
                                    Showing first 100 pack IDs. Download QR codes ZIP for complete list.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchDetailsPage;