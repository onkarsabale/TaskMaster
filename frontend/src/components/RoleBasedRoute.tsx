import {type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface RoleBasedRouteProps {
    allowedRoles: ('admin' | 'manager' | 'user')[];
    children?: ReactNode;
}

export const RoleBasedRoute = ({ allowedRoles, children }: RoleBasedRouteProps) => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
