import { Project } from './project.model.js';
import type { IProject } from './project.model.js';
import mongoose from 'mongoose';

export const create = async (data: Partial<IProject>): Promise<IProject> => {
    const project = new Project(data);
    return await project.save();
};

export const findById = async (id: string): Promise<IProject | null> => {
    return await Project.findById(id).populate('owner', 'username email').populate('members.user', 'username email');
};

export const findByMember = async (userId: string): Promise<IProject[]> => {
    return await Project.find({ 'members.user': userId })
        .populate('owner', 'username email')
        .sort({ updatedAt: -1 });
};

export const addMember = async (projectId: string, userId: string, role: 'project_manager' | 'project_member'): Promise<IProject | null> => {
    return await Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { members: { user: userId, role } } },
        { new: true }
    ).populate('members.user', 'username email');
};

export const removeMember = async (projectId: string, userId: string): Promise<IProject | null> => {
    return await Project.findByIdAndUpdate(
        projectId,
        { $pull: { members: { user: userId } } },
        { new: true }
    );
};

// Check if user is member without population (lighter weight)
export const isMember = async (projectId: string, userId: string): Promise<boolean> => {
    const project = await Project.exists({ _id: projectId, 'members.user': userId });
    return !!project;
};

export const findByIdSimple = async (id: string): Promise<IProject | null> => {
    return await Project.findById(id);
};
