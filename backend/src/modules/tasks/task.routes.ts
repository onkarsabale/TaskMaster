import { Router } from 'express';
import * as taskController from './task.controller.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', authorize('admin', 'manager'), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask); // Keep PUT for full updates if needed, mostly PATCH
router.patch('/:id', taskController.updateTask);
router.delete('/:id', authorize('admin'), taskController.deleteTask);

export default router;
