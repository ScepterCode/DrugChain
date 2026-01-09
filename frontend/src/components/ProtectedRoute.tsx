import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchCurrentUser } from '../store/authSlice';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // If there's a token but no user, try to fetch user
        if (authService.isAuthenticated() && !user && !isAuthenticated) {
            dispatch(fetchCurrentUser());
        }
    }, [user, isAuthenticated, dispatch]);

    // If no token, redirect to login
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // If token exists but not authenticated in state, show loading
    if (authService.isAuthenticated() && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
