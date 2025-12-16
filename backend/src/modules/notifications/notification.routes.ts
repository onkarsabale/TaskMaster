import { Router } from 'express';
import * as notificationController from './notification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(protect); // All routes protected

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markRead);
router.post('/:id/respond', notificationController.respondToInvite);
router.delete('/', notificationController.clearNotifications);

export default router;
