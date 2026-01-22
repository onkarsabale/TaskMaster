import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import type { Task, Notification } from '../types';
import { SOCKET_URL } from './socket.config';
import { SocketContext } from './SocketContext';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [socket] = React.useState<Socket | null>(null);

    useEffect(() => {
        let socketInstance: Socket | null = null;

        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
            }
            return;
        }

        if (!socket) {
            socketInstance = io(SOCKET_URL, {
                withCredentials: true,
                autoConnect: true,
            });
            // Don't call setSocket here - let the instance be used locally
        } else {
            socketInstance = socket;
        }

        if (!socketInstance.connected) {
            socketInstance.connect();
        }

        // Join User Room
        socketInstance.emit('join:user', user._id);

        // Cache Optimizations & Event Handlers
        const handleTaskCreated = () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskUpdated = (data: Task) => {
            queryClient.setQueryData(['tasks', data._id], data);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleNotificationAssigned = (data: { message: string, taskId: string, projectId: string }) => {
            showToast(`🔔 ${data.message}`, 'info');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        const handleNewNotification = (data: Notification) => {
            const message = data.type === 'TASK_ASSIGNED'
                ? `📋 New Task: ${data.message}`
                : data.type === 'PROJECT_INVITE'
                    ? `📩 ${data.message}`
                    : `🔔 ${data.message || 'New notification received'}`;
            showToast(message, 'info');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        socketInstance.on('task:created', handleTaskCreated);
        socketInstance.on('task:updated', handleTaskUpdated);
        socketInstance.on('notification:assigned', handleNotificationAssigned);
        socketInstance.on('notification:new', handleNewNotification);

        return () => {
            if (socketInstance) {
                socketInstance.off('task:created', handleTaskCreated);
                socketInstance.off('task:updated', handleTaskUpdated);
                socketInstance.off('notification:assigned', handleNotificationAssigned);
                socketInstance.off('notification:new', handleNewNotification);
            }
        };
    }, [isAuthenticated, user, socket, queryClient, showToast]);

    const joinProjectRoom = (projectId: string) => {
        if (socket?.connected) {
            socket.emit('join:project', projectId);
        } else {
            socket?.once('connect', () => {
                socket.emit('join:project', projectId);
            });
        }
    };

    const leaveProjectRoom = (projectId: string) => {
        if (socket) {
            socket.emit('leave:project', projectId);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, joinProjectRoom, leaveProjectRoom }}>
            {children}
        </SocketContext.Provider>
    );
};
