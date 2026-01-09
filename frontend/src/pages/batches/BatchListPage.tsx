import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { batchService, Batch } from '../../services/batchService';
import BatchFlowVisualization from '../../components/supply-chain/BatchFlowVisualization';

const BatchListPage: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBatchForFlow, setSelectedBatchForFlow] = useState<string | null>(null);

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = async () => {
        try {
            const data = await batchService.getBatches();
            setBatches(data);
        } catch (err) {
            console.error('Failed to load batches:', err);
            setError('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadQRCodes = async (batchId: string) => {
        try {
            await batchService.downloadQRCodes(batchId);
        } catch (err) {
            console.error('Failed to download QR codes:', err);
            alert('Failed to download QR codes. Please try again.');
        }
    };

    const handleViewSupplyChainFlow = (batchId: string) => {
        setSelectedBatchForFlow(batchId);
    };

    const closeFlowVisualization = () => {
        setSelectedBatchForFlow(null);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center">Loading batches...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Production Batches
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Link
                        to="/portal/batches/new"
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Create New Batch
                    </Link>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="text-sm text-red-800">{error}</div>
                </div>
            )}

            {batches.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No batches</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first production batch.</p>
                    <div className="mt-6">
                        <Link
                            to="/portal/batches/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Create Batch
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {batches.map((batch) => (
                            <li key={batch.batch_id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <p className="text-sm font-medium text-primary-600 truncate">
                                                        {batch.batch_id}
                                                    </p>
                                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        batch.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                        batch.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {batch.status}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <p>
                                                        {batch.product_name} • {batch.batch_size.toLocaleString()} packs • 
                                                        Created {new Date(batch.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleViewSupplyChainFlow(batch.batch_id)}
                                                className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                title="View supply chain distribution flow"
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                                Supply Chain Flow
                                            </button>
                                            <button
                                                onClick={() => handleDownloadQRCodes(batch.batch_id)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download QR Codes
                                            </button>
                                            <Link
                                                to={`/portal/batches/${encodeURIComponent(batch.batch_id)}`}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {/* Supply Chain Flow Modal */}
            {selectedBatchForFlow && (
                <BatchFlowVisualization
                    batchId={selectedBatchForFlow}
                    onClose={closeFlowVisualization}
                />
            )}
        </div>
    );
};

export default BatchListPage;