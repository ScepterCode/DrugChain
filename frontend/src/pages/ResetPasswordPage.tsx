import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const API_URL = (import.meta as any).env.VITE_API_URL || 'https://drugchain-1.onrender.com';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/api/v1/auth/reset-password`, {
                token,
                new_password: password,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                            Invalid or missing reset token. Please request a new password reset link.
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                                Request new reset link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center">
                    <h1 className="text-2xl font-bold text-primary-600">PackGuard</h1>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Set new password</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Choose a strong password for your account
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {success ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                                <p className="font-medium">Password reset successful!</p>
                                <p className="text-sm mt-1">Redirecting to login page...</p>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                                <PasswordStrengthIndicator password={password} />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Reset password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
