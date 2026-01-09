import React from 'react';

interface VerificationLocation {
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
}

interface VerificationMapProps {
    locations: VerificationLocation[];
    height?: string;
}

const VerificationMap: React.FC<VerificationMapProps> = ({ locations, height = "400px" }) => {
    if (!locations || locations.length === 0) {
        return (
            <div className="text-center py-12" style={{ height }}>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No verification locations</h3>
                <p className="mt-1 text-sm text-gray-500">No verification data available for mapping.</p>
            </div>
        );
    }

    // Group locations by state for better visualization
    const stateGroups = locations.reduce((acc, location) => {
        if (!acc[location.state]) {
            acc[location.state] = [];
        }
        acc[location.state].push(location);
        return acc;
    }, {} as Record<string, VerificationLocation[]>);

    return (
        <div style={{ height }}>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Verification Locations Across Nigeria</h3>
                    <div className="text-sm text-gray-600">
                        {locations.length} active locations
                    </div>
                </div>
                
                {/* Map Placeholder with State-based Visualization */}
                <div className="bg-white rounded-lg shadow-sm p-4 h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
                        {Object.entries(stateGroups).map(([state, stateLocations]) => {
                            const totalVerifications = stateLocations.reduce((sum, loc) => sum + loc.count, 0);
                            const recentActivity = stateLocations.some(loc => 
                                loc.recent_verifications.some(v => 
                                    new Date(v.verified_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                                )
                            );
                            
                            return (
                                <div key={state} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">{state}</h4>
                                        {recentActivity && (
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">{stateLocations.length}</span> cities
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">{totalVerifications}</span> verifications
                                        </div>
                                        
                                        {/* Cities in this state */}
                                        <div className="mt-2">
                                            <div className="text-xs text-gray-500 mb-1">Active Cities:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {stateLocations.slice(0, 3).map(location => (
                                                    <span 
                                                        key={location.id}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                                    >
                                                        {location.city}
                                                        <span className="ml-1 text-blue-600">({location.count})</span>
                                                    </span>
                                                ))}
                                                {stateLocations.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{stateLocations.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Recent activity indicator */}
                                        {recentActivity && (
                                            <div className="text-xs text-green-600 font-medium">
                                                ● Recent activity (24h)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Recent Activity
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Active Location
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        Inactive
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationMap;