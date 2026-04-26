import * as projectRepo from './project.repository.js';
import mongoose from 'mongoose';
import { User } from '../users/user.model.js';
import * as notificationService from '../notifications/notification.service.js';
import { AppError } from '../../utils/AppError.js';
export const createProject = async (title, description, userId) => {
    return await projectRepo.create({
        title,
        description,
        owner: new mongoose.Types.ObjectId(userId),
        members: [{ user: new mongoose.Types.ObjectId(userId), role: 'project_manager' }]
    });
};
export const getProjectById = async (projectId) => {
    return await projectRepo.findById(projectId);
};
export const getUserProjects = async (userId) => {
    return await projectRepo.findByMember(userId);
};
export const addMember = async (projectId, userId, role) => {
    return await projectRepo.addMember(projectId, userId, role);
};
export const removeMember = async (projectId, userId) => {
    // 1. Remove member from project
    const project = await projectRepo.removeMember(projectId, userId);
    // 2. Unassign tasks assigned to this user in this project
    const { Task } = await import('../tasks/task.model.js');
    await Task.updateMany({ projectId: projectId, assignedTo: userId }, { $unset: { assignedTo: 1 } });
    return project;
};
export const inviteUserToProject = async (projectId, email, senderId) => {
    // 1. Find user by email
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
        throw new AppError('User not found', 404);
    }
    const userId = userToInvite._id.toString();
    // 2. Check if already a member
    const project = await projectRepo.findByIdSimple(projectId);
    if (!project)
        throw new AppError('Project not found', 404);
    const isMember = project.members.some(m => m.user.toString() === userId);
    if (isMember)
        throw new AppError('User is already a member of this project', 400);
    // 3. Send Notification
    await notificationService.createNotification({
        recipient: userToInvite._id,
        sender: new mongoose.Types.ObjectId(senderId),
        type: 'PROJECT_INVITE',
        relatedId: project._id,
        message: `You have been invited to join the project: ${project.title}`,
        status: 'pending'
    });
    return { message: 'Invitation sent successfully' };
};
export const deleteProject = async (projectId, userId) => {
    // 1. Verify user is the owner
    const project = await projectRepo.findByIdSimple(projectId);
    if (!project) {
        throw new AppError('Project not found', 404);
    }
    if (project.owner.toString() !== userId) {
        throw new AppError('Only the project owner can delete this project', 403);
    }
    // 2. Delete all tasks associated with this project
    const { Task } = await import('../tasks/task.model.js');
    await Task.deleteMany({ project: projectId });
    // 3. Delete pending invitations (notifications) for this project
    const { Notification } = await import('../notifications/notification.model.js');
    await Notification.deleteMany({ relatedId: projectId, type: 'PROJECT_INVITE', status: 'pending' });
    // 4. Delete the project itself
    return await projectRepo.deleteById(projectId);
};
//# sourceMappingURL=project.service.js.map