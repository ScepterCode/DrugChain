import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { analyticsService } from '../services/analyticsService';
import VerificationChart from '../components/analytics/VerificationChart';
import GeographicDistribution from '../components/analytics/GeographicDistribution';

interface RegulatorStats {
    total_manufacturers: number;
    total_products: number;
    total_verifications_nationwide: number;
    total_batches: number;
    counterfeit_alerts: number;
    verification_trends: { date: string; verifications: number }[];
    geographic_distribution: { state: string; verifications: number }[];
    recent_alerts: {
        id: string;
        type: 'COUNTERFEIT' | 'SUSPICIOUS';
        product_name: string;
        location: string;
        timestamp: string;
    }[];
}

const RegulatorDashboard: React.FC = () => {
    const { } = useAppSelector((state) => state.auth);
    const [stats, setStats] = useState<RegulatorStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await analyticsService.getRegulatorStats();
            setStats(data as RegulatorStats);
        } catch (err) {
            console.error("Failed to load regulator stats", err);
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

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    NAFDAC Regulatory Dashboard
                </h1>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Registered Manufacturers</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats?.total_manufacturers || 0}</dd>
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Verifications</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats?.total_verifications_nationwide?.toLocaleString() || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Active Products</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats?.total_products || 0}</dd>
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
                                        <dt className="text-sm font-medium text-gray-500 truncate">Counterfeit Alerts</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats?.counterfeit_alerts || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <VerificationChart data={stats?.verification_trends || []} />
                    <GeographicDistribution data={stats?.geographic_distribution || []} />
                </div>

                {/* Search and Actions Section */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Product Search & Verification
                        </h3>
                        <form
                            className="flex gap-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const query = formData.get('search-query');
                                if (query) {
                                    // TODO: Implement search functionality
                                    alert(`Searching for: ${query}`);
                                }
                            }}
                        >
                            <div className="flex-grow">
                                <label htmlFor="search-query" className="sr-only">Search Products</label>
                                <input
                                    name="search-query"
                                    type="text"
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border"
                                    placeholder="Search by product name, batch ID, or manufacturer..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Recent Security Alerts
                        </h3>
                        {stats?.recent_alerts && stats.recent_alerts.length > 0 ? (
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {stats.recent_alerts.map((alert, idx) => (
                                        <li key={alert.id}>
                                            <div className="relative pb-8">
                                                {idx !== stats.recent_alerts.length - 1 && (
                                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                )}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                                            alert.type === 'COUNTERFEIT' ? 'bg-red-500' : 'bg-yellow-500'
                                                        }`}>
                                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                <span className="font-medium text-gray-900">{alert.type}</span> detected for{' '}
                                                                <span className="font-medium text-gray-900">{alert.product_name}</span>
                                                            </p>
                                                            <p className="text-sm text-gray-500">Location: {alert.location}</p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                            {new Date(alert.timestamp).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No recent alerts</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Regulatory Actions</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <button 
                            onClick={() => alert('Search functionality will be implemented in Phase 2')}
                            className="relative block w-full border-2 border-primary-300 border-dashed rounded-lg p-6 text-center hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="mx-auto h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">Advanced Search</span>
                            <span className="text-xs text-gray-500">Phase 2 Feature</span>
                        </button>

                        <button 
                            onClick={() => {
                                const csvContent = [
                                    ['Date', 'Total Verifications', 'Counterfeit Alerts', 'Manufacturers'],
                                    [new Date().toISOString().split('T')[0], stats?.total_verifications_nationwide || 0, stats?.counterfeit_alerts || 0, stats?.total_manufacturers || 0]
                                ].map(row => row.join(',')).join('\n');
                                
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `nafdac_report_${new Date().toISOString().split('T')[0]}.csv`;
                                a.click();
                                window.URL.revokeObjectURL(url);
                            }}
                            className="relative block w-full border-2 border-green-300 border-dashed rounded-lg p-6 text-center hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <svg className="mx-auto h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">Generate Reports</span>
                            <span className="text-xs text-green-600">Export CSV</span>
                        </button>

                        <Link
                            to="/batches"
                            className="relative block w-full border-2 border-blue-300 border-dashed rounded-lg p-6 text-center hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="mx-auto h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">View All Batches</span>
                            <span className="text-xs text-blue-600">Inspection Ready</span>
                        </Link>

                        <button 
                            onClick={() => alert('Audit logs functionality will be implemented in Phase 2')}
                            className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="mt-2 block text-sm font-medium text-gray-900">Audit Logs</span>
                            <span className="text-xs text-gray-500">Phase 2 Feature</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegulatorDashboard;