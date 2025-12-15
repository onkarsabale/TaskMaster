import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as projectApi from '../api/project.api';
import api from '../api/client';
import { useToast } from './useToast';

export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: projectApi.getProjects,
        staleTime: 1000 * 60 * 5,
    });
};

export const useProject = (id: string) => {
    return useQuery({
        queryKey: ['project', id],
        queryFn: () => projectApi.getProjectById(id),
        enabled: !!id,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: projectApi.createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};

export const useAddMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ projectId, userId, role }: { projectId: string; userId: string; role: string }) => {
            const { data } = await api.post(`/projects/${projectId}/members`, { userId, role });
            return data;
        },
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects', 'my'] });
        },
    });
};

export const useInviteMember = () => {
    // queryClient not needed for invite as it doesn't immediately update project state (pending state is in notifications)
    const { showToast } = useToast();
    return useMutation({
        mutationFn: async ({ projectId, email }: { projectId: string; email: string }) => {
            const { data } = await api.post(`/projects/${projectId}/invite`, { email });
            return data;
        },
        onSuccess: () => {
            showToast('Invitation sent successfully', 'success');
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const msg = error.response?.data?.message || 'Failed to send invite';
            showToast(msg, 'error');
        }
    });
};
