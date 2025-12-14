import { Task } from './task.model.js';
export const createTask = async (data, userId) => {
    const task = new Task({ ...data, createdBy: userId, assignedTo: data.assignedTo || userId });
    return await task.save();
};
export const findTasks = async (filter) => {
    return await Task.find(filter).populate('assignedTo', 'username email').populate('createdBy', 'username email').sort({ createdAt: -1 });
};
export const findTaskById = async (id) => {
    return await Task.findById(id).populate('assignedTo', 'username email').populate('createdBy', 'username email');
};
export const updateTask = async (id, data) => {
    return await Task.findByIdAndUpdate(id, data, { new: true }).populate('assignedTo', 'username email').populate('createdBy', 'username email');
};
export const deleteTask = async (id) => {
    return await Task.findByIdAndDelete(id);
};
//# sourceMappingURL=task.repository.js.map