import api from './client';
import type { Project } from '../types/project';

export const getProjects = async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const createProject = async (data: { title: string; description?: string }): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
};

export const addMember = async (projectId: string, userId: string, role: string): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/members`, { userId, role });
    return response.data;
};

export const removeMember = async (projectId: string, userId: string): Promise<Project> => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
};
