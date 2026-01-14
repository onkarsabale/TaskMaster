import type { Request, Response } from 'express';
import * as projectService from './project.service.js';
import { Project } from './project.model.js';
import * as notificationService from '../notifications/notification.service.js';
import { logger } from '../../utils/logger.js';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        // @ts-ignore - user is attached by auth middleware
        const userId = req.user!._id.toString();
        const project = await projectService.createProject(title, description, userId);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
};

export const getMyProjects = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user!._id.toString();
        const userRole = req.user!.role;
        logger.debug(`getMyProjects - User: ${userId}, Role: ${userRole}`);

        let projects;
        if (userRole === 'admin') {
            projects = await Project.find().populate('owner', 'username email').populate('members.user', 'username email');
            logger.debug(`Admin fetching all projects. Count: ${projects.length}`);
        } else {
            projects = await projectService.getUserProjects(userId);
            logger.debug(`User fetching own projects. Count: ${projects.length}`);
        }
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'Project ID is required' });

        const project = await projectService.getProjectById(id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // @ts-ignore
        const userRole = req.user.role;
        // @ts-ignore
        const userId = req.user._id.toString();

        // 1. Admin bypass
        if (userRole === 'admin') {
            // Admin access allowed
        } else {
            // 2. Members check
            const isMember = project.members.some(member => member.user._id.toString() === userId);
            // 3. Owner check (just in case owner isn't in members list, though they should be)
            const isOwner = project.owner._id.toString() === userId;

            if (!isMember && !isOwner) {
                return res.status(403).json({ message: 'Access denied: You are not a member of this project' });
            }
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error });
    }
};

export const addMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.body;
        if (!id) return res.status(400).json({ message: 'Project ID is required' });
        const project = await projectService.addMember(id, userId, role);
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error adding member', error });
    }
};

export const inviteMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        // @ts-ignore
        const senderId = req.user!._id.toString();

        if (!id) return res.status(400).json({ message: 'Project ID is required' });
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const result = await projectService.inviteUserToProject(id, email, senderId);
        res.json(result);
    } catch (error) {
        if (error instanceof Error && (error as any).statusCode) {
            res.status((error as any).statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error sending invitation', error });
        }
    }
};
