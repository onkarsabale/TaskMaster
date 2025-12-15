
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationApi from '../api/notification.api';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: notificationApi.getNotifications,
        // Poll every minute or wait for socket updates
        refetchInterval: 60000,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useRespondToInvite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, action }: { id: string; action: 'accept' | 'reject' }) =>
            notificationApi.respondToInvite(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] }); // Refresh projects list
        },
    });
};
