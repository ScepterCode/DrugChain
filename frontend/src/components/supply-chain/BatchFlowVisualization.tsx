import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface BatchFlowData {
    batch_info: {
        batch_id: string;
        product_name: string;
        total_cartons: number;
        production_date: string;
        expiry_date: string;
        batch_size: number;
    };
    distribution_summary: Record<string, {
        entity_name: string;
        entity_type: string;
        cartons_received: number;
        first_scan: string;
        last_scan: string;
        location: string;
    }>;
    flow_visualization: Array<{
        step: number;
        entity_name: string;
        entity_type: string;
        cartons_count: number;
        timestamp: string;
        location: string;
        is_current: boolean;
    }>;
    blockchain_status: {
        network_healthy: boolean;
        total_blockchain_events: number;
        verified_on_blockchain: boolean;
    };
}

interface BatchFlowVisualizationProps {
    batchId: string;
    onClose: () => void;
}

const BatchFlowVisualization: React.FC<BatchFlowVisualizationProps> = ({ batchId, onClose }) => {
    const [flowData, setFlowData] = useState<BatchFlowData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBatchFlow();
    }, [batchId]);

    const fetchBatchFlow = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/analytics/supply-chain/batch-flow/${batchId}`);

            if (response.data.data.error) {
                setError(response.data.data.error);
            } else {
                setFlowData(response.data.data);
            }
        } catch (err) {
            setError('Failed to load batch flow data');
            console.error('Error fetching batch flow:', err);
        } finally {
            setLoading(false);
        }
    };

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'MANUFACTURER':
                return '🏭';
            case 'DISTRIBUTOR':
                return '🚚';
            case 'RETAILER':
                return '🏥';
            case 'REGULATOR':
                return '🏛️';
            default:
                return '📦';
        }
    };

    const getEntityColor = (entityType: string) => {
        switch (entityType) {
            case 'MANUFACTURER':
                return 'bg-blue-100 border-blue-300 text-blue-800';
            case 'DISTRIBUTOR':
                return 'bg-green-100 border-green-300 text-green-800';
            case 'RETAILER':
                return 'bg-purple-100 border-purple-300 text-purple-800';
            case 'REGULATOR':
                return 'bg-red-100 border-red-300 text-red-800';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Flow</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!flowData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Supply Chain Flow</h2>
                        <p className="text-gray-600">Batch: {flowData.batch_info.batch_id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Batch Information */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-700">Product Information</h3>
                            <p className="text-lg font-bold text-blue-600">{flowData.batch_info.product_name}</p>
                            <p className="text-sm text-gray-600">Batch Size: {flowData.batch_info.batch_size.toLocaleString()} units</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700">Production Details</h3>
                            <p className="text-sm">Produced: {new Date(flowData.batch_info.production_date).toLocaleDateString()}</p>
                            <p className="text-sm">Expires: {new Date(flowData.batch_info.expiry_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700">Distribution Status</h3>
                            <p className="text-sm">Total Cartons: {flowData.batch_info.total_cartons}</p>
                            <div className="flex items-center mt-1">
                                {flowData.blockchain_status.verified_on_blockchain ? (
                                    <span className="text-green-600 text-sm">🔗 Blockchain Verified</span>
                                ) : (
                                    <span className="text-yellow-600 text-sm">⚠️ Pending Blockchain</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flow Visualization */}
                <div className="px-6 py-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Flow</h3>

                    {flowData.flow_visualization.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">📦</div>
                            <p className="text-gray-600">No distribution activity recorded yet</p>
                            <p className="text-sm text-gray-500">Cartons are still at the manufacturer</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {flowData.flow_visualization.map((step, index) => (
                                <div key={step.step} className="flex items-center">
                                    {/* Step Number */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {step.step}
                                    </div>

                                    {/* Flow Line */}
                                    {index < flowData.flow_visualization.length - 1 && (
                                        <div className="absolute left-4 mt-8 w-0.5 h-16 bg-gray-300"></div>
                                    )}

                                    {/* Entity Information */}
                                    <div className="ml-4 flex-1">
                                        <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getEntityColor(step.entity_type)}`}>
                                            <span className="mr-2">{getEntityIcon(step.entity_type)}</span>
                                            <div>
                                                <div className="font-semibold">{step.entity_name}</div>
                                                <div className="text-sm opacity-75">{step.entity_type}</div>
                                            </div>
                                        </div>

                                        <div className="mt-2 text-sm text-gray-600">
                                            <div className="flex items-center space-x-4">
                                                <span>📦 {step.cartons_count} cartons</span>
                                                <span>📍 {step.location}</span>
                                                <span>⏰ {new Date(step.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {step.is_current && (
                                            <div className="mt-1">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Current Location
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Distribution Summary */}
                <div className="px-6 py-4 bg-gray-50 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Summary</h3>

                    {Object.keys(flowData.distribution_summary).length === 0 ? (
                        <p className="text-gray-600">No distribution partners have scanned cartons from this batch yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.values(flowData.distribution_summary).map((entity, index) => (
                                <div key={index} className="bg-white rounded-lg border p-4">
                                    <div className="flex items-center mb-2">
                                        <span className="mr-2">{getEntityIcon(entity.entity_type)}</span>
                                        <div>
                                            <div className="font-semibold text-gray-900">{entity.entity_name}</div>
                                            <div className="text-sm text-gray-600">{entity.entity_type}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cartons:</span>
                                            <span className="font-semibold">{entity.cartons_received}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-semibold">{entity.location}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">First Scan:</span>
                                            <span className="font-semibold">{new Date(entity.first_scan).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Blockchain Status */}
                <div className="px-6 py-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">🔗</span>
                            <span className="font-semibold">Blockchain Status</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                            <span className={`px-2 py-1 rounded-full ${flowData.blockchain_status.network_healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {flowData.blockchain_status.network_healthy ? '✅ Healthy' : '❌ Unavailable'}
                            </span>
                            <span className="text-gray-600">
                                {flowData.blockchain_status.total_blockchain_events} blockchain events
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchFlowVisualization;