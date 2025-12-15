import type { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service.js';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await notificationService.getUserNotifications((req.user!._id as unknown) as string);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id as string, (req.user!._id as unknown) as string);
        res.json(notification);
    } catch (error) {
        next(error);
    }
};

export const respondToInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { action } = req.body; // 'accept' | 'reject'
        const notification = await notificationService.respondToInvite(req.params.id as string, action, (req.user!._id as unknown) as string);
        res.json(notification);
    } catch (error) {
        next(error);
    }
};
