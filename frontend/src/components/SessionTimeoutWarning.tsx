import React from 'react';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

const SessionTimeoutWarning: React.FC = () => {
    const { showWarning, timeLeft, extendSession, forceLogout } = useSessionTimeout();

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mt-4">Session Expiring Soon</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            Your session will expire in <strong>{timeLeft} minute{timeLeft !== 1 ? 's' : ''}</strong>.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Would you like to extend your session?
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={extendSession}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            Extend Session
                        </button>
                        <button
                            onClick={forceLogout}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Logout Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutWarning;