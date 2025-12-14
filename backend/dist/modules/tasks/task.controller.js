import * as taskService from './task.service.js';
import { createTaskSchema, updateTaskSchema } from './task.dto.js';
import { Project } from '../projects/project.model.js';
export const createTask = async (req, res, next) => {
    try {
        const data = createTaskSchema.parse(req.body);
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        // Permission Check: User must be Project Manager to create task
        // We need to look up the project member role
        const project = await Project.findById(data.projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const member = project.members.find(m => m.user.toString() === req.user._id.toString());
        if (!member)
            return res.status(403).json({ message: 'Not a member of this project' });
        if (member.role !== 'project_manager') {
            return res.status(403).json({ message: 'Only Project Managers can create tasks' });
        }
        const task = await taskService.createTask(data, req.user);
        res.status(201).json(task);
    }
    catch (error) {
        next(error);
    }
};
export const getTasks = async (req, res, next) => {
    try {
        const filter = { ...req.query };
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const tasks = await taskService.getTasks(req.user, filter);
        res.status(200).json(tasks);
    }
    catch (error) {
        next(error);
    }
};
export const getTaskById = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const task = await taskService.getTaskById(req.params.id, req.user);
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
};
export const updateTask = async (req, res, next) => {
    try {
        const data = updateTaskSchema.parse(req.body);
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const taskId = req.params.id;
        const task = await taskService.getTaskById(taskId, req.user); // Checks if task exists
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        const project = await Project.findById(task.projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const member = project.members.find(m => m.user.toString() === req.user._id.toString());
        if (!member)
            return res.status(403).json({ message: 'Not a member of this project' });
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
        }
        const updatedTask = await taskService.updateTask(taskId, data, req.user);
        res.status(200).json(updatedTask);
    }
    catch (error) {
        next(error);
    }
};
export const deleteTask = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const taskId = req.params.id;
        const task = await taskService.getTaskById(taskId, req.user);
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        const project = await Project.findById(task.projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const member = project.members.find(m => m.user.toString() === req.user._id.toString());
        if (!member || member.role !== 'project_manager') {
            return res.status(403).json({ message: 'Only Project Managers can delete tasks' });
        }
        await taskService.deleteTask(taskId, req.user);
        res.status(200).json({ message: 'Task deleted' });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=task.controller.js.map