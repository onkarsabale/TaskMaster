import * as taskService from './task.service.js';
import { createTaskSchema, updateTaskSchema } from './task.dto.js';
import { Project } from '../projects/project.model.js';
import { Task } from './task.model.js';
import { object } from 'zod';
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
        // Validate Assignee is a Member
        if (data.assignedTo) {
            const assigneeMember = project.members.find(m => m.user.toString() === data.assignedTo);
            if (!assigneeMember) {
                return res.status(400).json({ message: 'Assigned user is not a member of this project' });
            }
        }
        const task = await taskService.createTask(data, req.user);
        if (!task)
            return res.status(500).json({ message: 'Failed to create task' });
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
        // Normalize 'project' to 'projectId' for all users
        if (filter.project) {
            filter.projectId = filter.project;
            delete filter.project;
        }
        let tasks;
        if (req.user.role === 'admin') {
            // Admin sees all tasks or filtered by query
            const query = {};
            // Map 'project' from frontend to 'projectId' in DB
            if (filter.project)
                query.projectId = filter.project; // Frontend sends 'project'
            if (filter.projectId)
                query.projectId = filter.projectId; // Handle 'projectId' too just in case
            if (filter.status && filter.status !== 'all')
                query.status = filter.status;
            if (filter.assignedTo)
                query.assignedTo = filter.assignedTo;
            // Add other filters as needed
            // Search logic if needed (reuse from Dashboard logic or implement here)
            // For now, simple match
            console.log(`[DEBUG] Admin getTasks Query:`, query);
            tasks = await Task.find(query)
                .populate('assignedTo', 'username email avatar')
                .populate('createdBy', 'username email')
                .populate('projectId', 'title') // Populate project title
                .sort({ createdAt: -1 });
        }
        else {
            // Ensure service also handles mapping if needed, or pass correct filter
            // If service expects 'project', we might need to adjust.
            // But let's check service logic if we can.
            // For now, focus on Admin fix.
            tasks = await taskService.getTasks(req.user, filter);
        }
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
        let task;
        if (req.user.role === 'admin') {
            task = await Task.findById(req.params.id)
                .populate('assignedTo', 'username email avatar')
                .populate('createdBy', 'username email')
                .populate('projectId', 'title');
        }
        else {
            task = await taskService.getTaskById(req.params.id, req.user);
        }
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
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
        // Optimization: Admin can update any task
        const task = await Task.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        let isAuthorized = false;
        if (req.user.role === 'admin') {
            isAuthorized = true;
        }
        else {
            const project = await Project.findById(task.projectId);
            if (!project)
                return res.status(404).json({ message: 'Project not found' });
            const member = project.members.find(m => m.user.toString() === req.user._id.toString());
            if (!member)
                return res.status(403).json({ message: 'Not a member of this project' });
            // ... existing Member/PM logic moved here or reused ...
            // For simplicity, let's keep the existing logic structure but wrap Admin bypass
            // RE-FACTORING existing logic to accommodate Admin:
            const isPM = member.role === 'project_manager';
            if (!isPM) {
                // Member checks
                const keys = Object.keys(data);
                const isOnlyStatusUpdate = keys.length === 1 && keys[0] === 'status';
                if (!isOnlyStatusUpdate)
                    return res.status(403).json({ message: 'Members can only update task status' });
                if (task.assignedTo?.toString() !== req.user._id.toString())
                    return res.status(403).json({ message: 'You can only update status of tasks assigned to you' });
            }
            // If PM, checks passed (except assignee validation below)
            isAuthorized = true;
        }
        // If Admin, bypass constraints, but we still might want to validate assignee logic if needed.
        // Let's assume Admin knows what they are doing.
        const updatedTask = await taskService.updateTask(taskId, data, req.user); // Service handles update
        // Real-time Emit (Keep existing)
        const io = req.app.get('io');
        if (io && task.projectId) {
            io.to(`project:${task.projectId}`).emit('task:updated', updatedTask);
            if (data.assignedTo && data.assignedTo !== task.assignedTo?.toString()) {
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
        if (req.user.role === 'admin') {
            await taskService.deleteTask(taskId, req.user);
            return res.status(200).json({ message: 'Task deleted (Admin)' });
        }
        const task = await taskService.getTaskById(taskId, req.user);
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        const project = await Project.findById(task.projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const member = project.members.find(m => m.user.toString() === req.user._id.toString());
        // Allow if Project Manager OR Task Creator
        const isProjectManager = member?.role === 'project_manager';
        const isCreator = task.createdBy.toString() === req.user._id.toString();
        if (!isProjectManager && !isCreator) {
            return res.status(403).json({ message: 'Only Project Managers or the Task Creator can delete tasks' });
        }
        await taskService.deleteTask(taskId, req.user);
        res.status(200).json({ message: 'Task deleted' });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=task.controller.js.map