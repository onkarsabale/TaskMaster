import { Router } from 'express';
import * as projectController from './project.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { checkProjectPermission } from './project.middleware.js';
const router = Router();
router.use(protect); // Protect all project routes
router.post('/', projectController.createProject); // Anyone authenticated can create a project (implied)
router.get('/', projectController.getMyProjects);
router.get('/:id', checkProjectPermission('view_project'), projectController.getProject);
router.post('/:id/members', checkProjectPermission('add_member'), projectController.addMember); // Keep simple add for now? Or remove?
router.post('/:id/invite', checkProjectPermission('add_member'), projectController.inviteMember);
// Future: router.delete('/:id/members/:userId', checkProjectPermission('remove_member'), projectController.removeMember);
// Future: router.put('/:id', checkProjectPermission('update_project'), projectController.updateProject);
export default router;
//# sourceMappingURL=project.routes.js.map