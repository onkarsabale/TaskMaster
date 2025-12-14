import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
let io;
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true,
        },
    });
    io.use((socket, next) => {
        let token = socket.handshake.auth.token;
        // Also check cookies if token not in auth object (optional, depends on client impl)
        if (!token && socket.handshake.headers.cookie) {
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            token = cookies.jwt;
        }
        if (token) {
            try {
                const decoded = jwt.verify(token, env.JWT_SECRET);
                socket.user = decoded; // Attach user to socket
                next();
            }
            catch (err) {
                next(new Error('Authentication error'));
            }
        }
        else {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);
        const user = socket.user;
        if (user) {
            // Join User Room (for private notifications)
            socket.join(`user:${user.userId}`);
            // Join Role Room (for board broadcasts)
            // Admins need to see everything, Managers need to see mostly everything
            if (user.role === 'admin')
                socket.join('room:admins');
            if (user.role === 'manager')
                socket.join('room:managers');
            logger.info(`User ${user.userId} joined rooms: user:${user.userId}, room:${user.role}s`);
            // Handle Project Rooms
            socket.on('join:project', async (projectId) => {
                try {
                    // Lazy import to avoid circular dep issues if any, or just standard import
                    const { Project } = await import('../modules/projects/project.model.js');
                    const project = await Project.findById(projectId);
                    if (project) {
                        const isMember = user.role === 'admin' || project.members.some(m => m.user.toString() === user.userId)
                            || project.owner.toString() === user.userId;
                        if (isMember) {
                            socket.join(`project:${projectId}`);
                            logger.info(`User ${user.userId} joined project room: project:${projectId}`);
                            socket.emit('joined:project', projectId);
                        }
                        else {
                            logger.warn(`User ${user.userId} attempted to join project ${projectId} but is not a member`);
                            socket.emit('error', 'Not authorized to join this project room');
                        }
                    }
                }
                catch (error) {
                    logger.error(`Error joining project room: ${error}`);
                }
            });
            socket.on('leave:project', (projectId) => {
                socket.leave(`project:${projectId}`);
                logger.info(`User ${user.userId} left project room: project:${projectId}`);
            });
        }
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
//# sourceMappingURL=socket.js.map