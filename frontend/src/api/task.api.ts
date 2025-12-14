import api from './client';
import type { CreateTaskDto, UpdateTaskDto, TaskFilter } from '../types/task';

export const getTasks = async (filter?: TaskFilter) => {
    const response = await api.get('/tasks', { params: filter });
    return response.data;
};

export const getTaskById = async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
};

export const createTask = async (data: CreateTaskDto) => {
    const response = await api.post('/tasks', data);
    return response.data;
};

export const updateTask = async (id: string, data: UpdateTaskDto) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
};

export const deleteTask = async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};
