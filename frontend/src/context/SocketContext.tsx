import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import type { Task, Notification } from '../types';

interface SocketContextType {
    socket: Socket | null;
    joinProjectRoom: (projectId: string) => void;
    leaveProjectRoom: (projectId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Strip trailing /api for socket connection if necessary, 
// usually socket.io prefix is handled by server, but we need the base URL.
const SOCKET_URL = URL.replace(/\/api$/, '');

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                withCredentials: true,
                autoConnect: true,
            });
        }

        const socket = socketRef.current;

        if (!socket.connected) {
            socket.connect();
        }

        // Join User Room
        socket.emit('join:user', user._id);

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
            // Show toast for new notifications (project invites, task assignments, etc.)
            const message = data.type === 'TASK_ASSIGNED'
                ? `📋 New Task: ${data.message}`
                : data.type === 'PROJECT_INVITE'
                    ? `📩 ${data.message}`
                    : `🔔 ${data.message || 'New notification received'}`;
            showToast(message, 'info');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        socket.on('task:created', handleTaskCreated);
        socket.on('task:updated', handleTaskUpdated);
        socket.on('notification:assigned', handleNotificationAssigned);
        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('task:created', handleTaskCreated);
            socket.off('task:updated', handleTaskUpdated);
            socket.off('notification:assigned', handleNotificationAssigned);
            socket.off('notification:new', handleNewNotification);
        };
    }, [isAuthenticated, user, queryClient, showToast]);

    const joinProjectRoom = (projectId: string) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('join:project', projectId);
        } else {
            socketRef.current?.once('connect', () => {
                socketRef.current?.emit('join:project', projectId);
            });
        }
    };

    const leaveProjectRoom = (projectId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('leave:project', projectId);
        }
    };

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, joinProjectRoom, leaveProjectRoom }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};
