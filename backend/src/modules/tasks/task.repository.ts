import { Task } from './task.model.js';
import type { ITask } from './task.model.js';
import type { CreateTaskDto, UpdateTaskDto } from './task.dto.js';

export const createTask = async (data: CreateTaskDto, userId: string): Promise<ITask> => {
    const task = new Task({ ...data, createdBy: userId, assignedTo: data.assignedTo || userId });
    return await task.save();
};

export const findTasks = async (filter: any): Promise<ITask[]> => {
    return await Task.find(filter).populate('assignedTo', 'username email').populate('createdBy', 'username email').sort({ createdAt: -1 });
};

export const findTaskById = async (id: string): Promise<ITask | null> => {
    return await Task.findById(id).populate('assignedTo', 'username email').populate('createdBy', 'username email');
};

export const updateTask = async (id: string, data: UpdateTaskDto): Promise<ITask | null> => {
    return await Task.findByIdAndUpdate(id, data, { new: true }).populate('assignedTo', 'username email').populate('createdBy', 'username email');
};

export const deleteTask = async (id: string): Promise<ITask | null> => {
    return await Task.findByIdAndDelete(id);
};
