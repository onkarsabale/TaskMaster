import * as notificationService from './notification.service.js';
export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user._id.toString());
        res.json(notifications);
    }
    catch (error) {
        next(error);
    }
};
export const markRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user._id.toString());
        res.json(notification);
    }
    catch (error) {
        next(error);
    }
};
export const respondToInvite = async (req, res, next) => {
    try {
        const { action } = req.body; // 'accept' | 'reject'
        const userId = req.user._id.toString();
        const notification = await notificationService.respondToInvite(req.params.id, action, userId);
        res.json(notification);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=notification.controller.js.map