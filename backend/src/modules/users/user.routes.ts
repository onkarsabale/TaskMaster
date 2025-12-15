import { Router } from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import * as userController from './user.controller.js';

const router = Router();

router.patch('/profile', protect, userController.updateProfile);
router.get('/search', protect, userController.searchUsers);

// Admin Routes
router.get('/', protect, authorize('admin'), userController.getUsers);
router.post('/', protect, authorize('admin'), userController.createUser);
router.patch('/:id', protect, authorize('admin'), userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

export default router;
