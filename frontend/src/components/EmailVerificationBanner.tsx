import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { authService } from '../services/authService';

const EmailVerificationBanner: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [showBanner, setShowBanner] = useState(true);

    // Don't show banner if user is verified or not logged in
    if (!user || user.is_verified || !showBanner) {
        return null;
    }

    const handleResendVerification = async () => {
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
                setResendMessage('Verification email sent! Please check your inbox.');
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm text-yellow-700">
                        <strong>Email verification required:</strong> Please verify your email address to access all features.
                        {resendMessage && (
                            <span className={`ml-2 ${resendMessage.includes('sent') ? 'text-green-700' : 'text-red-700'}`}>
                                {resendMessage}
                            </span>
                        )}
                    </p>
                    <div className="mt-2 flex space-x-3">
                        <button
                            onClick={handleResendVerification}
                            disabled={isResending}
                            className="text-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 rounded-md font-medium disabled:opacity-50"
                        >
                            {isResending ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                        <button
                            onClick={() => setShowBanner(false)}
                            className="text-sm text-yellow-700 hover:text-yellow-600 font-medium"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationBanner;