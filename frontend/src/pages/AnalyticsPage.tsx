import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import VerificationMap from '../components/analytics/VerificationMap';
import VolumeChart from '../components/analytics/VolumeChart';
import VerificationChart from '../components/analytics/VerificationChart';
import GeographicDistribution from '../components/analytics/GeographicDistribution';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsData {
    verificationLocations: Array<{
        id: string;
        latitude: number;
        longitude: number;
        city: string;
        state: string;
        count: number;
        recent_verifications: Array<{
            pack_id: string;
            verified_at: string;
            result: string;
        }>;
    }>;
    volumeData: Array<{
        period: string;
        produced: number;
        distributed: number;
        verified: number;
        counterfeit: number;
    }>;
    stateVolumeData: Array<{
        state: string;
        volume: number;
        verifications: number;
        counterfeit_rate: number;
    }>;
    verificationTrends: Array<{
        date: string;
        genuine: number;
        counterfeit: number;
        suspicious: number;
    }>;
    geographicData: Array<{
        state: string;
        verifications: number;
        percentage: number;
    }>;
}

const AnalyticsPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30'); // days

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            console.log('Loading analytics data for time range:', timeRange);

            // Load essential data first with proper typing
            let trends: { date: string; verifications: number }[] = [];
            let geographic: { state: string; verifications: number }[] = [];

            try {
                trends = await analyticsService.getVerificationTrends(parseInt(timeRange)) || [];
            } catch (e) {
                console.warn('Failed to load verification trends:', e);
            }

            try {
                geographic = await analyticsService.getGeographicDistribution() || [];
            } catch (e) {
                console.warn('Failed to load geographic distribution:', e);
            }

            setAnalyticsData({
                verificationLocations: [], // Load this later
                volumeData: [], // Load this later
                stateVolumeData: [],
                verificationTrends: trends.map(trend => ({
                    date: trend.date,
                    genuine: trend.verifications,
                    counterfeit: 0,
                    suspicious: 0
                })),
                geographicData: geographic.map(geo => ({
                    state: geo.state,
                    verifications: geo.verifications,
                    percentage: 0
                }))
            });

            setLoading(false); // Show initial data immediately

            // Load heavy data in background with proper typing
            let locations: AnalyticsData['verificationLocations'] = [];
            let volume: { volumeData: AnalyticsData['volumeData']; stateVolumeData: AnalyticsData['stateVolumeData'] } = { volumeData: [], stateVolumeData: [] };

            try {
                locations = await analyticsService.getVerificationLocations(parseInt(timeRange)) || [];
            } catch (e) {
                console.warn('Failed to load verification locations:', e);
            }

            try {
                const volumeResult = await analyticsService.getVolumeData(parseInt(timeRange));
                volume = volumeResult || { volumeData: [], stateVolumeData: [] };
            } catch (e) {
                console.warn('Failed to load volume data:', e);
            }

            // Update with heavy data
            setAnalyticsData(prev => prev ? {
                ...prev,
                verificationLocations: locations,
                volumeData: volume.volumeData || [],
                stateVolumeData: volume.stateVolumeData || []
            } : null);



            console.log('Analytics data loaded successfully');
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            // Set empty data to prevent blank page
            setAnalyticsData({
                verificationLocations: [],
                volumeData: [],
                stateVolumeData: [],
                verificationTrends: [],
                geographicData: []
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const handleTimeRangeChange = (newRange: string) => {
        setTimeRange(newRange);
    };

    if (loading && !analyticsData) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Analytics Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Real-time insights and trends for {user?.role === 'MANUFACTURER' ? 'manufacturing' : 'distribution'} operations
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                    <select
                        value={timeRange}
                        onChange={(e) => handleTimeRangeChange(e.target.value)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                    <button
                        onClick={loadAnalyticsData}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        Refresh
                    </button>
                </div>
            </div>

            {analyticsData ? (
                <div className="space-y-6">
                    {/* Real-time Verification Map */}
                    {analyticsData.verificationLocations.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Locations</h3>
                            <VerificationMap
                                locations={analyticsData.verificationLocations}
                                height="500px"
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Locations</h3>
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No verification locations</h3>
                                <p className="mt-1 text-sm text-gray-500">No verification data available for the selected time period.</p>
                            </div>
                        </div>
                    )}

                    {/* Volume Charts */}
                    {analyticsData.volumeData.length > 0 || analyticsData.stateVolumeData.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Analytics</h3>
                            <VolumeChart
                                data={analyticsData.volumeData}
                                stateData={analyticsData.stateVolumeData}
                                type="bar"
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Analytics</h3>
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No volume data</h3>
                                <p className="mt-1 text-sm text-gray-500">No production or distribution data available for the selected time period.</p>
                            </div>
                        </div>
                    )}

                    {/* Verification Trends and Geographic Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analyticsData.verificationTrends.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Trends</h3>
                                <VerificationChart
                                    data={analyticsData.verificationTrends.map(trend => ({
                                        date: trend.date,
                                        verifications: trend.genuine + trend.counterfeit + trend.suspicious
                                    }))}
                                />
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Trends</h3>
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">No trend data available</p>
                                </div>
                            </div>
                        )}

                        {analyticsData.geographicData.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                                <GeographicDistribution
                                    data={analyticsData.geographicData}
                                />
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">No geographic data available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Real-time Status Indicators */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">System Status</p>
                                    <p className="text-xs text-gray-500">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Data Sync</p>
                                    <p className="text-xs text-gray-500">Real-time</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Active Locations</p>
                                    <p className="text-xs text-gray-500">{analyticsData.verificationLocations.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Last Update</p>
                                    <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Analytics Unavailable</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Unable to load analytics data. This may be due to server connectivity issues or insufficient data.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={loadAnalyticsData}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;