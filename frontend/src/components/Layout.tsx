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

    const navigation = [
        { name: 'Dashboard', href: '/portal/dashboard', current: location.pathname === '/portal/dashboard' },
        { name: 'Products', href: '/portal/products', current: location.pathname.startsWith('/portal/products') },
        { name: 'Batches', href: '/portal/batches', current: location.pathname.startsWith('/portal/batches') },
        { name: 'Analytics', href: '/portal/analytics', current: location.pathname === '/portal/analytics' },
    ];

    // Add role-specific navigation
    if (user?.role === 'REGULATOR') {
        navigation.push({ name: 'Regulator Dashboard', href: '/portal/regulator', current: location.pathname === '/portal/regulator' });
    }
    if (user?.role === 'DISTRIBUTOR' || user?.role === 'PHARMACY') {
        navigation.push({ name: 'Supply Chain', href: '/portal/distributor', current: location.pathname === '/portal/distributor' });
    }
    if (user?.role === 'ADMIN') {
        navigation.push({ name: 'User Management', href: '/portal/users', current: location.pathname === '/portal/users' });
    }

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
                                        className={`${
                                            item.current
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