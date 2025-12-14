import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectApi from '../api/project.api'

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
        mutationFn: ({ projectId, userId, role }: { projectId: string; userId: string; role: string }) =>
            projectApi.addMember(projectId, userId, role),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
    });
};
