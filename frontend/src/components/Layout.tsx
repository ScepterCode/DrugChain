import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import NotificationDropdown from './NotificationDropdown';
import BlockchainStatus from './BlockchainStatus';

const Layout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const getNavigationForRole = (userRole: string) => {
        const baseNavigation = [
            { name: 'Dashboard', href: '/portal/dashboard', current: location.pathname === '/portal/dashboard' }
        ];

        switch (userRole) {
            case 'MANUFACTURER':
            case 'ELECTRONICS_MANUFACTURER':
            case 'LUXURY_BRAND':
            case 'FOOD_PRODUCER':
            case 'AUTOMOTIVE_OEM':
            case 'COSMETICS_MANUFACTURER':
                return [
                    ...baseNavigation,
                    { name: 'Products', href: '/portal/products', current: location.pathname.startsWith('/portal/products') },
                    { name: 'Batches', href: '/portal/batches', current: location.pathname.startsWith('/portal/batches') },
                    { name: 'Analytics', href: '/portal/analytics', current: location.pathname === '/portal/analytics' }
                ];

            case 'DISTRIBUTOR':
                return [
                    ...baseNavigation,
                    { name: 'Supply Chain', href: '/portal/distributor', current: location.pathname === '/portal/distributor' },
                    { name: 'Analytics', href: '/portal/analytics', current: location.pathname === '/portal/analytics' }
                ];

            case 'REGULATOR':
                return [
                    ...baseNavigation,
                    { name: 'Verification', href: '/portal/verify', current: location.pathname === '/portal/verify' },
                    { name: 'Analytics', href: '/portal/analytics', current: location.pathname === '/portal/analytics' },
                    { name: 'Search & Investigation', href: '/portal/search', current: location.pathname === '/portal/search' }
                ];

            case 'ADMIN':
            case 'SYSTEM_ADMIN':
                return [
                    ...baseNavigation,
                    { name: 'Products', href: '/portal/products', current: location.pathname.startsWith('/portal/products') },
                    { name: 'Batches', href: '/portal/batches', current: location.pathname.startsWith('/portal/batches') },
                    { name: 'Analytics', href: '/portal/analytics', current: location.pathname === '/portal/analytics' },
                    { name: 'User Management', href: '/portal/users', current: location.pathname === '/portal/users' }
                ];

            case 'RETAILER':
            case 'MARKETPLACE':
                return [
                    ...baseNavigation,
                    { name: 'Verification', href: '/portal/verify', current: location.pathname === '/portal/verify' },
                    { name: 'Analytics', href: '/portal/analytics', current: location.pathname === '/portal/analytics' }
                ];

            case 'CONSUMER':
                return [
                    ...baseNavigation,
                    { name: 'Verification', href: '/portal/verify', current: location.pathname === '/portal/verify' }
                ];

            default:
                return baseNavigation;
        }
    };

    const navigation = getNavigationForRole(user?.role || 'CONSUMER');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/portal/dashboard" className="text-2xl font-bold text-primary-600">
                                    PackGuard
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`${item.current
                                            ? 'border-primary-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-4">
                                    <BlockchainStatus />
                                    <NotificationDropdown />
                                    <span className="text-sm text-gray-700">
                                        {user?.full_name || user?.email}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                        {user?.role}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;