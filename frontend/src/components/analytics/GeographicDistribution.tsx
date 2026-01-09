import React from 'react';

interface GeographicDistributionProps {
    data: {
        state: string;
        verifications: number;
    }[];
}

const GeographicDistribution: React.FC<GeographicDistributionProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No geographic data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.verifications));
    const totalVerifications = data.reduce((sum, d) => sum + d.verifications, 0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Geographic Distribution</h4>
                <div className="text-xs text-gray-500">
                    {data.length} states/regions
                </div>
            </div>

            {/* Bar Chart Alternative */}
            <div className="space-y-2">
                {data.slice(0, 10).map((item) => {
                    const percentage = totalVerifications > 0 ? (item.verifications / totalVerifications) * 100 : 0;
                    const barWidth = maxValue > 0 ? (item.verifications / maxValue) * 100 : 0;
                    
                    return (
                        <div key={item.state} className="flex items-center space-x-3">
                            <div className="w-16 text-xs text-gray-600 text-right">
                                {item.state}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                <div 
                                    className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${barWidth}%` }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                                    {item.verifications}
                                </div>
                            </div>
                            <div className="w-12 text-xs text-gray-500 text-right">
                                {percentage.toFixed(1)}%
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div className="text-lg font-semibold text-green-600">
                            {totalVerifications.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Total Verifications</div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-blue-600">
                            {data.length}
                        </div>
                        <div className="text-xs text-gray-500">Active States</div>
                    </div>
                </div>
            </div>

            {/* Top States */}
            <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Top Performing States</div>
                <div className="flex flex-wrap gap-2">
                    {data.slice(0, 5).map((item, index) => (
                        <span 
                            key={item.state}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                index === 0 ? 'bg-green-100 text-green-800' :
                                index === 1 ? 'bg-blue-100 text-blue-800' :
                                index === 2 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}
                        >
                            #{index + 1} {item.state}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GeographicDistribution;