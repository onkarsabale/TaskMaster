import { Project } from './project.model.js';
import mongoose from 'mongoose';
export const createProject = async (title, description, userId) => {
    const project = new Project({
        title,
        description,
        owner: userId,
        members: [{ user: userId, role: 'project_manager' }] // Owner is PM by default
    });
    return await project.save();
};
export const getProjectById = async (projectId) => {
    return await Project.findById(projectId).populate('owner', 'username email').populate('members.user', 'username email');
};
export const getUserProjects = async (userId) => {
    return await Project.find({ 'members.user': userId })
        .populate('owner', 'username email')
        .sort({ updatedAt: -1 });
};
export const addMember = async (projectId, userId, role) => {
    return await Project.findByIdAndUpdate(projectId, { $addToSet: { members: { user: userId, role } } }, { new: true }).populate('members.user', 'username email');
};
export const removeMember = async (projectId, userId) => {
    // 1. Remove member from project
    const project = await Project.findByIdAndUpdate(projectId, { $pull: { members: { user: userId } } }, { new: true });
    // 2. Unassign tasks assigned to this user in this project
    // We need to import Task model to do this. Ideally, we shouldn't create circular dependency...
    // But since Task depends on Project, Project depends on Task (conceptually), we might need to be careful.
    // Better way: Import Task model directly here or use a service method if circular dep is an issue.
    // Let's use mongoose model directly to avoid service cycle if any.
    // Dynamic import to avoid circular dependency if Task Service imports Project Service
    const { Task } = await import('../tasks/task.model.js');
    await Task.updateMany({ projectId: projectId, assignedTo: userId }, { $unset: { assignedTo: 1 } } // Remove field or set to null? Schema says assignedTo is optional ObjectId. $unset removes it.
    );
    return project;
};
//# sourceMappingURL=project.service.js.map