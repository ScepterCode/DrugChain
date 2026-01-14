import React from 'react';
import RoleBasedDashboard from '../components/RoleBasedDashboard';

const DashboardPage: React.FC = () => {
    return <RoleBasedDashboard />;
};

export default DashboardPage; 
                        total_products: 0, 
                        total_batches: 0, 
                        total_verifications: 0, 
                        verification_rate: 0 
                    };
                    let trendsData: { date: string; verifications: number }[] = [];
                    let geoData: { state: string; verifications: number }[] = [];
                    let performanceData: any[] = [];
                    
                    try {
                        const rawData = await analyticsService.getManufacturerStats();
                        dashboardData = {
                            total_products: rawData.total_products || 0,
                            total_batches: rawData.total_batches || 0,
                            total_verifications: rawData.total_verifications || 0,
                            verification_rate: rawData.verification_rate || 0
                        };
                        console.log('Dashboard stats loaded:', dashboardData);
                    } catch (err) {
                        console.warn('Failed to load dashboard stats, using defaults:', err);
                    }
                    
                    try {
                        trendsData = await analyticsService.getVerificationTrends(30);
                        console.log('Trends data loaded:', trendsData.length, 'entries');
                    } catch (err) {
                        console.warn('Failed to load trends data:', err);
                    }
                    
                    try {
                        geoData = await analyticsService.getGeographicDistribution();
                        console.log('Geographic data loaded:', geoData.length, 'entries');
                    } catch (err) {
                        console.warn('Failed to load geographic data:', err);
                    }
                    
                    try {
                        performanceData = await analyticsService.getProductPerformance();
                        console.log('Performance data loaded:', performanceData.length, 'products');
                    } catch (err) {
                        console.warn('Failed to load performance data:', err);
                    }
                    
                    setStats(dashboardData);
                    setVerificationTrends(trendsData);
                    setGeographicData(geoData);
                    setProductPerformance(performanceData);
                    
                    showSuccess('Dashboard loaded successfully!');
                } else {
                    // For non-manufacturer users, set empty data
                    console.log('Non-manufacturer user, setting empty data');
                    setStats({
                        total_products: 0,
                        total_batches: 0,
                        total_verifications: 0,
                        verification_rate: 0
                    });
                    setVerificationTrends([]);
                    setGeographicData([]);
                    setProductPerformance([]);
                }
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
                showError('Dashboard loaded with limited data due to connection issues.');
                
                // Set fallback data to prevent blank screen
                setStats({
                    total_products: 0,
                    total_batches: 0,
                    total_verifications: 0,
                    verification_rate: 0
                });
                setVerificationTrends([]);
                setGeographicData([]);
                setProductPerformance([]);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadStats();
        } else {
            console.log('No user found, setting loading to false');
            setLoading(false);
        }
    }, [user, showSuccess, showError]);

    // Manufacturer Dashboard (Enhanced)
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome, {user?.full_name}!
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manufacturer Dashboard - Track your products and verification performance
                        </p>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                        <button
                            onClick={() => {
                                const csvContent = [
                                    ['Product', 'Code', 'Total Packs', 'Verifications', 'Rate'],
                                    ...productPerformance.map(p => [
                                        p.product_name,
                                        p.product_code,
                                        p.total_packs,
                                        p.total_verifications,
                                        `${p.verification_rate.toFixed(1)}%`
                                    ])
                                ].map(row => row.join(',')).join('\n');
                                
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `manufacturer_analytics_${new Date().toISOString().split('T')[0]}.csv`;
                                a.click();
                                window.URL.revokeObjectURL(url);
                                showSuccess('Analytics report exported successfully!');
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Analytics
                        </button>
                        <Link
                            to="/portal/batches/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Create New Batch
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
                    </div>
                ) : (
                    <>
                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.total_products || 0}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <Link to="/portal/products" className="font-medium text-primary-700 hover:text-primary-900">
                                            View all products
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Production Batches</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.total_batches || 0}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <Link to="/portal/batches" className="font-medium text-primary-700 hover:text-primary-900">
                                            View all batches
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Verifications</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.total_verifications?.toLocaleString() || 0}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <span className="text-gray-500">Consumer trust metric</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Verification Rate</dt>
                                                <dd className="text-lg font-medium text-gray-900">{(stats.verification_rate || 0).toFixed(1)}%</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3">
                                    <div className="text-sm">
                                        <span className="text-gray-500">Market engagement</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {verificationTrends.length > 0 && (
                                <VerificationChart data={verificationTrends} />
                            )}
                            {geographicData.length > 0 && (
                                <GeographicDistribution data={geographicData} />
                            )}
                        </div>

                        {/* Product Performance Table */}
                        {productPerformance.length > 0 && (
                            <div className="bg-white shadow rounded-lg mb-8">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Product Performance Analytics
                                    </h3>
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Packs</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verifications</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {productPerformance.map((product, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {product.product_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                            {product.product_code}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {product.total_packs.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {product.total_verifications.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                product.verification_rate >= 10 ? 'bg-green-100 text-green-800' :
                                                                product.verification_rate >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {product.verification_rate.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Verification Section */}
                        <div className="bg-white overflow-hidden shadow rounded-lg p-6 mb-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Product Verification</h2>
                            <form
                                className="flex gap-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const id = formData.get('quick-verify-id');
                                    if (id) window.location.href = `/verify?id=${id}`;
                                }}
                            >
                                <div className="flex-grow">
                                    <label htmlFor="quick-verify-id" className="sr-only">Pack ID</label>
                                    <input
                                        name="quick-verify-id"
                                        type="text"
                                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border"
                                        placeholder="Enter Pack ID to verify (e.g. PK-ABC123XYZ)"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Verify Product
                                </button>
                            </form>
                        </div>

                        {/* Quick Actions Grid */}
                        <div className="mb-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Link 
                                    to="/portal/products/new" 
                                    className="relative block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary-200"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                                            <p className="mt-1 text-sm text-gray-500">Register a new product in your catalog</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link 
                                    to="/portal/batches/new" 
                                    className="relative block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary-200"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">Create Production Batch</h3>
                                            <p className="mt-1 text-sm text-gray-500">Generate secure IDs for a new batch</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link 
                                    to="/portal/batches" 
                                    className="relative block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary-200"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">Download QR Codes</h3>
                                            <p className="mt-1 text-sm text-gray-500">Get QR codes for existing batches</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Getting Started Guide */}
                        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-primary-900">Manufacturing Excellence</h3>
                                    <div className="mt-2 text-sm text-primary-700">
                                        <p>
                                            Your supply chain integrity starts here. Every product you register and every batch you create 
                                            contributes to building consumer trust and fighting counterfeit medicines in Nigeria.
                                        </p>
                                        <div className="mt-4">
                                            <Link 
                                                to="/portal/products" 
                                                className="font-medium text-primary-800 hover:text-primary-900 underline"
                                            >
                                                View your product catalog →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {/* Toast Notifications */}
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default DashboardPage;
