import * as taskRepo from './task.repository.js';
import * as authRepo from '../auth/auth.repository.js';
import { getIO } from '../../config/socket.js';
import { AppError } from '../../utils/AppError.js';
export const createTask = async (data, user) => {
    // Permission handled by Controller based on Project Role
    if (data.assignedTo && data.assignedTo.includes('@')) {
        const user = await authRepo.findUserByEmail(data.assignedTo);
        if (!user)
            throw new AppError(`User with email ${data.assignedTo} not found`, 404);
        data.assignedTo = user._id;
    }
    const task = await taskRepo.createTask(data, user._id);
    const populatedTask = await taskRepo.findTaskById(task._id);
    // Broadcast to Admins, Managers, and Assignee
    const io = getIO();
    io.to('room:admins').to('room:managers').emit('task:created', populatedTask);
    if (populatedTask?.assignedTo) {
        const assigneeId = populatedTask.assignedTo._id || populatedTask.assignedTo;
        io.to(`user:${assigneeId}`).emit('task:created', populatedTask);
    }
    return populatedTask;
};
export const getTasks = async (user, filter = {}) => {
    // Visibility Rules
    // ADMIN: All
    // MANAGER: All (Simpler option per prompt)
    // USER: Assigned to them OR Created by them
    let query = { ...filter };
    if (user.role === 'user') {
        const userId = user._id;
        // If filter already has criteria, we must AND it with visibility rule
        // Mongoose query for "Assigned OR Created"
        query = {
            ...query,
            $or: [{ assignedTo: userId }, { createdBy: userId }]
        };
    }
    if (filter.assignedTo && filter.assignedTo.includes('@')) {
        const assignedUser = await authRepo.findUserByEmail(filter.assignedTo);
        if (!assignedUser) {
            return [];
        }
        query.assignedTo = assignedUser._id;
        delete query.assignedTo.includes; // clean up if needed, though ...filter handles it
    }
    // Explicitly delete complex filter fields passed from controller if they conflict or are raw
    // For now assuming filter is clean or just contains status/priority etc.
    return await taskRepo.findTasks(query);
};
export const getTaskById = async (id, user) => {
    const task = await taskRepo.findTaskById(id);
    if (!task)
        throw new AppError('Task not found', 404);
    // Visibility Check
    if (user.role === 'user') {
        const isAssignee = String(task.assignedTo?._id || task.assignedTo) === String(user._id);
        const isCreator = String(task.createdBy?._id || task.createdBy) === String(user._id);
        if (!isAssignee && !isCreator) {
            throw new AppError('Task not found', 404); // Hide existence
        }
    }
    return task;
};
export const updateTask = async (id, data, user) => {
    const existingTask = await taskRepo.findTaskById(id);
    if (!existingTask)
        throw new AppError('Task not found', 404);
    // Permission checks are now handled in the controller (Project Level)
    if (data.assignedTo && data.assignedTo.includes('@')) {
        const user = await authRepo.findUserByEmail(data.assignedTo);
        if (!user)
            throw new AppError(`User with email ${data.assignedTo} not found`, 404);
        data.assignedTo = user._id;
    }
    const task = await taskRepo.updateTask(id, data);
    if (!task)
        throw new AppError('Task not found', 404);
    // Real-time Broadcasting
    const io = getIO();
    const assigneeId = task.assignedTo ? (task.assignedTo._id || task.assignedTo) : null;
    const creatorId = task.createdBy ? (task.createdBy._id || task.createdBy) : null;
    // 1. Task Updated -> Admins, Managers, Assignee, Creator
    io.to('room:admins').to('room:managers').emit('task:updated', task);
    if (assigneeId)
        io.to(`user:${assigneeId}`).emit('task:updated', task);
    if (creatorId && String(creatorId) !== String(assigneeId))
        io.to(`user:${creatorId}`).emit('task:updated', task);
    // 2. Assignment Changed -> Notify new assignee specifically
    if (data.assignedTo) {
        const notificationPayload = {
            taskId: task._id,
            assignedTo: assigneeId,
            taskTitle: task.title,
            message: `You have been assigned to task: ${task.title}`
        };
        io.to('room:admins').to('room:managers').emit('task:assigned', notificationPayload);
        if (assigneeId) {
            io.to(`user:${assigneeId}`).emit('task:assigned', notificationPayload);
            io.to(`user:${assigneeId}`).emit('notification:assignment', notificationPayload);
        }
    }
    return task;
};
export const deleteTask = async (id, user) => {
    // Permission handled by Controller based on Project Role
    const task = await taskRepo.deleteTask(id);
    if (!task)
        throw new AppError('Task not found', 404);
    const io = getIO();
    const assigneeId = task.assignedTo ? (task.assignedTo._id || task.assignedTo) : null;
    const creatorId = task.createdBy ? (task.createdBy._id || task.createdBy) : null;
    // Broadcast Delete -> Admins, Managers, Assignee, Creator
    io.to('room:admins').to('room:managers').emit('task:deleted', id);
    if (assigneeId)
        io.to(`user:${assigneeId}`).emit('task:deleted', id);
    if (creatorId && String(creatorId) !== String(assigneeId))
        io.to(`user:${creatorId}`).emit('task:deleted', id);
    return { message: 'Task deleted' };
};
//# sourceMappingURL=task.service.js.map