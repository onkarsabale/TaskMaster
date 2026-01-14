import type { Request, Response, NextFunction } from 'express';
import { Project } from '../modules/projects/project.model.js';
import { AppError } from '../utils/AppError.js'; // Assuming AppError is in utils based on module list

export const checkProjectPermission = (requiredRole?: 'project_manager' | 'project_member') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            const user = req.user;
            if (!user) {
                return next(new AppError('Authentication required', 401));
            }

            // Admin has global access
            if (user.role === 'admin') {
                return next();
            }

            const projectId = req.params.projectId || req.params.id || req.body.projectId;

            if (!projectId) {
                return next(new AppError('Project ID is required', 400));
            }

            const project = await Project.findById(projectId);
            if (!project) {
                return next(new AppError('Project not found', 404));
            }

            // Global Manager can access everything? Or just create projects?
            // "Global MANAGER: Can create projects" - implies they might not have access to ALL projects unless they are members?
            // "Final permission = Global role + Project role"
            // Let's assume Global Manager has implicit access or purely creation rights. 
            // The prompt says "Final permission = Global role + Project role".
            // If I am a Global Manager, do I automatically get PM access? Usually yes or no. 
            // Let's stick to explicit membership for non-admins to be safe, 
            // BUT if they are the owner they are added as PM.

            const member = project.members.find(m => m.user.toString() === user._id.toString());

            if (!member) {
                return next(new AppError('You are not a member of this project', 403));
            }

            if (requiredRole === 'project_manager' && member.role !== 'project_manager') {
                return next(new AppError('Insufficient project permissions', 403));
            }

            // Attach project to request for downstream use
            // @ts-ignore
            req.project = project;
            next();
        } catch (error) {
            next(error);
        }
    };
};
