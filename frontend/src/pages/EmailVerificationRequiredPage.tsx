import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const EmailVerificationRequiredPage: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const handleResendVerification = async () => {
        if (!user?.email) return;

        setIsResending(true);
        setResendMessage('');

        try {
            const response = await fetch('https://drugchain-1.onrender.com/api/v1/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email }),
            });

            if (response.ok) {
                setResendMessage('Verification email sent! Please check your inbox and spam folder.');
            } else {
                setResendMessage('Failed to send verification email. Please try again.');
            }
        } catch (error) {
            setResendMessage('Failed to send verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Email Verification Required
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Please verify your email to access this feature
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                            We've sent a verification email to:
                        </p>
                        <p className="text-sm font-medium text-gray-900 mb-6">
                            {user?.email}
                        </p>
                        
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Please check your inbox and click the verification link to continue.
                            </p>
                            
                            {resendMessage && (
                                <div className={`p-3 rounded-md text-sm ${
                                    resendMessage.includes('sent') 
                                        ? 'bg-green-50 text-green-700 border border-green-200' 
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    {resendMessage}
                                </div>
                            )}
                            
                            <button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {isResending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                            
                            <div className="text-center">
                                <Link 
                                    to="/portal/dashboard" 
                                    className="text-sm text-primary-600 hover:text-primary-500"
                                >
                                    ← Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationRequiredPage;