import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';

const Navbar: React.FC = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-bold text-primary-600">DrugChain</span>
                        </Link>
                        {isAuthenticated && (
                            <div className="ml-10 flex items-center space-x-4">
                                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                                    Dashboard
                                </Link>
                                {user?.role === 'MANUFACTURER' && (
                                    <>
                                        <Link to="/products" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                                            Products
                                        </Link>
                                        <Link to="/batches" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                                            Batches
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-gray-700">
                                    {user?.full_name} ({user?.role})
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
