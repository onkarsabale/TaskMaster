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
    return await Project.findByIdAndUpdate(projectId, { $pull: { members: { user: userId } } }, { new: true });
};
//# sourceMappingURL=project.service.js.map