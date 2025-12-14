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
