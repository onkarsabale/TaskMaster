
import api from './client';
import type { Notification } from '../types/notification';

export const getNotifications = async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications');
    return data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
};

export const respondToInvite = async (id: string, action: 'accept' | 'reject'): Promise<Notification> => {
    const { data } = await api.post(`/notifications/${id}/respond`, { action });
    return data;
};
