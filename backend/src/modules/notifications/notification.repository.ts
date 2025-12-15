import { Notification } from './notification.model.js';
import type { INotification } from './notification.model.js';
import mongoose from 'mongoose';

export const createNotification = async (data: Partial<INotification>) => {
    const notification = new Notification(data);
    return await notification.save();
};

export const getUserNotifications = async (userId: string) => {
    return await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate('sender', 'username avatar email') // Populate sender info
        .populate('relatedId', 'title'); // Populate project title if relatedId is a project
};

export const markAsRead = async (id: string) => {
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

export const updateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    return await Notification.findByIdAndUpdate(id, { status, isRead: true }, { new: true });
};

export const findById = async (id: string) => {
    return await Notification.findById(id);
};
