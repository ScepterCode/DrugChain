import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

interface SessionTimeoutConfig {
    warningTime: number; // Minutes before expiry to show warning
    sessionDuration: number; // Total session duration in minutes
}

export const useSessionTimeout = (config: SessionTimeoutConfig = { warningTime: 5, sessionDuration: 60 }) => {
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const getTokenExpiry = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            // Decode JWT token to get expiry
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000; // Convert to milliseconds
        } catch {
            return null;
        }
    }, []);

    const extendSession = useCallback(() => {
        // In a real app, you'd refresh the token here
        // For now, we'll just hide the warning
        setShowWarning(false);
        setTimeLeft(0);
    }, []);

    const forceLogout = useCallback(() => {
        dispatch(logout());
        setShowWarning(false);
        setTimeLeft(0);
    }, [dispatch]);

    useEffect(() => {
        if (!isAuthenticated) {
            setShowWarning(false);
            setTimeLeft(0);
            return;
        }

        const checkSession = () => {
            const expiry = getTokenExpiry();
            if (!expiry) return;

            const now = Date.now();
            const timeUntilExpiry = expiry - now;
            const warningThreshold = config.warningTime * 60 * 1000; // Convert to milliseconds

            if (timeUntilExpiry <= 0) {
                // Session expired
                forceLogout();
            } else if (timeUntilExpiry <= warningThreshold) {
                // Show warning
                setShowWarning(true);
                setTimeLeft(Math.ceil(timeUntilExpiry / 1000 / 60)); // Minutes left
            } else {
                setShowWarning(false);
                setTimeLeft(0);
            }
        };

        // Check immediately
        checkSession();

        // Check every minute
        const interval = setInterval(checkSession, 60000);

        return () => clearInterval(interval);
    }, [isAuthenticated, config.warningTime, getTokenExpiry, forceLogout]);

    return {
        showWarning,
        timeLeft,
        extendSession,
        forceLogout
    };
};