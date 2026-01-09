import React from 'react';

interface VerificationChartProps {
    data: {
        date: string;
        verifications: number;
    }[];
}

const VerificationChart: React.FC<VerificationChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No verification trend data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.verifications));
    const minValue = Math.min(...data.map(d => d.verifications));
    const range = maxValue - minValue || 1;

    return (
        <div className="space-y-4">
            {/* Chart Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Verification Trends</h4>
                <div className="text-xs text-gray-500">
                    {data.length} data points
                </div>
            </div>

            {/* Simple Line Chart */}
            <div className="relative h-48 bg-gray-50 rounded-lg p-4">
                <svg className="w-full h-full" viewBox="0 0 400 160">
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="40" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 32" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Data line */}
                    {data.length > 1 && (
                        <polyline
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            points={data.map((d, i) => {
                                const x = (i / (data.length - 1)) * 360 + 20;
                                const y = 140 - ((d.verifications - minValue) / range) * 120;
                                return `${x},${y}`;
                            }).join(' ')}
                        />
                    )}
                    
                    {/* Data points */}
                    {data.map((d, i) => {
                        const x = (i / Math.max(data.length - 1, 1)) * 360 + 20;
                        const y = 140 - ((d.verifications - minValue) / range) * 120;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#3b82f6"
                                className="hover:r-4 transition-all"
                            >
                                <title>{`${new Date(d.date).toLocaleDateString()}: ${d.verifications} verifications`}</title>
                            </circle>
                        );
                    })}
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
                    <span>{maxValue}</span>
                    <span>{Math.round((maxValue + minValue) / 2)}</span>
                    <span>{minValue}</span>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-500 px-4">
                <span>{new Date(data[0]?.date).toLocaleDateString()}</span>
                {data.length > 2 && (
                    <span>{new Date(data[Math.floor(data.length / 2)]?.date).toLocaleDateString()}</span>
                )}
                <span>{new Date(data[data.length - 1]?.date).toLocaleDateString()}</span>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                        {data.reduce((sum, d) => sum + d.verifications, 0)}
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                        {Math.round(data.reduce((sum, d) => sum + d.verifications, 0) / data.length)}
                    </div>
                    <div className="text-xs text-gray-500">Daily Avg</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                        {maxValue}
                    </div>
                    <div className="text-xs text-gray-500">Peak</div>
                </div>
            </div>
        </div>
    );
};

export default VerificationChart;