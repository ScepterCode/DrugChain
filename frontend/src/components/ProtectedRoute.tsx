import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireEmailVerification?: boolean;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requireEmailVerification = false,  // Kept for compatibility but not enforced
    allowedRoles 
}) => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/portal/dashboard" replace />;
    }

    // Email verification check disabled - all users can access all features
    // if (requireEmailVerification && !user.is_verified) {
    //     return <Navigate to="/portal/verify-email-required" replace />;
    // }

    return <>{children}</>;
};

export default ProtectedRoute;