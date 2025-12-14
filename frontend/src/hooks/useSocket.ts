import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../hooks/useToast';
import type { Task } from '../types';



// Helper to get socket instance
let socket: Socket | null = null;
const URL = import.meta.env.VITE_API_URL;

export const getSocket = () => socket;

export const joinProjectRoom = (projectId: string) => {
    if (!socket) return;

    if (socket.connected) {
        socket.emit('join:project', projectId);
    } else {
        socket.once('connect', () => {
            socket?.emit('join:project', projectId);
        });
    }
};

export const leaveProjectRoom = (projectId: string) => {
    if (socket) {
        socket.emit('leave:project', projectId);
        socket.off('connect'); // Remove any pending join listeners if distinct
        // Note: socket.off('connect') removes ALL connect listeners which might be bad if other things rely on it.
        // Better to just emit leave. If not connected, it doesn't matter (server handles disconnect).
    }
};

export const useSocket = () => {
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
            return;
        }

        if (!socket) {
            socket = io(URL, {
                withCredentials: true,
                autoConnect: true,
            });
        }

        if (!socket.connected) {
            socket.connect();
        }

        // Cache Optimizations & Event Handlers
        const handleTaskCreated = (data: Task) => {
            // Invalidate queries to be safe across project lists
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskUpdated = (data: Task) => {
            queryClient.setQueryData(['tasks', data._id], data); // Update detail view
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh lists
        };

        const handleNotificationAssigned = (data: { message: string, taskId: string, projectId: string }) => {
            showToast(data.message, 'info');
            // Also invalidate "My Tasks"
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        socket.on('task:created', handleTaskCreated);
        socket.on('task:updated', handleTaskUpdated);
        socket.on('notification:assigned', handleNotificationAssigned);

        return () => {
            // Cleanup listeners on unmount (or re-run)
            if (socket) {
                socket.off('task:created', handleTaskCreated);
                socket.off('task:updated', handleTaskUpdated);
                socket.off('notification:assigned', handleNotificationAssigned);
            }
        };
    }, [isAuthenticated, user, queryClient, showToast]);

    return { socket, joinProjectRoom, leaveProjectRoom };
};
