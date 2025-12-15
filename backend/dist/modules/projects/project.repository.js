import { Project } from './project.model.js';
import mongoose from 'mongoose';
export const create = async (data) => {
    const project = new Project(data);
    return await project.save();
};
export const findById = async (id) => {
    return await Project.findById(id).populate('owner', 'username email').populate('members.user', 'username email');
};
export const findByMember = async (userId) => {
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
// Check if user is member without population (lighter weight)
export const isMember = async (projectId, userId) => {
    const project = await Project.exists({ _id: projectId, 'members.user': userId });
    return !!project;
};
export const findByIdSimple = async (id) => {
    return await Project.findById(id);
};
//# sourceMappingURL=project.repository.js.map