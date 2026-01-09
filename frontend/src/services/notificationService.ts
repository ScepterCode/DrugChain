import api from './api';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    read: boolean;
    created_at: string;
    action_url?: string;
}

export const notificationService = {
    // Get all notifications for current user
    getNotifications: async () => {
        const response = await api.get<{ data: Notification[] }>('/notifications');
        return response.data.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId: string) => {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (notificationId: string) => {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get<{ data: { count: number } }>('/notifications/unread-count');
        return response.data.data.count;
    }
};