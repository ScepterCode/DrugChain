import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { analyticsService } from '../services/analyticsService';

interface DistributorStats {
    total_inventory_cartons: number;
    total_inventory_packs: number;
    pending_transfers: number;
    completed_transfers: number;
    low_stock_alerts: number;
    recent_transfers: {
        id: string;
        type: 'RECEIVED' | 'DISPATCHED';
        product_name: string;
        quantity: number;
        from_to: string;
        timestamp: string;
    }[];
    inventory_by_product: {
        product_name: string;
        cartons: number;
        packs: number;
        status: 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';
    }[];
}

const DistributorDashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [stats, setStats] = useState<DistributorStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await analyticsService.getDistributorStats();
            setStats(data as DistributorStats);
        } catch (err) {
            console.error("Failed to load distributor stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center">Loading dashboard...</div>
            </div>
        );
    }

    const isPharmacy = user?.role === 'PHARMACY';

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {isPharmacy ? 'Pharmacy' : 'Distributor'} Dashboard
                </h1>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Inventory (Cartons)</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats?.total_inventory_cartons?.toLocaleString() || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Packs</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats?.total_inventory_packs?.toLocaleString() || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Transfers</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats?.pending_transfers || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Alerts</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats?.low_stock_alerts || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Overview */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Current Inventory
                        </h3>
                        {stats?.inventory_by_product && stats.inventory_by_product.length > 0 ? (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cartons</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packs</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {stats.inventory_by_product.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.product_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.cartons.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.packs.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        item.status === 'NORMAL' ? 'bg-green-100 text-green-800' :
                                                        item.status === 'LOW' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No inventory data available</p>
                        )}
                    </div>
                </div>

                {/* Recent Transfers */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Recent Transfers
                        </h3>
                        {stats?.recent_transfers && stats.recent_transfers.length > 0 ? (
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {stats.recent_transfers.map((transfer, idx) => (
                                        <li key={transfer.id}>
                                            <div className="relative pb-8">
                                                {idx !== stats.recent_transfers.length - 1 && (
                                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                )}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                                            transfer.type === 'RECEIVED' ? 'bg-green-500' : 'bg-blue-500'
                                                        }`}>
                                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                {transfer.type === 'RECEIVED' ? (
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                ) : (
                                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                )}
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                <span className="font-medium text-gray-900">{transfer.type}</span>{' '}
                                                                {transfer.quantity} cartons of{' '}
                                                                <span className="font-medium text-gray-900">{transfer.product_name}</span>
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {transfer.type === 'RECEIVED' ? 'From' : 'To'}: {transfer.from_to}
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                            {new Date(transfer.timestamp).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No recent transfers</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <button 
                            onClick={() => alert('Stock receiving functionality will be implemented in Phase 2')}
                            className="relative block w-full border-2 border-green-300 border-dashed rounded-lg p-6 text-center hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <svg className="mx-auto h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">Receive Stock</span>
                            <span className="text-xs text-green-600">Scan incoming cartons</span>
                        </button>

                        <button 
                            onClick={() => alert('Transfer functionality will be implemented in Phase 2')}
                            className="relative block w-full border-2 border-blue-300 border-dashed rounded-lg p-6 text-center hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="mx-auto h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                {isPharmacy ? 'Dispense' : 'Transfer Out'}
                            </span>
                            <span className="text-xs text-blue-600">
                                {isPharmacy ? 'To customers' : 'To pharmacies'}
                            </span>
                        </button>

                        <button 
                            onClick={() => {
                                const csvContent = [
                                    ['Date', 'Inventory Cartons', 'Inventory Packs', 'Pending Transfers', 'Low Stock Alerts'],
                                    [new Date().toISOString().split('T')[0], stats?.total_inventory_cartons || 0, stats?.total_inventory_packs || 0, stats?.pending_transfers || 0, stats?.low_stock_alerts || 0]
                                ].map(row => row.join(',')).join('\n');
                                
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${isPharmacy ? 'pharmacy' : 'distributor'}_report_${new Date().toISOString().split('T')[0]}.csv`;
                                a.click();
                                window.URL.revokeObjectURL(url);
                            }}
                            className="relative block w-full border-2 border-purple-300 border-dashed rounded-lg p-6 text-center hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            <svg className="mx-auto h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">Export Reports</span>
                            <span className="text-xs text-purple-600">Inventory & transfers</span>
                        </button>
                    </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900">Phase 2 Features Coming Soon</h3>
                    <p className="mt-2 text-sm text-blue-700">
                        Full supply chain tracking, transfer management, and inventory optimization features 
                        will be available in the next phase of development.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DistributorDashboard;