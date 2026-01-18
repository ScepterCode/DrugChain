import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
// import { analyticsService } from '../services/analyticsService'; // Removed mock service
import { supplyChainService } from '../services/supplyChainService';
import StockReceiveModal from '../components/distributor/StockReceiveModal';
import StockTransferModal from '../components/distributor/StockTransferModal';

interface DashboardData {
    inventory: any[];
    summary: {
        total_products: number;
        total_cartons: number;
        total_packs: number;
    };
}

interface TransferRecord {
    id: string;
    type: string;
    product_name: string;
    quantity: number;
    from_to: string;
    timestamp: string;
}

const DistributorDashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [inventoryData, setInventoryData] = useState<DashboardData | null>(null);
    // const [recentTransfers, setRecentTransfers] = useState<TransferRecord[]>([]); // For future use
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // 1. Get Inventory
            const invResponse = await supplyChainService.getInventory();
            setInventoryData(invResponse);

            // 2. Get Transfer History (mocked in backend service for now, but wired up)
            // const transfersResponse = await supplyChainService.getTransferHistory(); 
            // setRecentTransfers(transfersResponse.transfers);

            // Temporary: Using empty array until getTransferHistory is fully typed/exposed in service if needed
            // or just rely on the backend endpoint if it exists.
            // setRecentTransfers([]);

        } catch (err) {
            console.error("Failed to load distributor dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    const isRetailer = user?.role === 'RETAILER';
    const totalCartons = inventoryData?.summary?.total_cartons || 0;
    const totalPacks = inventoryData?.summary?.total_packs || 0;
    const lowStockCount = inventoryData?.inventory.filter((i: any) => i.status === 'LOW' || i.status === 'OUT_OF_STOCK').length || 0;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {isRetailer ? 'Retailer' : 'Distributor'} Dashboard
                </h1>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Inventory Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
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
                                        <dd className="text-2xl font-semibold text-gray-900">{totalCartons.toLocaleString()}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Packs Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
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
                                        <dd className="text-2xl font-semibold text-gray-900">{totalPacks.toLocaleString()}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Transfers Card (Placeholder for now) */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Actions</dt>
                                        <dd className="text-2xl font-semibold text-gray-900">0</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
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
                                        <dd className="text-2xl font-semibold text-gray-900">{lowStockCount}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Functional Now!) */}
                <div className="mt-8 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Operations Center</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Verify */}
                        <Link
                            to="/portal/verify"
                            className="relative block w-full border border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 hover:shadow-md transition-all bg-white"
                        >
                            <svg className="mx-auto h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">Verify Product</span>
                            <span className="text-xs text-gray-500">Scan & verify authenticity</span>
                        </Link>

                        {/* Receive Stock */}
                        <button
                            onClick={() => setIsReceiveModalOpen(true)}
                            className="relative block w-full border border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 hover:shadow-md transition-all bg-white group"
                        >
                            <svg className="mx-auto h-8 w-8 text-green-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">Receive Stock</span>
                            <span className="text-xs text-gray-500">Scan incoming cartons</span>
                        </button>

                        {/* Transfer Out */}
                        <button
                            onClick={() => setIsTransferModalOpen(true)}
                            className="relative block w-full border border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 hover:shadow-md transition-all bg-white group"
                        >
                            <svg className="mx-auto h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                {isRetailer ? 'Dispense' : 'Transfer Out'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {isRetailer ? 'To customers' : 'To pharmacies'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Inventory Overview */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Current Inventory
                        </h3>
                        {inventoryData?.inventory && inventoryData.inventory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cartons</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packs</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {inventoryData.inventory.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.product_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.product_code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.cartons.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.packs.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'NORMAL' ? 'bg-green-100 text-green-800' :
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
                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Your inventory is empty. Receive stock to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                <StockReceiveModal
                    isOpen={isReceiveModalOpen}
                    onClose={() => setIsReceiveModalOpen(false)}
                    onSuccess={() => loadDashboardData()}
                />
                <StockTransferModal
                    isOpen={isTransferModalOpen}
                    onClose={() => setIsTransferModalOpen(false)}
                    onSuccess={() => loadDashboardData()}
                />
            </div>
        </div>
    );
};

export default DistributorDashboard;