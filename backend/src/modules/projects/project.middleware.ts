import type { Request, Response, NextFunction } from 'express';
import { Project } from './project.model.js';
import mongoose from 'mongoose';

type ProjectAction =
    | 'view_project'
    | 'update_project'
    | 'add_member'
    | 'remove_member'
    | 'create_task'
    | 'assign_task' // PM only
    | 'update_task_status' // PM + Member (if assigned)
    | 'edit_task_details' // PM only
    | 'delete_task'; // PM only

export const checkProjectPermission = (action: ProjectAction) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const projectId = req.params.projectId || req.params.id || req.body.projectId || req.query.projectId;

            if (!projectId) {
                return res.status(400).json({ message: 'Project ID is required for permission check' });
            }

            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            const memberStrId = req.user._id.toString();
            const memberRecord = project.members.find(m => m.user.toString() === memberStrId);

            if (!memberRecord) {
                return res.status(403).json({ message: 'Access denied: Not a project member' });
            }

            const role = memberRecord.role; // 'project_manager' | 'project_member'

            // PM has access to everything
            if (role === 'project_manager') {
                return next();
            }

            // Project Member Validation
            if (role === 'project_member') {
                switch (action) {
                    case 'view_project':
                    case 'update_task_status': // Checked further in controller for assignment? Or allow generic 'status' update here and refine later?
                        // The matrix says: Update task status -> ✅ (assigned only)
                        // This middleware checks *Project level* access. 
                        // For 'update_task_status', we pass here, but the Controller must verify assignment if it's a Member.
                        return next();

                    case 'update_project':
                    case 'add_member':
                    case 'remove_member':
                    case 'create_task':
                    case 'assign_task':
                    case 'edit_task_details':
                    case 'delete_task':
                        return res.status(403).json({ message: `Access denied: Only Project Managers can ${action.replace(/_/g, ' ')}` });

                    default:
                        return res.status(403).json({ message: 'Access denied' });
                }
            }

            return res.status(403).json({ message: 'Access denied' });

        } catch (error) {
            next(error);
        }
    };
};
