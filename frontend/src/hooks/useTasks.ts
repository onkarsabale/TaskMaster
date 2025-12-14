import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as taskApi from '../api/task.api';
import type { CreateTaskDto, UpdateTaskDto, TaskFilter } from '../types/task';

export const useTasks = (filter?: TaskFilter) => {
    return useQuery({
        queryKey: ['tasks', filter],
        queryFn: () => taskApi.getTasks(filter),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useTask = (id: string) => {
    return useQuery({
        queryKey: ['tasks', id],
        queryFn: () => taskApi.getTaskById(id),
        enabled: !!id,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTaskDto) => taskApi.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) => taskApi.updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => taskApi.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};
