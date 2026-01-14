import React from 'react';
import { useAppSelector } from '../store/hooks';
import RegulatorDashboard from '../pages/RegulatorDashboard';
import DistributorDashboard from '../pages/DistributorDashboard';
import ManufacturerDashboard from './dashboards/ManufacturerDashboard';
import ConsumerDashboard from './dashboards/ConsumerDashboard';
import RetailerDashboard from './dashboards/RetailerDashboard';

const RoleBasedDashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);

    const renderDashboardByRole = () => {
        switch (user?.role) {
            case 'MANUFACTURER':
            case 'ELECTRONICS_MANUFACTURER':
            case 'LUXURY_BRAND':
            case 'FOOD_PRODUCER':
            case 'AUTOMOTIVE_OEM':
            case 'COSMETICS_MANUFACTURER':
                return <ManufacturerDashboard />;
            
            case 'DISTRIBUTOR':
            case 'PHARMACY':
                return <DistributorDashboard />;
            
            case 'REGULATOR':
            case 'SYSTEM_ADMIN':
                return <RegulatorDashboard />;
            
            case 'RETAILER':
            case 'MARKETPLACE':
                return <RetailerDashboard />;
            
            case 'CONSUMER':
                return <ConsumerDashboard />;
            
            case 'ADMIN':
                return <RegulatorDashboard />; // Admins get full access
            
            default:
                return <ConsumerDashboard />; // Default to consumer view
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {renderDashboardByRole()}
        </div>
    );
};

export default RoleBasedDashboard;