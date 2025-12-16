import { Notification } from './notification.model.js';
import mongoose from 'mongoose';
export const createNotification = async (data) => {
    const notification = new Notification(data);
    return await notification.save();
};
export const getUserNotifications = async (userId) => {
    return await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate('sender', 'username avatar email') // Populate sender info
        .populate('relatedId', 'title'); // Populate project title if relatedId is a project
};
export const markAsRead = async (id) => {
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};
export const updateStatus = async (id, status) => {
    return await Notification.findByIdAndUpdate(id, { status, isRead: true }, { new: true });
};
export const findById = async (id) => {
    return await Notification.findById(id);
};
export const deleteAll = async (userId) => {
    return await Notification.deleteMany({ recipient: userId });
};
//# sourceMappingURL=notification.repository.js.map