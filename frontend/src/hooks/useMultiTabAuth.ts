import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

export const useMultiTabAuth = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // If access_token is removed from localStorage (logout in another tab)
            if (e.key === 'access_token' && e.newValue === null && isAuthenticated) {
                dispatch(logout());
            }
            
            // If a new token is set (login in another tab), we could refresh the current user
            if (e.key === 'access_token' && e.newValue && !isAuthenticated) {
                // Optionally refresh the page or fetch current user
                window.location.reload();
            }
        };

        // Listen for localStorage changes from other tabs
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [dispatch, isAuthenticated]);

    const logoutAllTabs = () => {
        // This will trigger the storage event in all other tabs
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        dispatch(logout());
    };

    return { logoutAllTabs };
};