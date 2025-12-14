import type { Request, Response, NextFunction } from 'express';
import * as taskService from './task.service.js';
import { createTaskSchema, updateTaskSchema } from './task.dto.js';
import { Project } from '../projects/project.model.js';
import { object } from 'zod';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createTaskSchema.parse(req.body);
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        // Permission Check: User must be Project Manager to create task
        // We need to look up the project member role
        const project = await Project.findById(data.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const member = project.members.find(m => m.user.toString() === req.user!._id.toString());
        if (!member) return res.status(403).json({ message: 'Not a member of this project' });

        if (member.role !== 'project_manager') {
            return res.status(403).json({ message: 'Only Project Managers can create tasks' });
        }

        // Validate Assignee is a Member
        if (data.assignedTo) {
            const assigneeMember = project.members.find(m => m.user.toString() === data.assignedTo);
            if (!assigneeMember) {
                return res.status(400).json({ message: 'Assigned user is not a member of this project' });
            }
        }

        const task = await taskService.createTask(data, req.user);
        if (!task) return res.status(500).json({ message: 'Failed to create task' });

        // Real-time Emit
        const io = req.app.get('io');
        if (io && data.projectId) {
            io.to(`project:${data.projectId}`).emit('task:created', task);

            // Notify Assignee if exists
            if (task.assignedTo) {
                const assignedId = typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo;
                // Don't notify if assigning to self
                if (assignedId.toString() !== req.user._id.toString()) {
                    io.to(`user:${assignedId}`).emit('notification:assigned', {
                        message: `You have been assigned a new task: ${task.title}`,
                        taskId: task._id,
                        projectId: data.projectId
                    });
                }
            }
        }

        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter = { ...req.query };
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const tasks = await taskService.getTasks(req.user, filter);
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const task = await taskService.getTaskById(req.params.id as string, req.user);
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = updateTaskSchema.parse(req.body);
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const taskId = req.params.id as string;
        const task = await taskService.getTaskById(taskId, req.user); // Checks if task exists
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findById(task.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const member = project.members.find(m => m.user.toString() === req.user!._id.toString());
        if (!member) return res.status(403).json({ message: 'Not a member of this project' });

        // Logic:
        // PM -> Can update everything.
        // Member -> Can ONLY update status, AND ONLY if assigned to them.

        const isPM = member.role === 'project_manager';

        if (!isPM) {
            // Member checks
            // 1. Check if allowed action (only status update allowed for members)
            const keys = Object.keys(data);
            const isOnlyStatusUpdate = keys.length === 1 && keys[0] === 'status';

            if (!isOnlyStatusUpdate) {
                return res.status(403).json({ message: 'Members can only update task status' });
            }

            // 2. Check assignment
            if (task.assignedTo?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You can only update status of tasks assigned to you' });
            }
        } else {
            // PM Restrictions
            // If PM is assigning a task, validate the assignee is a project member
            if (data.assignedTo) {
                const assigneeMember = project.members.find(m => m.user.toString() === data.assignedTo);
                if (!assigneeMember) {
                    return res.status(400).json({ message: 'Assigned user is not a member of this project' });
                }
            }
        }

        const updatedTask = await taskService.updateTask(taskId, data, req.user);

        // Real-time Emit
        const io = req.app.get('io');
        if (io && task.projectId) {
            // Note: task.projectId comes from the fetched task before update. 
            // If project can be changed, we might need updatedTask.projectId, but usually tasks don't move projects easily.
            // Assuming task.projectId is stable or updatedTask has it.

            io.to(`project:${task.projectId}`).emit('task:updated', updatedTask);

            // Check for new assignment
            if (data.assignedTo && data.assignedTo !== task.assignedTo?.toString()) {
                // Don't notify if assigning to self (unless desired)
                if (data.assignedTo !== req.user._id.toString()) {
                    io.to(`user:${data.assignedTo}`).emit('notification:assigned', {
                        message: `You have been assigned to task: ${updatedTask?.title}`,
                        taskId: updatedTask?._id,
                        projectId: task.projectId
                    });
                }
            }
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const taskId = req.params.id as string;
        const task = await taskService.getTaskById(taskId, req.user);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findById(task.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const member = project.members.find(m => m.user.toString() === req.user!._id.toString());

        if (!member || member.role !== 'project_manager') {
            return res.status(403).json({ message: 'Only Project Managers can delete tasks' });
        }

        await taskService.deleteTask(taskId, req.user);
        res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
        next(error);
    }
};
