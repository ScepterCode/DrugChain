import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    Area,
    AreaChart,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface VolumeData {
    period: string;
    produced: number;
    distributed: number;
    verified: number;
    counterfeit: number;
}

interface StateVolumeData {
    state: string;
    volume: number;
    verifications: number;
    counterfeit_rate: number;
}

interface VolumeChartProps {
    data: VolumeData[];
    stateData: StateVolumeData[];
    type?: 'bar' | 'line' | 'area';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const VolumeChart: React.FC<VolumeChartProps> = ({ data, stateData, type = 'bar' }) => {
    // Add safety checks
    const safeData = data || [];
    const safeStateData = stateData || [];

    if (safeData.length === 0 && safeStateData.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No volume data available</p>
            </div>
        );
    }

    const renderMainChart = () => {
        if (safeData.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">No time series data available</p>
                </div>
            );
        }

        const commonProps = {
            data: safeData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        switch (type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="produced" stroke="#3b82f6" strokeWidth={2} name="Produced" />
                        <Line type="monotone" dataKey="distributed" stroke="#10b981" strokeWidth={2} name="Distributed" />
                        <Line type="monotone" dataKey="verified" stroke="#f59e0b" strokeWidth={2} name="Verified" />
                        <Line type="monotone" dataKey="counterfeit" stroke="#ef4444" strokeWidth={2} name="Counterfeit" />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="produced" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Produced" />
                        <Area type="monotone" dataKey="distributed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Distributed" />
                        <Area type="monotone" dataKey="verified" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Verified" />
                    </AreaChart>
                );
            default:
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="produced" fill="#3b82f6" name="Produced" />
                        <Bar dataKey="distributed" fill="#10b981" name="Distributed" />
                        <Bar dataKey="verified" fill="#f59e0b" name="Verified" />
                        <Bar dataKey="counterfeit" fill="#ef4444" name="Counterfeit" />
                    </BarChart>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Volume Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Volume Placement Trends</h3>
                        <p className="text-sm text-gray-600">Production, distribution, and verification volumes over time</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Chart Type:</span>
                        <select className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="area">Area Chart</option>
                        </select>
                    </div>
                </div>
                
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        {renderMainChart()}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* State-wise Distribution */}
            {safeStateData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* State Volume Bar Chart */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Volume by State</h4>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={safeStateData} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="state" type="category" width={60} />
                                    <Tooltip />
                                    <Bar dataKey="volume" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Counterfeit Rate Pie Chart */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Counterfeit Rate by State</h4>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={safeStateData.slice(0, 6)} // Top 6 states
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ state, counterfeit_rate }) => `${state}: ${counterfeit_rate.toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="counterfeit_rate"
                                    >
                                        {safeStateData.slice(0, 6).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Counterfeit Rate']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">State Distribution</h4>
                    <div className="text-center py-8">
                        <p className="text-gray-500">No state-wise data available</p>
                    </div>
                </div>
            )}

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Volume Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {safeData.length > 0 ? (
                        <>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {safeData.reduce((sum, d) => sum + d.produced, 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Total Produced</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {safeData.reduce((sum, d) => sum + d.distributed, 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Total Distributed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {safeData.reduce((sum, d) => sum + d.verified, 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Total Verified</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {safeData.reduce((sum, d) => sum + d.counterfeit, 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Counterfeit Detected</div>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-4 text-center py-4">
                            <p className="text-gray-500">No summary data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolumeChart;