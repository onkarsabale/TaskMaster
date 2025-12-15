import * as notificationRepo from './notification.repository.js';
import * as projectRepo from '../projects/project.repository.js';
import { AppError } from '../../utils/AppError.js';
import { getIO } from '../../config/socket.js';
export const getUserNotifications = async (userId) => {
    return await notificationRepo.getUserNotifications(userId);
};
export const markAsRead = async (id, userId) => {
    const notification = await notificationRepo.findById(id);
    if (!notification)
        throw new AppError('Notification not found', 404);
    if (notification.recipient.toString() !== userId)
        throw new AppError('Unauthorized', 403);
    return await notificationRepo.markAsRead(id);
};
export const respondToInvite = async (id, action, userId) => {
    const notification = await notificationRepo.findById(id);
    if (!notification)
        throw new AppError('Notification not found', 404);
    if (notification.recipient.toString() !== userId)
        throw new AppError('Unauthorized', 403);
    if (notification.type !== 'PROJECT_INVITE')
        throw new AppError('Not an invitation', 400);
    if (notification.status !== 'pending')
        throw new AppError('Invitation already responded to', 400);
    const updatedNotification = await notificationRepo.updateStatus(id, action === 'accept' ? 'accepted' : 'rejected');
    if (action === 'accept' && notification.relatedId) {
        // Add user to project
        await projectRepo.addMember(notification.relatedId.toString(), userId, 'project_member' // Default role
        );
        // Create notification for the sender (Project Manager)
        const recipientUser = notification.recipient; // The one who accepted
        await createNotification({
            recipient: notification.sender, // The manager
            sender: notification.recipient, // The acceptor
            type: 'INVITE_ACCEPTED',
            relatedId: notification.relatedId,
            message: `User accepted your invitation to join the project.`,
            status: 'none'
        });
    }
    return updatedNotification;
};
export const createNotification = async (data) => {
    const notification = await notificationRepo.createNotification(data);
    // Real-time Emit
    const io = getIO();
    // We need to populate to send useful data immediately
    const populated = await notification.populate('sender', 'username avatar');
    io.to(`user:${data.recipient}`).emit('notification:new', populated);
    return notification;
};
//# sourceMappingURL=notification.service.js.map