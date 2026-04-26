import { Router } from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import * as userController from './user.controller.js';
const router = Router();
router.patch('/profile', protect, userController.updateProfile);
router.get('/search', protect, userController.searchUsers);
// Admin Routes
router.get('/', protect, authorize('admin', 'manager'), userController.getUsers);
router.post('/', protect, authorize('admin', 'manager'), userController.createUser);
router.patch('/:id', protect, authorize('admin', 'manager'), userController.updateUser);
router.delete('/:id', protect, authorize('admin', 'manager'), userController.deleteUser);
export default router;
//# sourceMappingURL=user.routes.js.map