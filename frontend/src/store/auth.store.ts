import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth.api';

import type { User } from '../types/user';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            checkAuth: async () => {
                try {
                    const user = await authApi.getMe();
                    set({ user, isAuthenticated: true });
                } catch {
                    set({ user: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
