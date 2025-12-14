import {type ReactNode } from 'react';
import { useAuthStore } from '../store/auth.store';

interface PermissionGuardProps {
    children: ReactNode;
    allowedRoles: string[];
    fallback?: ReactNode;
}

export const PermissionGuard = ({ children, allowedRoles, fallback = null }: PermissionGuardProps) => {
    const { user } = useAuthStore();

    if (!user || !allowedRoles.includes(user.role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
