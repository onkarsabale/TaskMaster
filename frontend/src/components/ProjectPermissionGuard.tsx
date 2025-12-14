import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth.store';
import type { Project } from '../types/project';

interface ProjectPermissionGuardProps {
    children: ReactNode;
    project: Project;
    minRole?: 'project_member' | 'project_manager';
    fallback?: ReactNode;
}

export const ProjectPermissionGuard = ({ children, project, minRole = 'project_member', fallback = null }: ProjectPermissionGuardProps) => {
    const { user } = useAuthStore();

    if (!user) {
        return <>{fallback}</>;
    }

    // 1. Check Global Admin (always allow)
    if (user.role === 'admin') {
        return <>{children}</>;
    }

    // 2. Check Project Membership
    const member = project.members.find(m => m.user._id === user._id);

    if (!member) {
        return <>{fallback}</>;
    }

    // 3. Check Role Level
    if (minRole === 'project_manager' && member.role !== 'project_manager') {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
