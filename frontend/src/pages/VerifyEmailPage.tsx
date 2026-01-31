import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'https://drugchain-1.onrender.com';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setError('Invalid or missing verification token');
                setLoading(false);
                return;
            }

            try {
                await axios.post(`${API_URL}/api/v1/auth/verify-email`, { token });
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Email verification failed. The link may have expired.');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center">
                    <h1 className="text-2xl font-bold text-primary-600">PackGuard</h1>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Verification</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Product Verification Platform
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {loading ? (
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            <p className="mt-4 text-gray-600">Verifying your email...</p>
                        </div>
                    ) : success ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                                <div className="flex items-center">
                                    <svg
                                        className="w-6 h-6 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div>
                                        <p className="font-medium">Email verified successfully!</p>
                                        <p className="text-sm mt-1">Redirecting to login page...</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
                                    Go to login now →
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                                <div className="flex items-center">
                                    <svg
                                        className="w-6 h-6 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div>
                                        <p className="font-medium">Verification failed</p>
                                        <p className="text-sm mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <Link to="/login" className="block text-sm text-primary-600 hover:text-primary-500">
                                    Go to login
                                </Link>
                                <Link to="/register" className="block text-sm text-gray-500 hover:text-gray-700">
                                    Create new account
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
