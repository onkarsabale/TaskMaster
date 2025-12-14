import { type User } from './user';

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignedTo?: User | string;
    project?: string;
    createdBy: User | string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: 'pending' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignedTo?: string;
    project?: string;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface TaskFilter {
    status?: string;
    priority?: string;
    assignedTo?: string;
    project?: string;
    createdBy?: string;
}
